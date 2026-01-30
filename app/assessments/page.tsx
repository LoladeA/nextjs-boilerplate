'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

export default function AssessmentsPage() {
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    async function loadSections() {
      const { data } = await supabaseBrowser
        .from('app_page_sections')
        .select('*')
        .order('section_order', { ascending: true })
      setSections(data || [])
    }
    loadSections()
  }, [])

  return (
    <div className="min-h-screen p-6 bg-green-900 text-cfc993">
      <h1 className="text-3xl font-semibold mb-4">Assessments</h1>
      {sections.length === 0 ? (
        <p>Loading sections...</p>
      ) : (
        sections.map((section) => (
          <div
            key={section.id}
            className="bg-[#6d6f52] p-4 mb-4 rounded-lg text-[#c9ccbb]"
          >
            <h2 className="font-semibold">{section.section_key}</h2>
            <pre>{JSON.stringify(section.metadata, null, 2)}</pre>
          </div>
        ))
      )}
    </div>
  )
}
