import { CustomerController } from './protrocols.js';
import { Customers } from '@cds-models/sales/index.js';
import { CustomerService } from '@/services/customer/protocols.js';
import { BaseControllerImpl, BaseControllerResponse } from '@/controllers/base';

export class CustomerControllerImpl extends BaseControllerImpl implements CustomerController {
    constructor(private readonly service: CustomerService) {
        super();
    }

    public afterRead(customerList: Customers): BaseControllerResponse {
        const result = this.service.afterRead(customerList);

        if (result.isLeft()) {
            return this.error(result.value.code, result.value.message);
        }

        return this.sucess(result.value);
    }
}
