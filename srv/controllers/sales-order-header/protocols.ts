import { SalesOrderHeader, SalesOrderHeaders } from "@cds-models/sales";
import { User } from "@sap/cds";

export type CreationPayloadValidationResult = {
    hasErrors: boolean;
    totalAmount?: number;
    error?: Error;
};

export interface SalesOrderHeaderController {
        beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult>;
        afterCreate(params: SalesOrderHeaders, loggedUser: User): Promise<void>;
}