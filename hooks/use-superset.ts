
import { useState } from 'react';

interface UseQueryResult<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    execute: (sql: string) => Promise<void>;
}

export function useSuperset<T = any>(): UseQueryResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const execute = async (sql: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sql }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Query execution failed');
            }

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    


    return { data, error, isLoading, execute };
}