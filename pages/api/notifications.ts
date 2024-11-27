import { NextApiRequest, NextApiResponse } from 'next';
import { db } from './superset';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = `
            SELECT TOP 10 
                row.AutoID as autoId,
                row.LogKey as logKey,
                row.BranchID as branchId,
                CONVERT(VARCHAR, row.OrderDateTime, 120) as orderDateTime,
                row.OrderKey as orderKey,
                row.UserName as userName,
                row.VoidAmount as voidAmount,
                row.DiscountAmount as discountAmount,
                row.AmountDue as amountDue,
                CONVERT(VARCHAR, row.DeliveryTime, 120) as deliveryTime,
                row.LogTitle as logTitle,
                row.LogDetail as logDetail,
                CONVERT(VARCHAR, row.AddDateTime, 120) as addDateTime,
                row.DeviceSended as deviceSended,
                br.BranchName as branchName,
                CASE 
                    WHEN row.LogTitle = 'Çek Tutar' THEN 'sale'
                    WHEN row.LogTitle LIKE '%İndirim%' THEN 'discount'
                    WHEN row.LogTitle LIKE '%İptal%' THEN 'cancel'
                    ELSE 'alert'
                END as type
            FROM dbo.infiniaActivityLogs AS row WITH (NOLOCK)
            LEFT JOIN efr_Branchs br WITH (NOLOCK) ON br.BranchID = row.BranchID
            ORDER BY row.OrderDateTime DESC
        `;

        const response = await db.query<Notification[]>(sql);

        if (!response.data) {
            return res.status(400).json(response.error);
        }

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}