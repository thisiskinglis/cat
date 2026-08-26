import { ArrowUpRight } from 'lucide-react';
import { pastProgrammes } from '../data/programmes';

export default function ProgrammesView({ onAction }) {
  return (
    <div className="px-5 pt-7 pb-10 max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h2 className="syne font-[700] text-[18px] tracking-[-0.02em]">PERFORMANCE PROGRAMME</h2>
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-[600]">
          ↗
        </div>
      </div>

      <div className="rounded-[28px] bg-black text-white p-[24px] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <span className="h-[26px] px-3 rounded-full bg-white text-black text-[11px] font-[700] tracking-[0.06em] flex items-center">
            SEPTEMBER 2025
          </span>
          <span className="h-[26px] px-3 rounded-full border border-white/20 text-[10px] font-[600] tracking-[0.1em] flex items-center">
            LIVE NOW
          </span>
        </div>
        <h3 className="syne text-[34px] leading-[0.9] tracking-[-0.04em] font-[800] mb-7">
          CHANGE THE
          <br />
          ENDING
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => onAction('Programme opened')}
            className="tap flex-1 h-[46px] rounded-full bg-white text-black text-[13px] font-[600]"
          >
            VIEW
          </button>
          <button
            onClick={() => onAction('PDF downloaded — Change The Ending')}
            className="tap flex-1 h-[46px] rounded-full border border-white/20 text-white text-[13px] font-[600] bg-white/5"
          >
            DOWNLOAD
          </button>
        </div>
        <div className="absolute -bottom-[40px] -right-[20px] w-[180px] h-[180px] rounded-full bg-white/5 blur-[30px]" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.16em] font-[600] text-black/30">PAST PROGRAMMES</span>
        <span className="text-[11px] text-black/30">{pastProgrammes.length} TOTAL</span>
      </div>

      <div className="mt-4 space-y-3">
        {pastProgrammes.map((p) => (
          <div
            key={p.month}
            onClick={() => onAction(`${p.title} — archived`)}
            className="group tap rounded-[22px] bg-[#F7F7F5] border border-black/[0.05] p-[18px] flex items-center justify-between hover:bg-[#F0F0F0] transition cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-[700] tracking-[0.12em] text-black/30">{p.month}</span>
              <p className="syne mt-1 font-[700] text-[16px] tracking-[-0.02em]">{p.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-black/[0.06] font-[600] tracking-[0.06em]">
                {p.status}
              </span>
              <div className="w-8 h-8 rounded-full bg-white border border-black/[0.06] flex items-center justify-center group-hover:bg-black group-hover:text-white transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
