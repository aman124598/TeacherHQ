import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      location: {
        latitude: parseFloat(process.env.COLLEGE_LATITUDE || '13.072204074042398'),
        longitude: parseFloat(process.env.COLLEGE_LONGITUDE || '77.50754474895987'),
      }
    })
  } catch (error) {
    console.error('Error getting college location:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error getting college location' 
    }, { status: 500 })
  }
}
