import { SalesOrderHeaderModel } from '@/models/sales-order-header';
import { SalesOrderHeaderRepository } from './protocols';
import cds from '@sap/cds';

export class SalesOrderHeaderRepositoryImpl implements SalesOrderHeaderRepository {
    public async bulkCreate(headers: SalesOrderHeaderModel[]): Promise<void> {
        const headersObjects = headers.map(header => header.toCreationObject());
        await cds.create('sales.SalesOrderHeaders').entries(headersObjects);

    }
}
