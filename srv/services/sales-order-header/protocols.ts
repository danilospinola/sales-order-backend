import { SalesOrderHeader } from "@cds-models/sales";

export type CreationPayloadValidationResult = {
    hasErrors: boolean;
    totalAmount?: number;
    error?: Error;
};

export interface SalesOrderHeaderService {
    beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult>;
}