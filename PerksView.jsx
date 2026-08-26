import { Gift, Bell, Check } from 'lucide-react';

export default function PerksView({ copied, onCopy, notifOn, setNotifOn, onAction }) {
  const toggleNotifications = () => {
    const next = !notifOn;
    setNotifOn(next);
    onAction(next ? 'Notifications enabled' : 'Notifications paused');
  };

  return (
    <div className="px-5 pt-7 pb-10 max-w-full overflow-hidden">
      <h2 className="syne font-[700] text-[22px] tracking-[-0.03em] leading-[0.95]">
        MEMBER PERKS &amp;
        <br />
        <span className="text-black/20">ACCESS</span>
      </h2>

      <div className="mt-8 rounded-[28px] border border-black/[0.06] bg-white p-[22px] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-[10px] px-3 h-[26px] rounded-full bg-[#00E676] text-black font-[700] tracking-[0.08em] flex items-center">
            15% OFF
          </span>
        </div>
        <h3 className="syne font-[700] text-[20px] tracking-[-0.02em] leading-[0.95]">COLLECTIVE STORE</h3>
        <p className="mt-2 text-[13px] leading-[1.4] text-black/50 max-w-[220px]">
          Use your member code at checkout on crescita.co.za
        </p>
        <div className="mt-6 rounded-[14px] border border-dashed border-black/15 bg-[#FAFAFA] h-[48px] flex items-center justify-center">
          <span className="syne font-[700] tracking-[0.14em] text-[14px]">COLLECTIVE15</span>
        </div>
        <button
          onClick={onCopy}
          className={`tap mt-3 w-full h-[48px] rounded-full text-[13px] font-[600] transition-all flex items-center justify-center gap-2 ${
            copied ? 'bg-[#00E676] text-black' : 'bg-black text-white hover:bg-[#1A1A1A]'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> COPIED!
            </>
          ) : (
            'COPY CODE'
          )}
        </button>
      </div>

      <div className="mt-4 rounded-[28px] bg-black text-white p-[22px] relative overflow-hidden">
        <div className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full bg-[#00E676]/[0.12] blur-[30px]" />
        <div className="relative">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div
              className={`h-[26px] px-3 rounded-full flex items-center gap-1.5 text-[10px] font-[700] tracking-[0.08em] ${
                notifOn ? 'bg-[#00E676] text-black' : 'bg-white/10 text-white/60'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${notifOn ? 'bg-black' : 'bg-white/40'}`} />
              {notifOn ? 'NOTIFICATIONS ON' : 'OFF'}
            </div>
          </div>
          <h3 className="syne font-[700] text-[22px] leading-[0.95] tracking-[-0.02em]">
            GET PINGED
            <br />
            FIRST
          </h3>
          <p className="mt-3 text-[13px] leading-[1.45] text-white/50 max-w-[220px]">
            Drops, calls, and private invites. No spam. Ever.
          </p>
          <button
            onClick={toggleNotifications}
            className={`tap mt-6 w-full h-[48px] rounded-full text-[13px] font-[600] flex items-center justify-center gap-2 transition-all ${
              notifOn ? 'bg-[#00E676] text-black hover:bg-[#00D66E]' : 'bg-white text-black hover:bg-[#F0F0F0]'
            }`}
          >
            {notifOn ? (
              <>
                <Check className="w-4 h-4" /> ENABLED
              </>
            ) : (
              'TURN ON NOTIFICATIONS'
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-[20px] bg-[#F7F7F5] border border-black/[0.05] p-4 flex gap-3">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-[12px] font-[700]">
          ?
        </div>
        <p className="text-[12px] leading-[1.4] text-black/50">
          Your member code works for 90 days. Need help? DM @crescitacollective on Instagram.
        </p>
      </div>
    </div>
  );
}
