import { Customers } from '@cds-models/sales';
import { CustomerModel } from '@/models/customer';
import { CustomerService } from './protocols';
import { Either, left, right } from '@sweet-monads/either'
import { AbstractError, ServerError } from '@/errors/index';

export class CustomerServiceImpl implements CustomerService {
    public afterRead(customerList: Customers): Either<AbstractError, Customers> {

        try {
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
        return right(customers);
        } catch (error) {
            const errorInstance: Error = error as Error;
            return left(new ServerError(errorInstance.stack as string, errorInstance.message as 'internalServerError'));
        }

    }
}
