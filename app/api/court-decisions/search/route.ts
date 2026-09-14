import { NextResponse } from "next/server";

export async function GET() {
  const testUrl = "https://iraqcas.msla.iq/";

  try {
    const response = await fetch(testUrl, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      contentLength: text.length,
      url: testUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        url: testUrl,
      },
      { status: 500 }
    );
  }
}
