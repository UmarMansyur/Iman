'use client' // if you use app dir, don't forget this line

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


export function SalesChart(){
    const option: ApexOptions = {
      chart: {
        height: '100%',
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        },
        parentHeightOffset: 0,
      },
      colors: ['#1d4ed8'],
    
      title: {
        text: 'Penjualan & Pendapatan',
        align: 'left',
        style: {
          fontSize: '24px',
          fontWeight: '600',
        }
      },
      grid: {
        show: true,
        borderColor: '#f1f5f9', // slate-100
        strokeDashArray: 4,
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: '#64748b', // slate-500
            fontSize: '14px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#64748b', // slate-500
            fontSize: '14px'
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        markers: {
          size: 10,
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        style: {
          fontSize: '14px'
        },
        y: {
          formatter: function (value: number) {
            return value.toString();
          }
        }
      }
    };

    const series = [{
        name: 'Penjualan',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 72, 68, 74]
      }]

    return(
        <>
          <ApexChart 
            options={option} 
            series={series}  
          />
        </>
    )
    
}