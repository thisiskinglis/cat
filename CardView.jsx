// Deterministic pseudo-QR pattern derived from the member number, purely decorative.
function buildQrCells(memberNo) {
  const n = parseInt(memberNo, 10) || 0;
  return Array.from({ length: 36 }).map((_, i) => {
    const pseudoRandom =
      (n * (i + 3)) % 7 > 2 ||
      [0, 1, 2, 5, 6, 7, 12, 13, 18, 19, 24, 25, 30, 31].includes(i) ||
      [5, 11, 17, 23, 29, 35].includes(i);
    const frameCell = i < 3 || (i % 6 < 3 && i < 18) || (i >= 30 && i % 6 < 3);
    return frameCell || pseudoRandom;
  });
}

export default function CardView({ memberNo, onAction }) {
  const shareUrl = `https://collective.crescita.co.za?ref=${memberNo}`;
  const qrCells = buildQrCells(memberNo);

  return (
    <div className="px-5 pt-6 pb-10 flex flex-col items-center max-w-full overflow-hidden">
      <div className="w-full rounded-[36px] bg-black text-white p-[26px] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.08)_inset] mt-2 max-w-full">
        <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] max-w-[90%] rounded-full bg-white/[0.07] blur-[60px]" />
        <div className="absolute -bottom-[100px] -right-[40px] w-[220px] h-[220px] rounded-full bg-[#00E676]/[0.08] blur-[50px]" />

        <div className="relative flex flex-col min-h-[500px] sm:min-h-[540px] max-w-full overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="syne text-[11px] tracking-[0.2em] font-[700] opacity-60">CRESCITA</span>
            <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10" />
          </div>

          <div className="mt-[56px]">
            <p className="syne text-[12px] tracking-[0.24em] font-[600] opacity-40 mb-4">BY GRACE WE GROW</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[16px] font-[500] tracking-[0.08em] opacity-50 -translate-y-6">MEMBER</span>
              <span className="syne font-[800] tracking-[-0.06em] leading-[0.85] text-[72px] sm:text-[84px]">
                #{memberNo}
              </span>
            </div>
            <p className="mt-3 text-[12px] tracking-[0.18em] opacity-30 font-[500]">
              THROUGH UBUNTU — FOUNDER #{memberNo}
            </p>
          </div>

          <div className="mt-auto flex gap-4 items-end max-w-full">
            <div className="flex-1">
              <div className="w-[84px] h-[84px] rounded-[12px] bg-white p-[7px] grid grid-cols-6 grid-rows-6 gap-[2px]">
                {qrCells.map((filled, i) => (
                  <div key={i} className={`rounded-[2px] ${filled ? 'bg-black' : 'bg-white'}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 text-right pb-1">
              <p className="text-[10px] leading-[1.3] tracking-[0.04em] opacity-40 break-all max-w-full overflow-hidden">
                {shareUrl}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-[36px] border border-white/[0.08] pointer-events-none" />
        <div className="absolute inset-[1px] rounded-[35px] border border-white/[0.03] pointer-events-none" />
      </div>

      <div className="w-full mt-5 flex gap-3 max-w-full">
        <button
          onClick={() => onAction('IG Story template downloaded')}
          className="tap flex-1 h-[52px] rounded-full bg-black text-white text-[13px] font-[600] tracking-[-0.01em] flex items-center justify-center gap-2 max-w-full"
        >
          <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px]">
            ↗
          </span>
          DOWNLOAD FOR IG STORY
        </button>
      </div>
      <button
        onClick={() => onAction('Link copied — share your card')}
        className="tap w-full mt-3 h-[52px] rounded-full border border-black/[0.08] bg-white text-black text-[13px] font-[600] flex items-center justify-center max-w-full"
      >
        SHARE CARD
      </button>
      <p className="mt-6 text-[11px] text-black/30 text-center px-6 leading-[1.4]">
        Hold to your Wallet. This card updates automatically when you renew.
      </p>
    </div>
  );
}
