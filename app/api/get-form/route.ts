import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id, cookie } = await request.json();

        if (!id || !cookie) {
            return NextResponse.json({ success: false, message: 'Missing id or cookie' }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_DATASOURCE_URL;
        if (!baseUrl) {
            return NextResponse.json({ success: false, message: 'Missing Data Source URL configuration' }, { status: 500 });
        }

        const targetUrl = `${baseUrl}/form/${id}`;
        console.log(`Fetching form for ID: ${id} at ${targetUrl}`);

        const res = await fetch(targetUrl, {
            method: 'GET', // Forms are usually GET, checking if this is correct. User said "form options dapet dari [URL]/form/[id]", usually a GET page.
            headers: {
                'Cookie': `ci_session=${cookie}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.ok) {
            return NextResponse.json({ success: false, message: `Failed to fetch form: ${res.status}` }, { status: res.status });
        }

        const html = await res.text();

        // Extract id_user
        const idUserMatch = html.match(/name=['"]id_user['"][^>]*?value=['"]([^'"]+)['"]/);
        const id_user = idUserMatch ? idUserMatch[1] : null;

        return NextResponse.json({ success: true, html, id_user });

    } catch (error: any) {
        console.error('Get Form Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
