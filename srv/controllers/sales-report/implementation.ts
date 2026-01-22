import { SalesReportController } from "@/controllers/sales-report/protocols";
import { SalesReportService } from "@/services/sales-report/protocols";
import { ExpectedResult as SalesReportByDays } from "@cds-models/db/types/SalesReportByDays";
import { BaseControllerImpl, BaseControllerResponse } from "@/controllers/base";

export class SalesReportControllerImpl extends BaseControllerImpl implements SalesReportController {
    constructor(private readonly service: SalesReportService) {
        super();
    }

    public async findByDays(days: number): Promise<BaseControllerResponse> {
        const result = await this.service.findByDays(days);
        if (result.isLeft()) {
            return this.error(result.value.code, result.value.message);
        }
        return this.sucess(result.value);
    }

    public async findByCustomerId(customerId: string): Promise<SalesReportByDays[]> {
        return this.service.findByCustomerId(customerId);
    }
}