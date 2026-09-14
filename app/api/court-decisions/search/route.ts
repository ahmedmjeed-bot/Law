export async function GET() {
  try {
    const response = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
    });

    const data = await response.json();

    return Response.json({
      success: true,
      vercelIp: data.ip,
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
