import Sidebar from '../components/Sidebar'

export default function Settings() {
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-12 text-[#c9ccbb]">
        <h1 className="text-3xl font-serif mb-4">Settings</h1>
        <p className="opacity-60">Profile and subscription management coming soon.</p>
      </div>
    </div>
  )
}
