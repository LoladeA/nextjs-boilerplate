export default function MetricCard({ title, value, subtext }: { title: string, value: string | number, subtext?: string }) {
  return (
    <div className="bg-[#c9ccbb]/5 border border-[#c9ccbb]/10 p-6 rounded-2xl flex flex-col justify-between h-full">
      <h3 className="text-[#c9ccbb]/60 text-xs uppercase tracking-widest mb-2">{title}</h3>
      <div className="text-3xl font-serif text-[#b5a642] mb-1">{value}</div>
      {subtext && <p className="text-xs text-[#c9ccbb]/40 italic">{subtext}</p>}
    </div>
  )
}
