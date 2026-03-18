import { NextRequest, NextResponse } from 'next/server';
import { resolveFullGallery } from '@/lib/projects';

export async function GET(request: NextRequest) {
    const dir = request.nextUrl.searchParams.get('dir');
    const title = request.nextUrl.searchParams.get('title') || 'Project';

    if (!dir) {
        return NextResponse.json({ error: 'Missing dir parameter' }, { status: 400 });
    }

    try {
        const images = await resolveFullGallery(dir, title);
        return NextResponse.json({ images }, {
            headers: {
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (error) {
        console.error('[Gallery API] Error:', error);
        return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
    }
}
