import {ExpectedResult as SalesReportByDays} from '@cds-models/db/types/SalesReportByDays';

export interface SalesReportController {
    findByDays(days: number): Promise<SalesReportByDays[]>;
    findByCustomerId(customerId: string): Promise<SalesReportByDays[]>;
}