export default function Footer() {
  return (
    <footer className="px-6 py-16 border-t border-[#c9ccbb]/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-40 text-[#c9ccbb] text-[10px] uppercase tracking-[0.4em]">
        <div className="mb-6 md:mb-0">
          <p className="font-semibold mb-2 tracking-[0.5em]">The Sentient Home</p>
          <p>© 2026 — All Rights Reserved.</p>
        </div>
        
        <div className="text-center max-w-xs mb-6 md:mb-0">
          <p className="leading-relaxed">
            Residential Spaces Designed for Clarity, Agency, and Nervous System Safety.
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-2">
          <span className="text-[#b5a642]">NeuroDesign™ Methodology</span>
          <span>Neuroscience-Led Interior Research</span>
        </div>
      </div>
    </footer>
  )
}
