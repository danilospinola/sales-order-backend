import { ExpectedResult as SalesReportByDays } from "@cds-models/db/types/SalesReportByDays";


export interface SalesReportService {
    findByDays(days: number): Promise<SalesReportByDays[]>;
}