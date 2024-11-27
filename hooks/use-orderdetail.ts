import { useState } from 'react';
import { OrderDetail } from '@/types/tables';

export function useOrderDetail() {
    const [isOpen, setIsOpen] = useState(false);
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrderDetail = async (orderKey: string) => {
        setIsOpen(true);
        setLoading(true);
        setError(null);
        setOrderDetail(null);

        try {
            const response = await fetch(`/api/order-detail?orderKey=${orderKey}`);
            if (!response.ok) throw new Error('Sipariş detayı alınamadı');

            const data = await response.json();
            setOrderDetail(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
            setIsOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return {
        isOpen,
        setIsOpen,
        orderDetail,
        loading,
        error,
        fetchOrderDetail
    };
}