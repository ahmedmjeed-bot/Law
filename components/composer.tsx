'use client'

import { ArrowUp, Square } from 'lucide-react'
import { useEffect, useRef } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  busy: boolean
}

export function Composer({ value, onChange, onSubmit, onStop, busy }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`
  }, [value])

  const canSend = value.trim().length > 0 && !busy

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSend) onSubmit()
      }}
      className="flex items-end gap-2 border-t border-border bg-background/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
    >
      <div className="flex flex-1 items-end rounded-3xl border border-input bg-card px-4 py-1 focus-within:border-primary/50">
        <label htmlFor="composer" className="sr-only">
          اكتب رسالتك
        </label>
        <textarea
          id="composer"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              e.preventDefault()
              if (canSend) onSubmit()
            }
          }}
          placeholder="اكتب رسالتك…"
          className="max-h-[132px] w-full resize-none bg-transparent py-2.5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {busy ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="إيقاف الرد"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary text-foreground transition-transform active:scale-95"
        >
          <Square className="size-4 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="إرسال"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-all active:scale-95 disabled:bg-secondary disabled:text-muted-foreground"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </form>
  )
}
