import { NextRequest, NextResponse } from 'next/server';
import { IOnixNode } from '@/app/models/OnixAnalysis';

export async function POST(request: NextRequest) {
  try {
    const { nodeMap } = await request.json();
    
    if (!Array.isArray(nodeMap)) {
      return NextResponse.json(
        { error: 'Invalid node map provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({ nodeMap });
  } catch (error) {
    console.error('Error processing node map:', error);
    return NextResponse.json(
      { error: 'Failed to process node map' },
      { status: 500 }
    );
  }
} 
