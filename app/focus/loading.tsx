export default function FocusLoading() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <div className="w-56 h-56 rounded-full bg-[#12141C] border border-[rgba(212,175,55,0.22)] flex items-center justify-center">
          <div className="h-12 w-28 bg-[#191C25] rounded-lg" />
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-[10px] bg-[#12141C]" />
          <div className="w-16 h-16 rounded-[14px] bg-[#191C25] border border-[rgba(212,175,55,0.28)]" />
          <div className="w-12 h-12 rounded-[10px] bg-[#12141C]" />
        </div>
        <div className="h-10 w-64 bg-[#12141C] rounded-[10px]" />
      </div>
    </div>
  )
}
