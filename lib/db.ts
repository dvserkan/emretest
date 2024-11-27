import mysql from 'mysql2/promise';
import { Client } from 'pg';
import sql from 'mssql';
import { z } from 'zod';

export const dbConfigSchema = z.object({
  type: z.enum(["mysql", "postgresql", "mssql"]),
  host: z.string(),
  port: z.string().optional(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
});

export type DBConfig = z.infer<typeof dbConfigSchema>;

export async function getTableSchema(config: DBConfig) {
  switch (config.type) {
    case "mysql":
      return getMySQLSchema(config);
    case "postgresql":
      return getPostgreSQLSchema(config);
    case "mssql":
      return getMSSQLSchema(config);
    default:
      throw new Error("Unsupported database type");
  }
}

async function getMySQLSchema(config: DBConfig) {
  const connection = await mysql.createConnection({
    host: config.host,
    port: parseInt(config.port || "3306"),
    user: config.username,
    password: config.password,
    database: config.database,
  });

  try {
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_TYPE
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
    `, [config.database]);

    const schema = [];
    for (const table of tables as any[]) {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [config.database, table.TABLE_NAME]);

      schema.push({
        name: table.TABLE_NAME,
        type: table.TABLE_TYPE,
        columns: columns,
      });
    }

    return schema;
  } finally {
    await connection.end();
  }
}

async function getPostgreSQLSchema(config: DBConfig) {
  const client = new Client({
    host: config.host,
    port: parseInt(config.port || "5432"),
    user: config.username,
    password: config.password,
    database: config.database,
  });

  await client.connect();

  try {
    const tables = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const schema = [];
    for (const table of tables.rows) {
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, 
               (SELECT true FROM information_schema.key_column_usage
                WHERE table_name = c.table_name AND column_name = c.column_name
                LIMIT 1) as is_key
        FROM information_schema.columns c
        WHERE table_name = $1
      `, [table.table_name]);

      schema.push({
        name: table.table_name,
        type: table.table_type,
        columns: columns.rows,
      });
    }

    return schema;
  } finally {
    await client.end();
  }
}

async function getMSSQLSchema(config: DBConfig) {
  const serverConfig: sql.config = {
    user: config.username,
    password: config.password,
    database: config.database,
    server: config.host,
    port: parseInt(config.port || "1433"),
    options: {
      encrypt: false, // Changed to false since you're using direct connection
      trustServerCertificate: true,
      enableArithAbort: true,
      charset: 'UTF8'
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  try {
    await sql.connect(serverConfig);
    
    const tables = await sql.query`
      SELECT TABLE_NAME, TABLE_TYPE
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `;

    const schema = [];
    for (const table of tables.recordset) {
      const columns = await sql.query`
        SELECT 
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.IS_NULLABLE,
          CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as IS_PRIMARY_KEY
        FROM 
          INFORMATION_SCHEMA.COLUMNS c
          LEFT JOIN (
            SELECT ku.COLUMN_NAME
            FROM 
              INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
              JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
                ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
            WHERE 
              tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
              AND ku.TABLE_NAME = ${table.TABLE_NAME}
          ) pk ON c.COLUMN_NAME = pk.COLUMN_NAME
        WHERE 
          c.TABLE_NAME = ${table.TABLE_NAME}
        ORDER BY 
          c.ORDINAL_POSITION
      `;

      schema.push({
        name: table.TABLE_NAME,
        type: table.TABLE_TYPE,
        columns: columns.recordset.map(col => ({
          name: col.COLUMN_NAME,
          type: col.DATA_TYPE,
          nullable: col.IS_NULLABLE === 'YES',
          isPrimary: col.IS_PRIMARY_KEY === 1
        })),
      });
    }

    return schema;
  } finally {
    await sql.close();
  }
}