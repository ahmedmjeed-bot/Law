import { NextResponse } from "next/server";

const BASE_URL = "https://iraqcas.msla.iq";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const basicno = searchParams.get("basicno");
    const basicyear = searchParams.get("basicyear");
    const dept = searchParams.get("dept") || "2";
    const courtNumber = searchParams.get("CourtNumber") || "";

    if (!basicno || !basicyear) {
      return NextResponse.json(
        {
          success: false,
          error: "يجب إدخال رقم القرار وسنة القرار.",
        },
        { status: 400 }
      );
    }

    const searchUrl =
      `${BASE_URL}/?activeTab=Discrimination` +
      `&basicno=${encodeURIComponent(basicno)}` +
      `&dept=${encodeURIComponent(dept)}` +
      `&basicyear=${encodeURIComponent(basicyear)}` +
      `&CourtNumber=${encodeURIComponent(courtNumber)}`;

   const searchResponse = await fetch(searchUrl, {
  method: "GET",
  cache: "no-store",
});

    if (!searchResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `تعذر الوصول إلى موقع مجلس القضاء الأعلى. HTTP ${searchResponse.status}`,
          searchUrl,
        },
        { status: 502 }
      );
    }

    const searchHtml = await searchResponse.text();

    const caseMatch = searchHtml.match(
      /href=["'](\/(?:Home|home)\/Cases\/[^"']+)["']/i
    );

    if (!caseMatch) {
      return NextResponse.json({
        success: true,
        found: false,
        pdfFound: false,
        message: "لم يتم العثور على قرار مطابق للبيانات المدخلة.",
        searchUrl,
      });
    }

    const casePath = caseMatch[1];
    const caseUrl = new URL(casePath, BASE_URL).toString();

    const caseResponse = await fetch(caseUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Referer: searchUrl,
      },
      cache: "no-store",
    });

    if (!caseResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `تم العثور على القرار، ولكن تعذر فتح صفحته. HTTP ${caseResponse.status}`,
          caseUrl,
          searchUrl,
        },
        { status: 502 }
      );
    }

    const caseHtml = await caseResponse.text();

    const pdfMatch = caseHtml.match(/\/pdf\/[^"' )]+\.pdf/i);

    if (!pdfMatch) {
      return NextResponse.json({
        success: true,
        found: true,
        pdfFound: false,
        message:
          "تم العثور على صفحة القرار، ولكن لم يتم العثور على ملف PDF.",
        caseUrl,
        searchUrl,
      });
    }

    const pdfPath = pdfMatch[0];
    const pdfUrl = new URL(pdfPath, BASE_URL).toString();

    return NextResponse.json({
      success: true,
      found: true,
      pdfFound: true,
      basicno,
      basicyear,
      dept,
      courtNumber,
      searchUrl,
      caseUrl,
      pdfUrl,
      message: "تم العثور على القرار وملف PDF بنجاح.",
    });
  } catch (error) {
    console.error("Court decision search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء البحث عن القرار.",
      },
      { status: 500 }
    );
  }
}
