import BottomNav from '@/components/BottomNav'
import ChatInterface from '@/components/ChatInterface'
import { Sparkles } from 'lucide-react'

export default function ChatPage() {
  return (
    <main className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="px-4 pt-10 pb-3 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-xl flex-shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 via-cyan-400 to-amber-400 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src="/aegis-avatar.jpg"
                  alt="Aegis AI"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-white text-base">إيجيس AI</h1>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                  Copilot
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                متصل وجاهز لمساعدتك
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>

      <BottomNav />
    </main>
  )
}
