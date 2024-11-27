import { NextResponse } from "next/server";
import { getTableSchema } from "@/lib/db";

export async function GET() {
  try {
    const config = (global as any).dbConfig;
    if (!config) {
      return NextResponse.json(
        { error: "Database configuration not found" },
        { status: 404 }
      );
    }

    const schema = await getTableSchema(config);
    return NextResponse.json(schema);
  } catch (error) {
    console.error("Failed to fetch schema:", error);
    return NextResponse.json(
      { error: "Failed to fetch database schema" },
      { status: 500 }
    );
  }
}