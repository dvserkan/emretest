import { NextApiRequest, NextApiResponse } from 'next';
import { db } from './superset';
import { OrderDetail } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const orderKey = req.query.orderKey as string;
    if (!orderKey) {
        return res.status(400).json({ error: 'OrderKey is required' });
    }

    try {
        const sql = `
            DECLARE @orderKeyParam UNIQUEIDENTIFIER = '${orderKey}'
            
            SELECT 
                (
                    SELECT TOP 1 
                        row.*,
                        CASE 
                            WHEN OrderType = 1 THEN 'MASA'
                            WHEN OrderType = 2 THEN 'Bar Çeki'
                            WHEN OrderType = 3 THEN 'Al Götür'
                            WHEN OrderType = 4 THEN 'Tazgah Satış'
                            WHEN OrderType = 5 THEN 'Paket Satış'
                        END SatisTuru,
                        CONVERT(VARCHAR, OrderDateTime, 120) as TarihText
                    FROM dbo.OrderHeaders as row WITH (NOLOCK)
                    WHERE row.OrderKey = @orderKeyParam
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) as header,
                (
                    SELECT 
                        row.*,
                        CASE WHEN row.LineDeleted=1 THEN 'İptal' ELSE '' END Status,
                        convert(varchar, PaymentDateTime, 108) as SaatText
                    FROM dbo.OrderPayments as row WITH (NOLOCK)
                    WHERE row.OrderKey = @orderKeyParam
                    FOR JSON PATH
                ) as payments,
                (
                    SELECT 
                        row.*,
                        CASE WHEN row.LineDeleted=1 THEN 'İptal' ELSE '' END Status,
                        convert(varchar, ISNULL(EditDateTime,AddDateTime), 108) as SaatText
                    FROM dbo.OrderTransactions as row WITH (NOLOCK)
                    WHERE row.OrderKey = @orderKeyParam
                    FOR JSON PATH
                ) as transactions
        `;

        const response = await db.query<OrderDetail>(sql);

        if (!response.data) {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}