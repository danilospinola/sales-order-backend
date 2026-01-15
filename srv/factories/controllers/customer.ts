import { CustomerController } from '@/controllers/customer/protrocols';
import { CustomerControllerImpl } from '@/controllers/customer/implementation';
import { customerService } from '../services/customer';

const makeCustomerController = (): CustomerController => {
    return new CustomerControllerImpl(customerService);
};

export const customerController = makeCustomerController();
