import { SalesReportController } from "@/controllers/sales-report/protocols";
import { SalesReportService } from "@/services/sales-report/protocols";
import { ExpectedResult as SalesReportByDays } from "@cds-models/db/types/SalesReportByDays";

export class SalesReportControllerImpl implements SalesReportController {
    constructor(private readonly service: SalesReportService) {}

    public async findByDays(days: number): Promise<SalesReportByDays[]> {
        return this.service.findByDays(days);
    }

    public async findByCustomerId(customerId: string): Promise<SalesReportByDays[]> {
        return this.service.findByCustomerId(customerId);
    }
}