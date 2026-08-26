import { Home, CreditCard, CalendarDays, Gift } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'card', label: 'Card', Icon: CreditCard },
  { id: 'programmes', label: 'Programmes', Icon: CalendarDays },
  { id: 'perks', label: 'Perks', Icon: Gift },
];

export default function BottomNav({ activeTab, onNavigate }) {
  return (
    <div className="shrink-0 h-[92px] bg-white border-t border-black/[0.06] px-3 pt-2 pb-[24px] relative z-30 max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-1 h-[52px] p-1 rounded-full bg-[#F2F2F2] border border-black/[0.04] max-w-full">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`tap relative flex-1 h-full rounded-full flex items-center justify-center gap-[7px] transition-all duration-300 ${
                active ? 'bg-black text-white shadow-[0_2px_12px_rgba(0,0,0,0.2)]' : 'text-black/45 hover:text-black/80'
              }`}
            >
              <Icon className={`w-[16px] h-[16px] ${active ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className={`text-[12.5px] tracking-[-0.01em] ${active ? 'font-[600]' : 'font-[500]'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[7px] w-[36px] h-[4px] rounded-full bg-black/10" />
    </div>
  );
}
