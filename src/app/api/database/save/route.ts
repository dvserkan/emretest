import { NextResponse } from "next/server";
import { dbConfigSchema } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = dbConfigSchema.parse(body);
    
    // In a real app, you'd want to store this securely
    // For demo purposes, we'll store in memory
    global.dbConfig = config;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid database configuration" },
      { status: 400 }
    );
  }
}