import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/pages/api/superset';
import { Efr_Users } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const sql = "SELECT UserID, UserName, UserBranchs FROM Efr_users";
        const response = await db.query<Efr_Users[]>(sql);

        if (response.data == null) {
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
