import { SalesOrderHeader, SalesOrderHeaders } from '@cds-models/sales';
import { User } from '@sap/cds';
import { CreationPayloadValidationResult, SalesOrderHeaderController } from './protocols';
import { SalesOrderHeaderService } from '@/services/sales-order-header/protocols';
import { Payload as BulkCreateSalesOrderPayload } from '@cds-models/db/types/BulkCreateSalesOrder';

export class SalesOrderHeaderControllerImpl implements SalesOrderHeaderController {
    constructor(private readonly service: SalesOrderHeaderService) { }


    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        return this.service.beforeCreate(params);
    }

    public async afterCreate(params: SalesOrderHeaders, loggedUser: User): Promise<void> {
        return this.service.afterCreate(params, loggedUser);
    }

    public async bulkCreate(headers: BulkCreateSalesOrderPayload[], loggedUser: User): Promise<CreationPayloadValidationResult> {
        return this.service.bulkCreate(headers, loggedUser);
    }

    public async cloneSalesOrder(id: string, loggedUser: User): Promise<CreationPayloadValidationResult> {
        return this.service.cloneSalesOrder(id, loggedUser);
    }
}
