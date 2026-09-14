// app/api/court-decisions/search/route.ts

export async function GET() {
  const urls = [
    "https://www.sjc.iq/",
    "https://iraqcas.msla.iq/",
  ];

  const results = [];

  for (const url of urls) {
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

      results.push({
        url,
        status: response.status,
        statusText: response.statusText,
        contentLength: html.length,
        title:
          html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ??
          null,
        server: response.headers.get("server"),
      });
    } catch (error) {
      results.push({
        url,
        error: String(error),
      });
    }
  }

  return Response.json({
    success: true,
    results,
  });
}
