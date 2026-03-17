// app/api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getTeams } from '@/actions/teams'
import { TEAMS_PAGE_SIZE, MAX_PAGE } from '@/lib/constants'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get('page') || '1', 10) || 1, MAX_PAGE))
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get('pageSize') || String(TEAMS_PAGE_SIZE), 10) || TEAMS_PAGE_SIZE, 100))

  try {
    const { teams, total } = await getTeams(page, pageSize)
    return NextResponse.json({ teams, total })
  } catch (error) {
    console.error('Teams fetch error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
