"use client"
import { useState, useRef, useEffect } from 'react'
import { sendChatMessage, ChatMsg } from '../lib/api'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function ChatBot({ isOpen, onClose }: Props) {
    const [messages, setMessages] = useState<ChatMsg[]>([
        { role: 'assistant', content: 'Namaste! 🙏 I\'m your SAMAAN pension assistant. Ask me anything about your pension, payment delays, or schemes.' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    const send = async () => {
        const text = input.trim()
        if (!text || loading) return
        const userMsg: ChatMsg = { role: 'user', content: text }
        const updated = [...messages, userMsg]
        setMessages(updated)
        setInput('')
        setLoading(true)
        try {
            const reply = await sendChatMessage(updated)
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            {/* Chat Panel */}
            <div className="relative pointer-events-auto w-full max-w-[420px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1a1f35] to-[#2a3050] text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">smart_toy</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">SAMAAN Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-[11px] text-gray-300">Online • Powered by Mistral AI</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-[#1a1f35] text-white rounded-br-md'
                                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={endRef} />
                </div>

                {/* Quick Suggestions */}
                {messages.length <= 1 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
                        {['What is NPS?', 'My pension is delayed', 'How to file a grievance?'].map(q => (
                            <button
                                key={q}
                                onClick={() => { setInput(q); }}
                                className="text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Type your question..."
                            disabled={loading}
                            className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1a1f35] focus:ring-2 focus:ring-[#1a1f35]/10 transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={send}
                            disabled={loading || !input.trim()}
                            className="w-11 h-11 rounded-xl bg-[#1a1f35] text-white flex items-center justify-center hover:bg-[#2a3050] disabled:opacity-40 transition-all shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
