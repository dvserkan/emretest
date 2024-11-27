import mysql from 'mysql2/promise';
import { Client } from 'pg';
import sql from 'mssql';
import { z } from 'zod';

export const dbConfigSchema = z.object({
  type: z.enum(["mysql", "postgresql", "mssql"]),
  host: z.string(),
  port: z.string(),
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
    port: parseInt(config.port),
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
    port: parseInt(config.port),
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

  try {
    const tables = await sql.query`
      SELECT TABLE_NAME, TABLE_TYPE
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `;

    const schema = [];
    for (const table of tables.recordset) {
      const columns = await sql.query`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE,
               COLUMNPROPERTY(OBJECT_ID(TABLE_NAME), COLUMN_NAME, 'IsIdentity') as IS_IDENTITY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = ${table.TABLE_NAME}
      `;

      schema.push({
        name: table.TABLE_NAME,
        type: table.TABLE_TYPE,
        columns: columns.recordset,
      });
    }

    return schema;
  } finally {
    await sql.close();
  }
}