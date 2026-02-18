'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  BarController, LineController, Title, Tooltip, Legend, Filler
)

export default function CorrelationGraph({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-[#c9ccbb]/30 text-sm">Awaiting Data...</div>
  }

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      // 1. THE MOOD WAVE (Restored Original Look)
      {
        type: 'line' as const,
        label: 'Neuro-State', // The Mood Score
        data: data.map(d => d.mood),
        borderColor: '#b5a642', // Gold Border
        backgroundColor: (context: any) => {
           const ctx = context.chart.ctx
           const gradient = ctx.createLinearGradient(0, 0, 0, 300)
           gradient.addColorStop(0, 'rgba(181, 166, 66, 0.5)') // Gold Top
           gradient.addColorStop(1, 'rgba(181, 166, 66, 0.0)') // Fade to clear
           return gradient
        },
        fill: true,
        tension: 0.4, // Smooth curve
        pointRadius: 3,
        pointBackgroundColor: '#1b270e',
        pointBorderColor: '#b5a642',
        order: 3, // Render at the back
        yAxisID: 'y_mood', // Separate Axis to keep the wave nice and big
      },
      // 2. FOCUS BARS (The New Metric)
      {
        type: 'bar' as const,
        label: 'Deep Work',
        data: data.map(d => d.focus),
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle White Bars
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 8,
        yAxisID: 'y_focus',
        order: 2
      },
      // 3. TENSION LINE (The New Metric)
      {
        type: 'line' as const,
        label: 'Tension',
        data: data.map(d => d.tension),
        borderColor: '#ffffff', // Stark White Line
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line to distinguish from Mood
        pointRadius: 0, // No dots to keep it clean
        tension: 0.4,
        yAxisID: 'y_tension',
        order: 1 // Render at the front
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
        labels: { color: '#c9ccbb', font: { size: 10, family: 'serif' }, boxWidth: 8, usePointStyle: true }
      },
      tooltip: {
        backgroundColor: '#1b270e',
        titleColor: '#b5a642',
        bodyColor: '#c9ccbb',
        borderColor: 'rgba(181, 166, 66, 0.3)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                // Add units based on the metric
                if (label.includes('Deep Work')) label += context.parsed.y + ' hrs';
                else if (label.includes('Tension')) label += context.parsed.y + '/10';
                else label += context.parsed.y + '/5'; // Mood
                return label;
            }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(201, 204, 187, 0.5)', font: { size: 10 } }
      },
      // AXIS 1: MOOD (Hidden, scaled 1-5)
      y_mood: {
        type: 'linear' as const,
        display: false,
        position: 'left' as const,
        min: 1,
        max: 6, // Keep slightly higher so wave doesn't hit top
      },
      // AXIS 2: TENSION (Hidden, scaled 0-10)
      y_tension: {
        type: 'linear' as const,
        display: false,
        position: 'left' as const,
        min: 0,
        max: 12,
        grid: { drawOnChartArea: false },
      },
      // AXIS 3: FOCUS (Hidden, scaled 0-12)
      y_focus: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
        min: 0,
        max: 14,
        grid: { drawOnChartArea: false },
      },
    },
  }

  return (
    <div className="w-full h-full mt-4">
      {/* @ts-ignore */}
      <Chart type='bar' data={chartData} options={options} />
    </div>
  )
}
