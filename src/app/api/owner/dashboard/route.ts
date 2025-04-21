/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import moment from "moment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  const factory_id = searchParams.get("factory_id");
  const where: any = {};

  if (factory_id) {
    where.factory_id = Number(factory_id);
  }

  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  if (startDate && endDate) {
    where.created_at = {
      gte: moment(startDate).startOf("day").toDate(),
      lte: moment(endDate).endOf("day").toDate(),
    };
  }
  try {
    const response = await prisma.$transaction(async (tx) => {
      const total_production = await tx.reportProduct.aggregate({
        _sum: {
          afternoon_shift_amount: true,
          morning_shift_amount: true,
        },
        where,
      });

      const total_product = await tx.product.count({
        where: {
          factory_id: Number(factory_id),
        },
      });

      const total_operator = await tx.user.count({
        where: {
          memberFactories: {
            some: {
              factory_id: Number(factory_id),
            },
          },
        },
      });

      const total_order_today = await tx.invoice.count({
        where: {
          factory_id: Number(factory_id),
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      });

      const total_invoice_pending = await tx.invoice.count({
        where: {
          payment_status: "Pending",
          ...where,
        },
      });

      const total_income = await tx.invoice.aggregate({
        _sum: {
          total: true,
        },
        where: {
          ...where,
          payment_status: {
            in: ["Paid", "Paid_Off"],
          },
        },
      });

      const total_income_service = await tx.transactionService.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          ...where,
          status: {
            in: ["Paid", "Paid_Off"],
          },
        },
      });

      const total_order_bahan_baku = await tx.orderMaterialUnit.aggregate({
        _sum: {
          price: true,
        },
        where: {
          ...where,
          status: "Pending",
        },
      });

      const payment_methods = await tx.paymentMethod.findMany();

      const payment_method = await tx.invoice.groupBy({
        by: ["payment_method_id"],
        _count: {
          payment_method_id: true,
        },
        where: {
          ...where,
        },
      });

      // buatkan saya grafik penjualan selama satu tahun dan group by bulan menggunakan bulan dan tahun menggunakan raw query

      const total_income_year: any[] = await tx.$queryRaw`
        SELECT MONTH(created_at) AS month, YEAR(created_at) AS year, SUM(total) AS total, SUM(remaining_balance) AS remaining_balance
        FROM invoices
        WHERE factory_id = ${factory_id} AND payment_status IN ('Paid', 'Paid_Off')
        AND created_at >= ${new Date(
          new Date().setFullYear(new Date().getFullYear() - 1)
        )}
        AND created_at <= ${new Date(
          new Date().setFullYear(new Date().getFullYear())
        )}
        GROUP BY month, year
      `;

      const total_income_year_service: any[] = await tx.$queryRaw`
        SELECT MONTH(created_at) AS month, YEAR(created_at) AS year, SUM(amount) AS total, SUM(remaining_balance) AS remaining_balance
        FROM transaction_services
        WHERE factory_id = ${factory_id} AND status IN ('Paid', 'Paid_Off')
        AND created_at >= ${new Date(
          new Date().setFullYear(new Date().getFullYear() - 1)
        )}
        AND created_at <= ${new Date(
          new Date().setFullYear(new Date().getFullYear())
        )}
        GROUP BY month, year
      `;

      const bulans = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      // buatkan saya jumlah penjualan produk perproduk selama perhari selama start date dan end date
      // date format yyyy-mm-dd
      const total_income_day: any[] = await tx.$queryRaw`
        SELECT product_id, DATE(created_at) AS tanggal, COUNT(detail_invoices.id) AS jumlah_penjualan
        FROM invoices JOIN detail_invoices ON invoices.id = detail_invoices.invoice_id
        WHERE factory_id = ${factory_id} AND payment_status IN ('Paid', 'Paid_Off')
        AND DATE(created_at) >= ${
          new Date(startDate).toISOString().split("T")[0]
        } AND DATE(created_at) <= ${
        new Date(endDate).toISOString().split("T")[0]
      }
        GROUP BY product_id, DATE(created_at)
      `;

      const result_annual_income: any[] = [];
      for (let i = 0; i < 12; i++) {
        const exist = total_income_year.find(
          (item: any) => item.month === i + 1
        );
        if (exist) {
          result_annual_income.push({
            month: bulans[i],
            year: exist.year,
            pendapatan: exist.total - exist.remaining_balance,
          });
        } else {
          result_annual_income.push({
            month: bulans[i],
            year: new Date().getFullYear(),
            pendapatan: 0,
          });
        }
      }

      result_annual_income.map((item: any) => {
        const exist_service = total_income_year_service.find(
          (item_service: any) =>
            item_service.month === bulans.indexOf(item.month) + 1
        );
        if (exist_service) {
          item.pendapatan_service =
            exist_service.total - exist_service.remaining_balance;
        } else {
          item.pendapatan_service = 0;
        }
      });

      const products = await tx.product.findMany({
        where: {
          factory_id: Number(factory_id),
        },
      });

      const total_days = moment(endDate).diff(moment(startDate), "days");
      const product_day: any[] = [];
      for (let i = 0; i < total_days; i++) {
        const date = moment(startDate).add(i, "days").format("YYYY-MM-DD");
        const exist = total_income_day.filter(
          (item: any) => moment(item.tanggal).format("YYYY-MM-DD") === date
        );

        const items: any[] = [];
        products.map((product: any) => {
          const exist_product = exist.find(
            (item: any) => item.product_id === product.id
          );
          if (exist_product) {
            items.push({
              [product.name]: `${exist_product.jumlah_penjualan}`,
            });
          } else {
            items.push({
              [product.name]: "0",
            });
          }
        });
        product_day.push({
          tanggal: date,
          // jadikan items menjadi object
          ...items.reduce((acc: any, item: any) => {
            acc[Object.keys(item)[0]] = item[Object.keys(item)[0]];
            return acc;
          }, {}),
        });
      }

      // jumlah produksi perhari bulan ini
      const this_month = moment().month();
      const this_year = moment().year();
      const total_days_this_month = moment().daysInMonth();
      const total_production_this_month: any[] = await tx.$queryRaw`
        SELECT DATE(created_at) AS tanggal, SUM(afternoon_shift_amount) + SUM(morning_shift_amount) AS total_produksi, products.name, products.id, report_products.product_id
        FROM report_products JOIN products ON report_products.product_id = products.id
        WHERE report_products.factory_id = ${factory_id} AND MONTH(report_products.created_at) = ${
        this_month + 1
      } AND YEAR(report_products.created_at) = ${this_year}
        GROUP BY DATE(report_products.created_at), products.id
      `;

      const total_production_this_month_result: any[] = [];
      for (let i = 1; i <= total_days_this_month; i++) {
        const date = moment().date(i).format("YYYY-MM-DD");
        const exist = total_production_this_month.filter(
          (item: any) => moment(item.tanggal).format("YYYY-MM-DD") == date
        );
        const items: any[] = [];
        products.map((product: any) => {
          const exist_product = exist.find(
            (item: any) => item.product_id === product.id
          );
          if (exist_product) {
            items.push({
              [product.name]: exist_product.total_produksi,
            });
          } else {
            items.push({
              [product.name]: 0,
            });
          }
        });
        total_production_this_month_result.push({
          tanggal: date,
          ...items.reduce((acc: any, item: any) => {
            acc[Object.keys(item)[0]] = item[Object.keys(item)[0]];
            return acc;
          }, {}),
        });
      }

      // jumlah remaining balance perbulan
      const total_remaining_balance_perbulan: any[] = await tx.$queryRaw`
        SELECT MONTH(created_at) AS month, YEAR(created_at) AS year, SUM(remaining_balance) AS total_remaining_balance
        FROM invoices
        WHERE factory_id = ${factory_id} AND payment_status IN ('Paid', 'Paid_Off')
        GROUP BY month, year
      `;

      const total_remaining_balance_perbulan_result: any[] = [];
      for (let i = 1; i <= 12; i++) {
        const exist = total_remaining_balance_perbulan.find(
          (item: any) => item.month === i
        );
        if (exist) {
          total_remaining_balance_perbulan_result.push({
            month: bulans[i - 1],
            year: exist.year,
            total_remaining_balance: exist.total_remaining_balance,
          });
        } else {
          total_remaining_balance_perbulan_result.push({
            month: bulans[i - 1],
            year: new Date().getFullYear(),
            total_remaining_balance: 0,
          });
        }
      }

      const payment_method_result: any[] = [];
      const total_payment_result = payment_method.reduce((acc: any, item: any) => {
        acc += item._count.payment_method_id;
        return acc;
      }, 0);
      payment_method.map((item: any) => {
        payment_method_result.push({
          payment_method_name: payment_methods.find(
            (payment_method: any) => payment_method.id === item.payment_method_id
          )?.name,
          total_payment_method: Math.round(item._count.payment_method_id * 100/ total_payment_result),
        });
      });

      return {
        total_production:
          (total_production._sum.afternoon_shift_amount || 0) +
          (total_production._sum.morning_shift_amount || 0),
        total_product: total_product,
        total_operator: total_operator,
        total_order_today: total_order_today,
        total_invoice_pending: total_invoice_pending,
        total_income: total_income._sum.total || 0,
        total_income_service: total_income_service._sum.amount || 0,
        total_order_bahan_baku: total_order_bahan_baku._sum.price || 0,
        payment_method: payment_method_result,
        total_income_year: result_annual_income,
        product_day: product_day,
        total_production_this_month: total_production_this_month_result,
        total_remaining_balance_perbulan:
          total_remaining_balance_perbulan_result,
      };
    });

    return NextResponse.json({
      status: "success",
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
    });
  }
}
