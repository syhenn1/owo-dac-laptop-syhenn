import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { cookie } = await request.json();

        if (!cookie) {
            return NextResponse.json(
                { success: false, message: "Missing Data Source Session" },
                { status: 401 },
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_DATASOURCE_URL;
        if (!baseUrl) {
            return NextResponse.json(
                { success: false, message: "Missing Data Source URL configuration" },
                { status: 500 },
            );
        }

        // Fetch the page
        const response = await fetch(`${baseUrl}/proses`, {
            headers: {
                Cookie: "ci_session=" + cookie,
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Failed to fetch data source: ${response.status}`,
                },
                { status: response.status },
            );
        }

        const html = await response.text();

        // Regex to parse the table rows
        // Groups:
        // 1: No
        // 2: Type (DAC)
        // 3: Date
        // 4: Verifikator
        // 5: BAPP No
        // 6: SN (Button text inside td)
        // 7: NPSN
        // 8: Sekolah
        // 9: ID (href link)
        // Note: Removed </tr> check as it might be missing in some rows
        const regex = /<tr[^>]*>[\s\S]*?<td[^>]*>\s*(\d+)\s*<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>[\s\S]*?>([\s\S]*?)<\/button>[\s\S]*?<td[^>]*>[\s\S]*?class="[^"]*btn-(danger|success|warning|primary|info)[^"]*"[^>]*>([\s\S]*?)<\/button>[\s\S]*?<td[^>]*>\s*([\s\S]*?)\s*<\/td>[\s\S]*?<td[^>]*>\s*([\s\S]*?)\s*<\/td>[\s\S]*?<td[^>]*>\s*(?:<a[^>]*href="[^"]*\/form\/(\d+)")?[\s\S]*?<button[^>]*>\s*([\s\S]*?)\s*<\/button>/gm;
        const results = [];
        let match;

        // Clean up helper
        const clean = (str: string) => str.replace(/&nbsp;/g, " ").trim();

        while ((match = regex.exec(html)) !== null) {
            results.push({
                no: clean(match[1]),
                type: clean(match[2]),
                date: clean(match[3]),
                no_bapp: clean(match[5]),
                cek_sn_penyedia: clean(match[6]) == "danger" ? "2" : "0",
                serial_number: clean(match[7]),
                npsn: clean(match[8]),
                nama_sekolah: clean(match[9]),
                action_id: match[10] ? clean(match[10]) : null,
                status: clean(match[11]),
            });
        }

        return NextResponse.json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error: any) {
        console.error("Scrape API Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Scrape failed" },
            { status: 500 },
        );
    }
}
