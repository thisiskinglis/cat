import { ArrowUpRight } from 'lucide-react';

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function HomeView({ memberNo, onAction }) {
  return (
    <div className="px-5 pt-7 pb-8 max-w-full overflow-hidden box-border">
      <div className="inline-flex items-center h-[30px] px-[14px] rounded-full border border-black/[0.08] bg-[#FAFAFA] gap-2 mb-8">
        <span className="text-[10px] font-[700] tracking-[0.12em] bg-black text-white px-[6px] py-[2px] rounded-full leading-none">
          R99
        </span>
        <span className="text-[10.5px] font-[600] tracking-[0.08em] text-black/60">
          100% TO COMMUNITY FUND
        </span>
      </div>

      <div className="mb-7">
        <h1 className="syne font-[800] text-[46px] sm:text-[52px] leading-[0.88] tracking-[-0.05em] max-w-full">
          <span className="block">BY GRACE</span>
          <span className="block text-black/20">WE GROW</span>
        </h1>
        <p className="mt-5 text-[15px] leading-[1.5] tracking-[-0.01em] text-black/50 max-w-[280px]">
          You contribute. We grow together.
          <br />
          1 tap to get in.
        </p>
      </div>

      <div className="rounded-[28px] bg-black text-white p-[22px] relative overflow-hidden group max-w-full">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: NOISE_BG }} />
        <div className="relative">
          <div className="flex justify-between items-start mb-[48px]">
            <span className="text-[10px] tracking-[0.2em] font-[600] opacity-60">PRIVATE COMMUNITY</span>
            <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </div>
          </div>
          <h2 className="syne text-[28px] leading-[0.95] tracking-[-0.03em] font-[700] max-w-[200px] mb-7">
            JOIN CRESCITA COLLECTIVE
          </h2>
          <button
            onClick={() => onAction(`Welcome Founder #${memberNo} — Community invite sent`)}
            className="tap w-full h-[48px] rounded-full bg-white text-black text-[13px] font-[600] tracking-[-0.01em] flex items-center justify-center gap-2 hover:bg-[#F0F0F0] transition max-w-full"
          >
            JOIN COMMUNITY
            <span className="text-[11px] opacity-60">#{memberNo}</span>
          </button>
        </div>
        <div className="absolute -bottom-[80px] -right-[20px] w-[180px] h-[180px] rounded-full bg-white/10 blur-[40px]" />
      </div>

      <div className="mt-3 rounded-[28px] bg-[#F7F7F5] border border-black/[0.06] p-[22px] relative max-w-full">
        <div className="flex justify-between items-start mb-[52px]">
          <span className="text-[10px] tracking-[0.2em] font-[600] text-black/40">GROWTH CALL — 30 MIN</span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-black text-white font-[600] tracking-[0.08em]">
            LIVE
          </span>
        </div>
        <h2 className="syne text-[26px] leading-[0.95] tracking-[-0.03em] font-[700] text-black mb-2">
          BOOK YOUR
          <br />
          1:1 SESSION
        </h2>
        <p className="text-[13px] leading-[1.4] text-black/50 mb-6 max-w-[220px]">
          Strategy, mindset &amp; next moves. Founder-led.
        </p>
        <button
          onClick={() => onAction('Calendar opened — pick a slot')}
          className="tap w-full h-[48px] rounded-full bg-black text-white text-[13px] font-[600] tracking-[-0.01em] hover:bg-[#1A1A1A] transition max-w-full"
        >
          BOOK MY CALL
        </button>
      </div>

      <p className="mt-10 text-center text-[10px] tracking-[0.18em] font-[500] text-black/20">
        BY GRACE WE GROW. THROUGH UBUNTU.
      </p>
    </div>
  );
}
