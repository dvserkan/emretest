import { NextApiRequest, NextApiResponse } from 'next';
import { db } from './superset';
import { formatDateTimeYMDHIS } from '@/lib/utils';
import { BranchModel } from '@/types/tables';

interface QueryResult {
    ReportID: string;
    ReportQuery: string;
    ReportQuery2: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date1, date2, branches } = req.body;

    try {
        // İlk sorguyu debug bilgisiyle birlikte yap
        const initialSql = "SELECT ReportID,ReportQuery,ReportQuery2 FROM dm_webWidgets6 WHERE ReportID = '522' AND IsActive=1 AND (ReportQuery != '' OR ReportQuery2 != '') ORDER BY ReportIndex ASC";

        const response = await db.query<QueryResult[]>(initialSql);

        if (!response.data || response.data.length === 0) {
            // Daha detaylı hata bilgisi dön
            return res.status(400).json({
                error: 'No data returned from query',
                details: {
                    sql: initialSql,
                    response: response,
                    reportId: '522'
                }
            });
        }

        // Branch verilerini hazırla
        const branchesString = Array.isArray(branches) ? branches.join(",") : branches;
        console.log('Processing branches:', {
            count: Array.isArray(branches) ? branches.length : 1,
            sample: branchesString.substring(0, 100) + '...'
        });

        // Tarih formatlaması
        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);

        date1Obj.setHours(6, 0, 0, 0);
        date2Obj.setHours(6, 0, 0, 0);

        const d1 = formatDateTimeYMDHIS(date1Obj);
        const d2 = formatDateTimeYMDHIS(date2Obj);


        // Ana sorguyu hazırla
        let reportQuery = response.data[0].ReportQuery.toString()
            .replaceAll(";", "")
            .replaceAll("@date1", "'{{date1}}'")
            .replaceAll("@date2", "'{{date2}}'")
            .replaceAll("@BranchID", "BranchID IN({{branches}})");

        // BranchID syntax düzeltmesi
        reportQuery = reportQuery.replace("BranchID = BranchID IN(", "BranchID IN(");

        // Template parametreleri
        const templateParams = {
            date1: d1,
            date2: d2,
            branches: branchesString
        };

        // Ana sorguyu çalıştır
        const queryResult = await db.query<BranchModel[]>(reportQuery, {
            templateParams: JSON.stringify(templateParams)
        });

        if (!queryResult.data || queryResult.data.length === 0) {
            return res.status(400).json({
                error: 'No branch data found',
                details: {
                    requestedBranches: branchesString,
                    params: templateParams,
                    response: queryResult
                }
            });
        }

        // Sonuçları formatla
        const formattedResults = queryResult.data.map((branch: BranchModel) => ({
            BranchID: Number(branch.BranchID) || 0,
            reportValue1: String(branch.reportValue1 || ''),    // SubeAdi
            reportValue2: Number(branch.reportValue2) || 0,    // TC (Cari dönem ciro)
            reportValue3: Number(branch.reportValue3) || 0,    // GHTC (Geçen hafta aynı saat ciro)
            reportValue4: Number(branch.reportValue4) || 0,    // GHTCTUM (Geçen hafta tüm gün ciro)
            reportValue5: Number(branch.reportValue5) || 0,    // KisiSayisi
            reportValue6: Number(branch.reportValue6) || 0,    // GHKisiSayisi
            reportValue7: Number(branch.reportValue7) || 0,    // GHKisiSayisiTUM
            reportValue8: Number(branch.reportValue8) || 0,    // Oran
            reportValue9: Number(branch.reportValue9) || 0     // GecenHaftaOran
        }));

        return res.status(200).json(formattedResults);

    } catch (error) {
        console.error('Error in widgetbranch API:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }
        });
    }
}
