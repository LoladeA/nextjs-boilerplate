'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { NeuroReportPDF } from '@/app/reports/NeuroReportPDF'
import { useState, useEffect } from 'react'

export default function DownloadButton({ data }: { data: any }) {
  const [isClient, setIsClient] = useState(false)

  // Hydration fix: PDF generation only works in the browser
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <button className="flex items-center gap-2 px-6 py-3 bg-[#b5a642]/10 text-[#b5a642] rounded-lg text-sm font-medium opacity-50 cursor-wait">
        <Download size={16} /> Preparing PDF...
      </button>
    )
  }

  return (
    <PDFDownloadLink
      document={
        <NeuroReportPDF 
          displayName={data.displayName}
          score={data.score}
          systemState={data.systemState}
          profile={data.profile}
          domains={data.domains}
        />
      }
      fileName={`SentientHome_Report.pdf`}
      className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all group"
    >
      {/* @ts-ignore */}
      {({ loading }: any) => (
        <>
          <Download size={16} className="text-[#b5a642] group-hover:scale-110 transition-transform" />
          {loading ? 'Generating...' : 'Download Report'}
        </>
      )}
    </PDFDownloadLink>
  )
}
