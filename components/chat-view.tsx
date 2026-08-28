'use client'

import { useChat } from '@ai-sdk/react'
import { RefreshCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Composer } from '@/components/composer'
import { EmptyState } from '@/components/empty-state'
import { MessageBubble, TypingBubble } from '@/components/message-bubble'

export function ChatView() {
  const [input, setInput] = useState('')
  const [lastSent, setLastSent] = useState('')
  const { messages, sendMessage, setMessages, status, stop, error } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  const busy = status === 'submitted' || status === 'streaming'
  const isEmpty = messages.length === 0

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, busy])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setLastSent(trimmed)
    sendMessage({ text: trimmed })
    setInput('')
  }

  // The route returns Arabic plain-text errors, so show them verbatim when present.
  const errorText =
    error?.message && /[\u0600-\u06FF]/.test(error.message)
      ? error.message
      : 'تعذّر الاتصال بالمساعد. تحقّق من اتصالك بالإنترنت وحاول مرة أخرى.'

  const lastIsUser = messages[messages.length - 1]?.role === 'user'

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-primary shadow-[0_0_10px_2px_var(--primary)]"
          />
          <div className="leading-tight">
            <p className="font-serif text-[15px] font-bold text-foreground">رفيق</p>
            <p className="text-[11px] text-muted-foreground">مساعدك الشخصي</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            stop()
            setMessages([])
            setInput('')
          }}
          disabled={isEmpty}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors active:border-primary/50 disabled:opacity-40"
        >
          <RefreshCcw className="size-3.5" />
          محادثة جديدة
        </button>
      </header>

      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto">
        {isEmpty ? (
          <EmptyState onPick={send} />
        ) : (
          <div className="flex flex-col gap-4 px-4 py-5">
            {messages.map((message) => {
              const text = message.parts
                .filter((part) => part.type === 'text')
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('')

              if (!text) return null

              return (
                <MessageBubble
                  key={message.id}
                  role={message.role === 'user' ? 'user' : 'assistant'}
                  text={text}
                />
              )
            })}

            {busy && lastIsUser && <TypingBubble />}

            {error && (
              <div
                role="alert"
                className="flex flex-col gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3"
              >
                <p className="text-[13px] leading-relaxed text-foreground">{errorText}</p>
                {lastSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setMessages((prev) =>
                        prev.filter((m, i) => !(m.role === 'user' && i === prev.length - 1)),
                      )
                      sendMessage({ text: lastSent })
                    }}
                    className="flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-foreground transition-colors active:border-primary/50"
                  >
                    <RefreshCcw className="size-3.5" />
                    إعادة المحاولة
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSubmit={() => send(input)}
        onStop={stop}
        busy={busy}
      />
    </div>
  )
}
