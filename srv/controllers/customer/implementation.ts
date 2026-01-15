import { CustomerController } from './protrocols.js';
import { Customers } from '@cds-models/sales/index.js';
import { CustomerService } from '@/services/customer/protocols.js';

export class CustomerControllerImpl implements CustomerController {
    constructor(private readonly service: CustomerService) {}
    public afterRead(customerList: Customers): Customers {
        return this.service.afterRead(customerList);
    }
}
