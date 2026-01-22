import { ExpectedResult as SalesReportByDays } from "@cds-models/db/types/SalesReportByDays";
import { SalesReportService} from "@/services/sales-report/protocols";
import { SalesReportRepository } from "@/repositories/sales-report/protocols";
import { Either, left, right } from "@sweet-monads/either";
import { Server } from "node:http";
import { AbstractError, NotFoundError, ServerError } from "@/errors";

export class SalesReportServiceImpl implements SalesReportService {
    constructor(private readonly repository: SalesReportRepository) {}

    public async findByDays(days: 7): Promise<Either<AbstractError, SalesReportByDays[]>> {
        try {
                    const reportData = await this.repository.findByDays(days);
        if (!reportData) {
            const stack = new Error().stack as string;
            return left(new NotFoundError('Nenhum dado encontrado para os dias informados', stack));
        }
        const mappedData = reportData.map((r) => r.toObject()); 
        return right(mappedData);
            
        } catch (error) {
            const errorInstance = error as Error;
            return left(new ServerError(errorInstance.stack as string, errorInstance.message as 'internalServerError'));
        }



    }

    public async findByCustomerId(customerId: string): Promise<SalesReportByDays[]> {
        const reportData = await this.repository.findByCustomerId(customerId);
        if (!reportData) {
            return [];
        }
        return reportData.map((r) => r.toObject());
    }
}
