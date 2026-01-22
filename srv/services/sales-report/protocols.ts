import { AbstractError } from "@/errors";
import { ExpectedResult as SalesReportByDays } from "@cds-models/db/types/SalesReportByDays";
import { Either } from "@sweet-monads/either";


export interface SalesReportService {
    findByDays(days: number): Promise<Either<AbstractError, SalesReportByDays[]>    >;
    findByCustomerId(customerId: string): Promise<Either<AbstractError, SalesReportByDays[]>>;
}