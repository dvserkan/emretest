import { NextResponse } from "next/server";
import { dbConfigSchema } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = dbConfigSchema.parse(body);
    
    // Store in memory for demo purposes
    global.dbConfig = config;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid database configuration" },
      { status: 400 }
    );
  }
}