import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Sample schema for demonstration
const DEMO_SCHEMA = [
  {
    name: "users",
    type: "BASE TABLE",
    columns: [
      { name: "id", type: "int", nullable: false, isPrimary: true },
      { name: "username", type: "varchar", nullable: false },
      { name: "email", type: "varchar", nullable: false },
      { name: "created_at", type: "timestamp", nullable: false }
    ]
  },
  {
    name: "products",
    type: "BASE TABLE",
    columns: [
      { name: "id", type: "int", nullable: false, isPrimary: true },
      { name: "name", type: "varchar", nullable: false },
      { name: "price", type: "decimal", nullable: false },
      { name: "description", type: "text", nullable: true }
    ]
  },
  {
    name: "orders",
    type: "BASE TABLE",
    columns: [
      { name: "id", type: "int", nullable: false, isPrimary: true },
      { name: "user_id", type: "int", nullable: false },
      { name: "total", type: "decimal", nullable: false },
      { name: "status", type: "varchar", nullable: false }
    ]
  }
];

export async function GET() {
  try {
    // In a real application, this would fetch the actual database schema
    return NextResponse.json(DEMO_SCHEMA);
  } catch (error) {
    console.error("Failed to fetch schema:", error);
    return NextResponse.json(
      { error: "Failed to fetch database schema" },
      { status: 500 }
    );
  }
}