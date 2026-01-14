import { CustomerController } from 'srv/controllers/customer/protrocols';
import { CustomerControllerImpl } from 'srv/controllers/customer/implementation';
import { customerService } from '../services/customer';

const makeCustomerController = (): CustomerController => {
    return new CustomerControllerImpl(customerService);
};

export const customerController = makeCustomerController();
