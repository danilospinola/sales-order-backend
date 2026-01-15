import { Customers } from '@cds-models/sales';
import { CustomerModel } from '@/models/customer';
import { CustomerService } from './protocols';

export class CustomerServiceImpl implements CustomerService {
    public afterRead(customerList: Customers): Customers {
        const customers = customerList.map(c => {
            const customer = CustomerModel.with({
                id: c.id as string,
                firstName: c.firstName as string,
                email: c.email as string,
                lastName: c.lastName as string
            });
            customer.setDefaultEmailDomain();
            return customer.setDefaultEmailDomain().toObject();
        });
        return customers;
    }
}
