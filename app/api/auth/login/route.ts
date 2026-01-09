import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password, type } = body;

        if (!username || !password) {
            return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
        }

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        let loginUrl = '';
        let baseUrl = '';

        if (type == "datasource") {
            baseUrl = process.env.NEXT_PUBLIC_DATASOURCE_URL || '';
            loginUrl = `${baseUrl}/auth/login`;
            formData.append('submit', '');
        } else {
            baseUrl = process.env.NEXT_PUBLIC_DAC_URL || '';
            loginUrl = `${baseUrl}/auth/ajax_login/`;
        }

        if (!baseUrl) {
            return NextResponse.json({ success: false, message: 'Configuration error: Missing Base URL' }, { status: 500 });
        }

        const response = await fetch(loginUrl, {
            method: 'POST',
            body: formData,
            redirect: 'manual' // We want to handle redirects manually for datasource check if needed, but standard fetch follows. Manual is safer to inspect headers.
        });

        // NOTE: For Datasource, it might just return 302 to /dashboard or similar.
        // If we use redirect: 'manual', we can check response.status == 302.
        // But let's stick to standard flow and then VERIFY.

        // Capture the cookie
        const setCookieHeader = response.headers.get('set-cookie');
        const data = await response.json().catch(() => ({}));

        if (type === "dac") {
            // DAC Verification
            if (!data.status) {
                return NextResponse.json({ success: false, message: data.message || 'Login failed (DAC status false)' });
            }
        } else if (type === "datasource") {
            // Datasource Verification
            // Look for ci_session
            const match = setCookieHeader?.match(/ci_session=([^;]+)/);
            const cookie = match ? match[1] : "";

            if (!cookie) {
                return NextResponse.json({ success: false, message: 'Login failed (No session cookie)' });
            }

            const verifyUrl = `${baseUrl}/view_form/84817`;
            const verifyRes = await fetch(verifyUrl, {
                headers: {
                    Cookie: `ci_session=${cookie}`
                },
            });

            let html = await verifyRes.text();
            let name = html.match(
                /<span\s+class="admin-name">\s*(.*?)\s*<\/span>/i
            );

            let result = name?.[1] ?? null;

            if (!result) {
                return NextResponse.json({ success: false, message: 'Login verification failed' });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            cookie: setCookieHeader,
            data: data
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
