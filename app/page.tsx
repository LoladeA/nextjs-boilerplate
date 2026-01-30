import { supabase } from '../lib/supabase'

export default async function Home() {
  // Fetch data from Supabase
  const { data, error } = await supabase
    .from('app_pages') // <-- replace with your table
    .select('*')

  if (error) {
    console.error(error)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>My SaaS MVP 🚀</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
