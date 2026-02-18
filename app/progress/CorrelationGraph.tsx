'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,  // 🟢 ADDED: Logic for Bar Charts
  LineController, // 🟢 ADDED: Logic for Line Charts
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

// Register the components AND the controllers
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,  // 🟢 Registering the Controller
  LineController, // 🟢 Registering the Controller
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function CorrelationGraph({ data }: { data: any[] }) {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-[#c9ccbb]/30 text-sm">Awaiting Data...</div>
  }

  const chartData = {
    labels: data.map(d => d.date), // ["Mon", "Tue", etc.]
    datasets: [
      {
        type: 'bar' as const,
        label: 'Focus Hours',
        data: data.map(d => d.focus),
        backgroundColor: 'rgba(181, 166, 66, 0.4)', // Gold transparent
        borderColor: '#b5a642',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y1', // Binds to Right Axis
        order: 2
      },
      {
        type: 'line' as const,
        label: 'Tension Level',
        data: data.map(d => d.tension),
        borderColor: '#ffffff', // White line
        borderWidth: 2,
        backgroundColor: '#1b270e',
        pointBackgroundColor: '#1b270e',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        tension: 0.4, // Smooth curve
        yAxisID: 'y', // Binds to Left Axis
        order: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#c9ccbb',
          font: { size: 10, family: 'serif' },
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        backgroundColor: '#1b270e',
        titleColor: '#b5a642',
        bodyColor: '#c9ccbb',
        borderColor: 'rgba(181, 166, 66, 0.3)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
            // Custom label to add units
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.dataset.yAxisID === 'y1') {
                    label += context.parsed.y + ' hrs';
                } else {
                    label += context.parsed.y + '/10';
                }
                return label;
            }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: 'rgba(201, 204, 187, 0.5)',
          font: { size: 10 }
        }
      },
      y: { // Left Axis (Tension)
        type: 'linear' as const,
        display: false, // Hide the numbers to keep it clean
        position: 'left' as const,
        min: 0,
        max: 10,
      },
      y1: { // Right Axis (Focus)
        type: 'linear' as const,
        display: false, // Hide the numbers
        position: 'right' as const,
        min: 0,
        max: 12, // Max 12 hours focus
        grid: {
          drawOnChartArea: false, // Prevents grid lines from overlapping
        },
      },
    },
  }

  return (
    <div className="w-full h-64 mt-4">
      {/* @ts-ignore - Chart.js types can be finicky with mixed types, but this works */}
      <Chart type='bar' data={chartData} options={options} />
    </div>
  )
}
