import { OpenAPIV3 } from 'openapi-types';

export interface TableSchema {
  name: string;
  type: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    isPrimary?: boolean;
  }>;
}

export function generateOpenAPISpec(
  tables: TableSchema[],
  baseUrl: string
): OpenAPIV3.Document {
  const paths: OpenAPIV3.PathsObject = {};
  const schemas: { [key: string]: OpenAPIV3.SchemaObject } = {};

  for (const table of tables) {
    const entityName = table.name;
    const schemaName = capitalize(entityName);

    // Generate schema
    schemas[schemaName] = {
      type: 'object',
      properties: table.columns.reduce((acc, col) => ({
        ...acc,
        [col.name]: {
          type: mapDBTypeToOpenAPI(col.type),
          nullable: col.nullable,
        },
      }), {}),
      required: table.columns
        .filter(col => !col.nullable)
        .map(col => col.name),
    };

    // Generate paths
    paths[`/${entityName}`] = {
      get: {
        summary: `List ${entityName}`,
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          '200': {
            description: `List of ${entityName}`,
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: `#/components/schemas/${schemaName}` },
                },
              },
            },
          },
        },
      },
      post: {
        summary: `Create ${entityName}`,
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${schemaName}` },
            },
          },
        },
        responses: {
          '201': {
            description: `${schemaName} created`,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` },
              },
            },
          },
        },
      },
    };

    paths[`/${entityName}/{id}`] = {
      get: {
        summary: `Get ${entityName} by ID`,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: `${schemaName} found`,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` },
              },
            },
          },
        },
      },
      put: {
        summary: `Update ${entityName}`,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${schemaName}` },
            },
          },
        },
        responses: {
          '200': {
            description: `${schemaName} updated`,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` },
              },
            },
          },
        },
      },
      delete: {
        summary: `Delete ${entityName}`,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': {
            description: `${schemaName} deleted`,
          },
        },
      },
    };
  }

  return {
    openapi: '3.0.0',
    info: {
      title: 'Generated API',
      version: '1.0.0',
      description: 'Automatically generated REST API',
    },
    servers: [{ url: baseUrl }],
    paths,
    components: { schemas },
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapDBTypeToOpenAPI(dbType: string): string {
  const typeMap: { [key: string]: string } = {
    'int': 'integer',
    'bigint': 'integer',
    'varchar': 'string',
    'text': 'string',
    'boolean': 'boolean',
    'date': 'string',
    'timestamp': 'string',
    'float': 'number',
    'double': 'number',
    'decimal': 'number',
  };

  return typeMap[dbType.toLowerCase()] || 'string';
}