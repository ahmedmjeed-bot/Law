'use client'

const SUGGESTIONS = [
  'اكتب لي رسالة اعتذار لتأجيل موعد',
  'رتّب لي مهام يومي في خمس نقاط',
  'اقترح وجبة عشاء سريعة وصحية',
  'لخّص لي هذه الفكرة بأسلوب أوضح',
]

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-8 px-5 pb-6 pt-16">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">مرحبًا بك،</p>
        <h1 className="gold-text font-serif text-4xl font-bold leading-[1.25] text-balance">
          كيف أساعدك اليوم؟
        </h1>
        <p className="max-w-[26ch] text-sm leading-relaxed text-muted-foreground text-pretty">
          رفيق مساعدك الشخصي. اسأله، أو ابدأ من أحد الاقتراحات.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {SUGGESTIONS.map((s, i) => (
          <li key={s} className="animate-rise" style={{ animationDelay: `${80 + i * 70}ms` }}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-start text-[14px] leading-relaxed text-card-foreground transition-colors active:border-primary/50"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
