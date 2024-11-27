import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { Client } from "pg";
import sql from "mssql";
import { z } from "zod";

const dbConfigSchema = z.object({
  type: z.enum(["mysql", "postgresql", "mssql"]),
  host: z.string(),
  port: z.string(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = dbConfigSchema.parse(body);

    switch (config.type) {
      case "mysql":
        const connection = await mysql.createConnection({
          host: config.host,
          port: parseInt(config.port),
          user: config.username,
          password: config.password,
          database: config.database,
        });
        await connection.end();
        break;

      case "postgresql":
        const client = new Client({
          host: config.host,
          port: parseInt(config.port),
          user: config.username,
          password: config.password,
          database: config.database,
        });
        await client.connect();
        await client.end();
        break;

      case "mssql":
        await sql.connect({
          server: config.host,
          port: parseInt(config.port),
          user: config.username,
          password: config.password,
          database: config.database,
          options: {
            trustServerCertificate: true,
          },
        });
        await sql.close();
        break;

      default:
        throw new Error("Unsupported database type");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 }
    );
  }
}