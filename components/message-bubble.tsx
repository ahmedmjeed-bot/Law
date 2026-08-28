import { cn } from '@/lib/utils'

type Props = {
  role: 'user' | 'assistant'
  text: string
}

export function MessageBubble({ role, text }: Props) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'animate-rise flex w-full',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div className={cn('flex max-w-[85%] flex-col gap-1.5')}>
        {!isUser && (
          <span className="font-serif text-[10px] tracking-widest text-primary/70">
            رفيق
          </span>
        )}
        <div
          className={cn(
            'whitespace-pre-wrap text-[15px] leading-relaxed',
            isUser
              ? 'rounded-2xl rounded-es-md bg-primary px-4 py-2.5 font-medium text-primary-foreground'
              : 'rounded-2xl rounded-se-md border border-border bg-card px-4 py-3 text-card-foreground',
          )}
        >
          {text}
        </div>
      </div>
    </div>
  )
}

export function TypingBubble() {
  return (
    <div className="animate-rise flex w-full justify-start">
      <div className="flex flex-col gap-1.5">
        <span className="font-serif text-[10px] tracking-widest text-primary/70">
          رفيق
        </span>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-se-md border border-border bg-card px-4 py-4">
          <span className="sr-only">جارٍ الكتابة</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-primary"
              style={{
                animation: 'pulse-dot 1.1s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
