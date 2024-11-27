"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, TableIcon, CodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { generateOpenAPISpec } from "@/lib/api-generator";

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary?: boolean;
}

interface Table {
  name: string;
  type: string;
  columns: Column[];
}

export default function SchemaPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAPISpec, setOpenAPISpec] = useState<any>(null);

  useEffect(() => {
    fetchSchema();
  }, []);

  async function fetchSchema() {
    try {
      const response = await fetch("/api/database/schema");
      if (!response.ok) {
        throw new Error("Failed to fetch schema");
      }
      const data = await response.json();
      setTables(data);
    } catch (error) {
      setError("Failed to load database schema");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function toggleTable(tableName: string) {
    setSelectedTables(prev =>
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  }

  function generateAPI() {
    const selectedTableSchemas = tables.filter(t => 
      selectedTables.includes(t.name)
    );
    
    const spec = generateOpenAPISpec(
      selectedTableSchemas,
      window.location.origin + "/api"
    );
    
    setOpenAPISpec(spec);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.push("/")}>
          Return to Connection Page
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TableIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Database Schema</h1>
          </div>
          <Button
            onClick={generateAPI}
            disabled={selectedTables.length === 0}
          >
            <CodeIcon className="mr-2 h-4 w-4" />
            Generate API
          </Button>
        </div>

        <Tabs defaultValue="schema">
          <TabsList className="mb-4">
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="api" disabled={!openAPISpec}>
              API Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schema">
            <div className="grid gap-4">
              {tables.map(table => (
                <div
                  key={table.name}
                  className="bg-card p-4 rounded-lg border shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Checkbox
                      id={table.name}
                      checked={selectedTables.includes(table.name)}
                      onCheckedChange={() => toggleTable(table.name)}
                    />
                    <label
                      htmlFor={table.name}
                      className="text-lg font-semibold"
                    >
                      {table.name}
                    </label>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Column</th>
                          <th className="text-left py-2 px-4">Type</th>
                          <th className="text-left py-2 px-4">Nullable</th>
                          <th className="text-left py-2 px-4">Primary Key</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((column, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-2 px-4">{column.name}</td>
                            <td className="py-2 px-4">{column.type}</td>
                            <td className="py-2 px-4">
                              {column.nullable ? "Yes" : "No"}
                            </td>
                            <td className="py-2 px-4">
                              {column.isPrimary ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api">
            {openAPISpec && (
              <div className="bg-white rounded-lg border shadow-sm">
                <SwaggerUI spec={openAPISpec} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}