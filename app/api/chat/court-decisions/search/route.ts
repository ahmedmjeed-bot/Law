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

    // 1. إنشاء رابط البحث في موقع مجلس القضاء الأعلى
    const searchUrl =
      `${BASE_URL}/?activeTab=Discrimination` +
      `&basicno=${encodeURIComponent(basicno)}` +
      `&dept=${encodeURIComponent(dept)}` +
      `&basicyear=${encodeURIComponent(basicyear)}` +
      `&CourtNumber=${encodeURIComponent(courtNumber)}`;

    // 2. طلب صفحة نتائج البحث
    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!searchResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `تعذر الوصول إلى موقع مجلس القضاء الأعلى. HTTP ${searchResponse.status}`,
        },
        { status: 502 }
      );
    }

    const searchHtml = await searchResponse.text();

    // 3. استخراج رابط القرار من صفحة النتائج
    const caseMatch = searchHtml.match(
      /href=["'](\/Home\/Cases\/[^"']+)["']/i
    );

    if (!caseMatch) {
      return NextResponse.json({
        success: false,
        found: false,
        message: "لم يتم العثور على قرار مطابق للبيانات المدخلة.",
        searchUrl,
      });
    }

    const casePath = caseMatch[1];
    const caseUrl = new URL(casePath, BASE_URL).toString();

    // 4. فتح صفحة القرار نفسها
    const caseResponse = await fetch(caseUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!caseResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `تم العثور على القرار، ولكن تعذر فتح صفحته. HTTP ${caseResponse.status}`,
          caseUrl,
        },
        { status: 502 }
      );
    }

    const caseHtml = await caseResponse.text();

    // 5. استخراج رابط ملف PDF
    const pdfMatch = caseHtml.match(
      /(?:window\.open\(|href=["'])['"]?(\/pdf\/[^'" )]+\.pdf)/i
    );

    if (!pdfMatch) {
      return NextResponse.json({
        success: true,
        found: true,
        message: "تم العثور على صفحة القرار، ولكن لم يتم العثور على ملف PDF.",
        caseUrl,
        searchUrl,
      });
    }

    const pdfPath = pdfMatch[1];
    const pdfUrl = new URL(pdfPath, BASE_URL).toString();

    // 6. إعادة المعلومات إلى رفيق
    return NextResponse.json({
      success: true,
      found: true,
      basicno,
      basicyear,
      dept,
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
