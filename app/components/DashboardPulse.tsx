'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ScriptableContext
} from 'chart.js'
import { useEffect, useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

export default function DashboardPulse({ logs = [] }: { logs: any[] }) {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    // 1. GENERATE LAST 14 DAYS (ROLLING WINDOW)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return d.toLocaleDateString('en-CA') 
    })

    // 2. NORMALIZE DATA
    const normalizedScores = []
    
    // Sort logs by time ascending
    const sortedLogs = [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Start with middle baseline (3 is neutral in 1-5 scale)
    let lastKnownScore = 3 
    if (sortedLogs.length > 0) {
       const firstChartDay = new Date(last14Days[0])
       const olderLogs = sortedLogs.filter(l => new Date(l.created_at) < firstChartDay)
       if (olderLogs.length > 0) {
          lastKnownScore = olderLogs[olderLogs.length - 1].mood_score
       } else if (sortedLogs.length > 0) {
          const firstLogDate = new Date(sortedLogs[0].created_at).toLocaleDateString('en-CA')
          if (last14Days.includes(firstLogDate)) {
             lastKnownScore = sortedLogs[0].mood_score 
          }
       }
    }

    for (const dateStr of last14Days) {
      const logForDay = sortedLogs.find(l => {
         const localLogDate = new Date(l.created_at).toLocaleDateString('en-CA')
         return localLogDate === dateStr
      })
      
      if (logForDay) {
        lastKnownScore = logForDay.mood_score
        normalizedScores.push(lastKnownScore)
      } else {
        normalizedScores.push(lastKnownScore)
      }
    }

    // 3. BUILD CHART DATA
    setChartData({
      labels: last14Days.map((date) => {
        const parts = date.split('-')
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        return d.toLocaleDateString('en-US', { weekday: 'narrow' }) 
      }),
      datasets: [
        {
          label: 'Neuro-State',
          data: normalizedScores,
          borderColor: '#b5a642',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 300)
            // 🟢 VISUAL FIX: Stronger Gradient for "Live Signal" look
            gradient.addColorStop(0, 'rgba(181, 166, 66, 0.6)') 
            gradient.addColorStop(1, 'rgba(181, 166, 66, 0.0)') 
            return gradient
          },
          // 🟢 VISUAL FIX: Higher tension for organic waves
          tension: 0.5, 
          pointBackgroundColor: '#1b270e',
          pointBorderColor: '#b5a642',
          pointBorderWidth: 1, 
          pointRadius: 3,      
          fill: true,
        },
      ],
    })
  }, [logs])

  if (!chartData) return <div className="w-full h-full flex items-center justify-center text-[#c9ccbb]/20 text-xs">Loading Rhythm...</div>

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1b270e',
        titleColor: '#b5a642',
        bodyColor: '#c9ccbb',
        borderColor: 'rgba(201, 204, 187, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
            label: (context: any) => `State Score: ${context.raw}`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
            color: 'rgba(201, 204, 187, 0.4)', 
            font: { size: 9 }, 
            maxRotation: 0,
            autoSkip: false 
        },
      },
      y: {
        display: false,
        // 🟢 CRITICAL FIX: Scale set to 1-6 (Mood Range)
        min: 1,
        max: 6, 
      },
    },
  }

  return <Line data={chartData} options={options} />
}
