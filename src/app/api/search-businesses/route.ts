import { NextRequest, NextResponse } from 'next/server';
import { searchBusinessesService } from '@/services/serpapiService';
import { SerpApiSearchParams } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SerpApiSearchParams;

    const query = body.query || 'LED Bulbs';
    const location = body.location || 'Ambala';
    const radiusKm = body.radiusKm ? Number(body.radiusKm) : 20;
    const businessType = body.businessType || 'All';
    const category = body.category;
    const forceMock = body.forceMock === true;

    const result = await searchBusinessesService({
      query,
      location,
      radiusKm,
      businessType,
      category,
      forceMock,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API /api/search-businesses POST Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to process business search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || 'LED Bulbs';
    const location = searchParams.get('loc') || searchParams.get('location') || 'Ambala';
    const radiusKm = searchParams.get('radius') ? Number(searchParams.get('radius')) : 20;
    const businessType = (searchParams.get('type') || 'All') as any;
    const forceMock = searchParams.get('mock') === 'true';

    const result = await searchBusinessesService({
      query,
      location,
      radiusKm,
      businessType,
      forceMock,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API /api/search-businesses GET Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to process business search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
