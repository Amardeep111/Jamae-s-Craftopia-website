import { NextResponse } from 'next/server'
import { shouldUseMockData, testDatabaseConnection } from '@/lib/db'

export async function GET() {
  const useMock = shouldUseMockData()
  let dbConnected = false

  if (!useMock) {
    dbConnected = await testDatabaseConnection()
  }

  return NextResponse.json({
    mode: useMock ? 'mock' : 'database',
    database: {
      connected: dbConnected,
      type: useMock ? 'mock' : 'postgresql',
    },
    timestamp: new Date().toISOString(),
  })
}
