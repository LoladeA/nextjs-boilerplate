import { supabase } from '../lib/supabase'

type AppPageSection = {
  id: string
  page_slug: string
  section_key: string
  section_order: number
  metadata: {
    title?: string
    subtitle?: string
    content?: string
    image_url?: string
    button_text?: string
    button_link?: string
  }
}

export default async function Home() {
  const { data, error } = await supabase
    .from<AppPageSection>('app_page_sections')
    .select('*')
    .eq('page_slug', 'home')
    .order('section_order', { ascending: true })

  if (error) {
    console.error(error)
  }

  return (
    <div className="min-h-screen bg-green-900 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
          The Home Is Your Nervous System&apos;s Second Skin
        </h1>
      </section>

      {/* Dynamic Sections from DB */}
      {data?.map((section) => (
        <section
          key={section.id}
          className="max-w-5xl mx-auto my-12 p-8 bg-white rounded-xl shadow-lg"
        >
          {section.metadata.title && (
            <h2 className="text-3xl font-bold mb-2 text-gray-900">{section.metadata.title}</h2>
          )}
          {section.metadata.subtitle && (
            <h3 className="text-xl text-gray-700 mb-4">{section.metadata.subtitle}</h3>
          )}
          {section.metadata.image_url && (
            <img
              src={section.metadata.image_url}
              alt={section.metadata.title || 'Section Image'}
              className="w-full h-auto mb-4 rounded-lg"
            />
          )}
          {section.metadata.content && (
            <p className="text-gray-800 mb-4">{section.metadata.content}</p>
          )}
          {section.metadata.button_text && section.metadata.button_link && (
            <a
              href={section.metadata.button_link}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {section.metadata.button_text}
            </a>
          )}
        </section>
      ))}
    </div>
  )
}
