
import { SalesReportModel } from "@/models/sales-report";
import { SalesReportRepository } from "@/repositories/sales-report/protocols";
import { ExpectedResult as SalesReportByDays } from "@cds-models/db/types/SalesReportByDays";
import cds from "@sap/cds";

export class SalesReportRepositoryImpl implements SalesReportRepository {
    public async findByDays(days: number): Promise<SalesReportModel[] | null> {
        const today = new Date().toISOString();
        const subtractedDays = new Date();
        subtractedDays.setDate(subtractedDays.getDate() - days);
        const subtractedDaysISO = subtractedDays.toISOString();
        const sql = this.getReportBaseSql().where({ createdAt: { between: subtractedDaysISO, and: today } });
        const salesReport = await cds.run(sql);
        
        return this.mapReportResult(salesReport);
    }

    public async findByCustomerId(customerId: string): Promise<SalesReportModel[] | null> {
        const sql = this.getReportBaseSql().where({ customer_id: customerId });


        const salesReport = await cds.run(sql);

        return this.mapReportResult(salesReport);

    }

    private getReportBaseSql(): cds.ql.SELECT<unknown, unknown> {
        return SELECT.from('sales.SalesOrderHeaders').columns(
            'id as SalesOrderId',
            'totalAmount as SalesOrderTotalAmount',
            'customer.id as customerId',
            `customer.firstName || ' ' || customer.lastName as customerFullName`
        );
    }

    private mapReportResult(salesReport: SalesReportByDays[]): SalesReportModel[] | null {
        if (salesReport.length === 0) {
            return null;
        }
        return salesReport.map((salesReport: SalesReportByDays) =>
            SalesReportModel.with({
                salesOrderId: salesReport.salesOrderId as string,
                salesOrderTotalAmount: salesReport.salesOrderTotalAmount as number,
                customerId: salesReport.customerId as string,
                customerFullName: salesReport.customerFullName as string
            })
        );
    }
}