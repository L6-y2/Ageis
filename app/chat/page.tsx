import BottomNav from '@/components/BottomNav'
import ChatInterface from '@/components/ChatInterface'

export default function ChatPage() {
  return (
    <main className="flex flex-col h-[100dvh] pb-16 lg:pb-0 lg:pr-60 bg-[#0A0B0E]">
      {/* Header */}
      <header className="border-b border-[rgba(236,238,242,0.08)] bg-[#0D0F15] flex-shrink-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[10px] p-0.5 bg-[#07080B] border border-[rgba(212,175,55,0.40)] overflow-hidden shrink-0">
              <img
                src="/aegis-avatar.jpg"
                alt="Aegis AI"
                className="w-full h-full object-cover rounded-[8px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-[#ECEEF2] text-base">إيجيس الذكي</h1>
                <span
                  dir="ltr"
                  className="px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-[rgba(212,175,55,0.10)] text-[#D4AF37] border border-[rgba(212,175,55,0.28)]"
                >
                  AI Counsel
                </span>
              </div>
              <p className="text-[11px] text-[#4EA87E] flex items-center gap-1.5 font-medium mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EA87E] inline-block" />
                <span>متصل ومربوط بقاعدة البيانات</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>

      <BottomNav />
    </main>
  )
}
