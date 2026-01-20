import { SalesOrderHeader, SalesOrderHeaders } from '@cds-models/sales';
import { Payload as BulkCreateSalesOrderPayload } from '@cds-models/db/types/BulkCreateSalesOrder';
import { User } from '@sap/cds';
import { ProductModel } from '@/models/product';
import { CustomerModel } from '@/models/customer';

export type CreationPayloadValidationResult = {
    hasErrors: boolean;
    totalAmount?: number;
    products?: ProductModel[],
    customer?: CustomerModel;
    error?: Error;
};

export interface SalesOrderHeaderService {
    beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult>;
    afterCreate(params: SalesOrderHeaders, loggedUser: User): Promise<void>;
    bulkCreate(params: BulkCreateSalesOrderPayload[], loggedUser: User): Promise<CreationPayloadValidationResult>;
}
