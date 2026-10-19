import { NextResponse } from 'next/server'

// This legacy endpoint exposed whether an email or phone had an account. The
// current login and signup endpoints return appropriately scoped responses.
export async function POST() {
  return NextResponse.json({ success: false, error: 'This endpoint is no longer available.' }, { status: 410 })
}
