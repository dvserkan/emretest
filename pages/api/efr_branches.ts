import { NextApiRequest, NextApiResponse } from 'next';
import { db } from './superset';
import { jwtVerify } from 'jose';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

        const cookies = req.headers.cookie?.split(';').reduce((acc: { [key: string]: string }, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        if (cookies) {
            const accessToken = cookies['access_token'];
            const decoded = await jwtVerify(
                accessToken,
                ACCESS_TOKEN_SECRET
            );

            // Token payload'ından userId'i al
            const userId = decoded.payload.userId;

            if (!userId) {
                return res.status(400).json({ error: 'No branches found in token' });
            }
            const sql = "SELECT DISTINCT b.* FROM Efr_Branchs b WHERE b.IsActive = 1 AND b.CountryName = 'TÜRKİYE' AND EXISTS (SELECT 1 FROM Efr_Users u WHERE u.UserID = '{{ userId }}' AND u.IsActive = 1 AND (u.Category = 5 OR  CHARINDEX(',' + CAST(b.BranchID AS VARCHAR) + ',', ',' + u.UserBranchs + ',') > 0))";
            const response = await db.query(sql, { templateParams: JSON.stringify({ userId }) });

            if (response.data == null) {
                return res.status(400).json(response.error);
            }
            return res.status(200).json(response.data);

        }


        return res.status(400).json("");

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
