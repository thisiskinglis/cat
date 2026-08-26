export default function Header({ memberNo }) {
  return (
    <header className="h-[64px] shrink-0 flex items-center justify-between px-5 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-[2px]">
        <span className="syne font-[800] tracking-[-0.03em] text-[17px] leading-none">CRESCITA</span>
        <span className="syne font-[600] tracking-[0.12em] text-[10px] mt-[1px] opacity-40">COLLECTIVE</span>
      </div>
      <div className="h-[32px] px-[14px] rounded-full border border-black/[0.08] flex items-center gap-2 bg-white">
        <div className="w-[6px] h-[6px] rounded-full bg-[#00E676] animate-pulse" />
        <span className="text-[11px] font-[600] tracking-[0.08em]">MEMBER #{memberNo}</span>
      </div>
    </header>
  );
}
