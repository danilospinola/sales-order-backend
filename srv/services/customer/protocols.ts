
import { AbstractError } from '@/errors';
import { Customers } from '@cds-models/sales';
import { Either } from '@sweet-monads/either';

export interface CustomerService {
    afterRead(customerList: Customers): Either<AbstractError, Customers>
}
