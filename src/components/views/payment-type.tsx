'use client' // if you use app dir, don't forget this line

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


export function PaymentTypeChart() {
    const option: ApexOptions = {
      chart: {
        type: 'donut',
        height: "100%",
        width: "100%",
        toolbar: {
          show: false
        },
      },
      colors: ['#3B82F6', '#FEC53D', '#4AD991', '#FF9066'],
     
      title: {
        text: 'Metode Pembayaran',
        // align: 'center',
        align: 'left',
        margin: 10,
        style: {
          fontSize: '24px',
          fontWeight: '600',
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
      },
      labels: ['Cash', 'Transfer Bank', 'E-Wallet', 'Kartu Kredit'],
      tooltip: {
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function(value: number) {
            return value + '%';
          }
        }
      }
    };

    const series = [35, 25, 30, 10];  // Persentase untuk setiap metode pembayaran

    return (
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <ApexChart 
            options={option} 
            series={series} 
            type="donut"
            height={400} 
          />
        </div>
    )
}