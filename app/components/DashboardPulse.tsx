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
      // Subtract (13 - i) so the last item (i=13) is "Today"
      d.setDate(d.getDate() - (13 - i))
      // Force Local Time String (YYYY-MM-DD)
      return d.toLocaleDateString('en-CA') 
    })

    // 2. NORMALIZE DATA (GAP FILLING)
    const normalizedScores = []
    
    // Sort logs by time ascending
    const sortedLogs = [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Start with middle baseline (50) or the last known score from history
    let lastKnownScore = 50 
    if (sortedLogs.length > 0) {
       // Find the most recent log BEFORE the 14-day window starts
       const firstChartDay = new Date(last14Days[0])
       const olderLogs = sortedLogs.filter(l => new Date(l.created_at) < firstChartDay)
       if (olderLogs.length > 0) {
          lastKnownScore = olderLogs[olderLogs.length - 1].mood_score
       } else if (sortedLogs.length > 0) {
          // If no older logs, check if the first log is within our window
          // If the very first log is inside the window, use its value (don't default to 50)
          const firstLogDate = new Date(sortedLogs[0].created_at).toLocaleDateString('en-CA')
          if (last14Days.includes(firstLogDate)) {
             // We will let the loop handle it, but initial 'lastKnownScore' acts as the pre-history state
             lastKnownScore = sortedLogs[0].mood_score 
          }
       }
    }

    for (const dateStr of last14Days) {
      // Find log for this specific day (Local Time Match)
      const logForDay = sortedLogs.find(l => {
         const localLogDate = new Date(l.created_at).toLocaleDateString('en-CA')
         return localLogDate === dateStr
      })
      
      if (logForDay) {
        lastKnownScore = logForDay.mood_score
        normalizedScores.push(lastKnownScore)
      } else {
        // GAP: Carry forward the previous state
        normalizedScores.push(lastKnownScore)
      }
    }

    // 3. BUILD CHART DATA
    setChartData({
      labels: last14Days.map((date, index) => {
        // Parse date safely
        const parts = date.split('-')
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        
        // Show Day Name for every other day to avoid cluttering the X-axis
        // OR show all if on desktop. Let's show abbreviated day + date (e.g., "Mon 12")
        // But for cleaner look, just the weekday letter might be best.
        // Let's stick to standard Weekday:
        return d.toLocaleDateString('en-US', { weekday: 'narrow' }) // "M", "T", "W" - cleaner for 14 points
      }),
      datasets: [
        {
          label: 'Neuro-State',
          data: normalizedScores,
          borderColor: '#b5a642',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 300)
            gradient.addColorStop(0, 'rgba(181, 166, 66, 0.4)') // Gold
            gradient.addColorStop(1, 'rgba(181, 166, 66, 0.0)') // Transparent
            return gradient
          },
          tension: 0.4, // Smooth organic curve
          pointBackgroundColor: '#1b270e',
          pointBorderColor: '#b5a642',
          pointBorderWidth: 1, // Thinner points for 14-day view
          pointRadius: 3,      // Smaller points
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
            font: { size: 9 }, // Smaller font for 14 days
            maxRotation: 0,
            autoSkip: false // Force show all 14 points
        },
      },
      y: {
        display: false,
        min: 0,
        max: 100,
      },
    },
  }

  return <Line data={chartData} options={options} />
}
