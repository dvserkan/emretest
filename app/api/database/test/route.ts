import { NextResponse } from "next/server";
import sql from "mssql";
import { z } from "zod";
import { formatError } from "@/lib/utils";

const dbConfigSchema = z.object({
  type: z.enum(["mysql", "postgresql", "mssql"]),
  host: z.string(),
  port: z.string().optional(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
  trustServerCertificate: z.boolean().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = dbConfigSchema.parse(body);

    if (config.type === "mssql") {
      const sqlConfig: sql.config = {
        user: config.username,
        password: config.password,
        database: config.database,
        server: config.host,
        port: parseInt(config.port || "1433"),
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
          instanceName: undefined,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        requestTimeout: 30000,
        connectionTimeout: 30000,
      };

      try {
        console.log("Attempting SQL Server connection...");
        await sql.connect(sqlConfig);
        const result = await sql.query`SELECT 1 as test`;
        console.log("Connection successful");
        
        return NextResponse.json({ success: true, message: "Connection successful" });
      } catch (error) {
        console.error("SQL Server connection error:", error);
        const errorMessage = formatError(error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      } finally {
        await sql.close();
      }
    }

    return NextResponse.json({ error: "Unsupported database type" }, { status: 400 });
  } catch (error) {
    console.error("Configuration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid configuration" },
      { status: 400 }
    );
  }
}