
import { NextApiRequest, NextApiResponse } from 'next';
import { db} from './superset';
import { WebReportGroup } from '@/types/tables';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = 
`SELECT
  g.AutoID as GroupAutoID,
  g.GroupName as GroupName,
  i.AutoID as ReportAutoID,
  i.ReportID as ReportID,
  i.ReportName as ReportName,
  g.SecurityLevel as GroupSecurityLevel,
  g.SecurityLevel as ReportSecurityLevel,
  g.DisplayOrderID as GroupDisplayOrderID,
  i.DisplayOrderID as ReportDisplayOrderID,
  g.Svg as GroupIcon
FROM
  infiniaWebReportGroups2 g WITH (NOLOCK)
  INNER JOIN infiniaWebReports AS i WITH (NOLOCK) ON i.GroupID = g.AutoID 
WHERE 1=1
  AND i.ShowDesktop = 1 
ORDER BY
  g.DisplayOrderID,
  i.DisplayOrderID`;
        const response = await db.query<WebReportGroup[]>(sql)

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