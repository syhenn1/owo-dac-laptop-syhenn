import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Menggunakan POST agar aman mengirim session_id di body
    const { term, session_id } = await request.json();

    if (!term || !session_id) {
      return NextResponse.json(
        { success: false, message: "Missing NPSN (term) or session_id" },
        { status: 400 }
      );
    }

    // Membangun URL dengan query parameter 'term'
    const targetUrl = `https://kemdikdasmen.mastermedia.co.id/app/approval/get_sekolah?term=${term}`;
    console.log(`Fetching school data for NPSN: ${term}`);

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "x-requested-with": "XMLHttpRequest",
        Cookie: `ci_session=${session_id}`,
        Referer: "https://kemdikdasmen.mastermedia.co.id/app/approval",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const responseData = await res.json();

    // Mengembalikan data JSON langsung dari server target
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error("Get Sekolah Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
