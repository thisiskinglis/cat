export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="absolute bottom-[102px] left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[90%]">
      <div
        className="bg-black text-white text-[12px] font-[600] tracking-[-0.01em] px-4 h-9 rounded-full flex items-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] whitespace-nowrap"
        style={{ animation: 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {message}
      </div>
    </div>
  );
}
