export default function IndiaFlag({ className = 'w-4 h-2.5' }: { className?: string }) {
  return (
    <span
      className={`inline-flex rounded-[2px] overflow-hidden shadow-xs border border-white/20 shrink-0 ${className}`}
      title="Republic of India"
    >
      <span className="h-full w-1/3 bg-[#FF9933]" />
      <span className="h-full w-1/3 bg-white flex items-center justify-center">
        <span className="w-1 h-1 rounded-full bg-[#000080]" />
      </span>
      <span className="h-full w-1/3 bg-[#138808]" />
    </span>
  );
}
