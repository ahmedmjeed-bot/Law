import { createOpenAI } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'

// This route runs only on the server. The API key is read from the server
// environment and is never sent to, or readable by, the browser.
export const runtime = 'nodejs'
export const maxDuration = 30

const MODEL = 'gpt-5.4-mini'

const INSTRUCTIONS = `أنت "رفيق"، مساعد شخصي ذكي يتحدث العربية الفصحى المبسطة.

قواعدك:
- أجب دائمًا بالعربية، بنبرة ودودة ومختصرة ومباشرة، دون مبالغة أو إطراء.
- اجعل الردود قصيرة (من سطر إلى خمسة أسطر) إلا إذا طُلب منك التفصيل.
- استخدم قوائم نقطية قصيرة عندما يكون الجواب خطوات أو عناصر متعددة.
- لا تستخدم رموزًا تعبيرية، ولا تنسيق ماركداون معقد.
- إذا كان السؤال غامضًا، اطرح سؤالًا توضيحيًا واحدًا فقط.
- إذا لم تعرف الإجابة، قل ذلك بصراحة.
- إذا كتب المستخدم بالعامية، فافهمها وأجب بالفصحى المبسطة.
- أنت لا تستطيع الوصول إلى الإنترنت أو تقويم المستخدم أو بريده، فلا تدّعِ ذلك.`

/** Arabic error text, sent as a plain-text body so the client can display it. */
function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

/** Maps an upstream OpenAI failure to a user-facing Arabic message. */
function describeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  console.error('[v0] OpenAI request failed:', raw)

  if (/401|invalid[_ ]api[_ ]key|incorrect api key/i.test(raw)) {
    return 'مفتاح OpenAI غير صالح. يُرجى تحديث المفتاح في إعدادات المشروع.'
  }
  if (/429|rate[_ ]limit/i.test(raw)) {
    return 'تم تجاوز حد الاستخدام المسموح. يُرجى المحاولة بعد قليل.'
  }
  if (/quota|billing|insufficient/i.test(raw)) {
    return 'رصيد حساب OpenAI غير كافٍ. يُرجى مراجعة الفواتير في حسابك.'
  }
  if (/abort|timeout|ETIMEDOUT|ENOTFOUND|fetch failed/i.test(raw)) {
    return 'انتهت مهلة الاتصال بالخدمة. يُرجى المحاولة مرة أخرى.'
  }
  return 'حدث خطأ غير متوقع أثناء توليد الرد. يُرجى المحاولة مرة أخرى.'
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error('[v0] OPENAI_API_KEY is not set')
    return errorResponse(
      'لم يتم إعداد مفتاح OpenAI على الخادم. أضف المتغير OPENAI_API_KEY في إعدادات المشروع.',
      500,
    )
  }

  let messages: UIMessage[]
  try {
    const body = await req.json()
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return errorResponse('الطلب غير صالح: لا توجد رسائل.', 400)
    }
    messages = body.messages as UIMessage[]
  } catch {
    return errorResponse('الطلب غير صالح: تعذّر قراءة البيانات.', 400)
  }

  try {
    const openai = createOpenAI({ apiKey })

    const result = streamText({
      model: openai(MODEL),
      instructions: INSTRUCTIONS,
      messages: await convertToModelMessages(messages),
    })

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        // Errors thrown mid-stream are surfaced to the client as Arabic text.
        onError: describeError,
      }),
    })
  } catch (error) {
    return errorResponse(describeError(error), 502)
  }
}
