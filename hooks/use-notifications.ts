import { useState, useEffect } from 'react';
import { Notification } from '@/types/tables';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications');
                if (!response.ok) throw new Error('Bildirimler alınamadı');
                const data = await response.json();
                setNotifications(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30 saniyede bir güncelle
        return () => clearInterval(interval);
    }, []);

    return { notifications, loading, error };
}