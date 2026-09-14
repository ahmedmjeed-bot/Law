// app/api/court-decisions/search/route.ts

export async function GET() {
  const url = "https://iraqcas.msla.iq/";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ar,en;q=0.9",
      },
      cache: "no-store",
    });

    const html = await response.text();

    const title =
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;

    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return Response.json({
      status: response.status,
      statusText: response.statusText,
      contentLength: html.length,
      title,
      bodyPreview: bodyText.slice(0, 2000),

      headers: {
        server: response.headers.get("server"),
        cfRay: response.headers.get("cf-ray"),
        cfCacheStatus: response.headers.get("cf-cache-status"),
        contentType: response.headers.get("content-type"),
        location: response.headers.get("location"),
        setCookie: response.headers.get("set-cookie"),
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
