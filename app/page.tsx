import { ChatView } from '@/components/chat-view'

export default function Page() {
  return (
    <main className="mx-auto h-dvh w-full max-w-[430px] overflow-hidden sm:my-6 sm:h-[calc(100dvh-3rem)] sm:rounded-[2.5rem] sm:border sm:border-border">
      <ChatView />
    </main>
  )
}
