import {Customers} from "@cds-models/sales"

export interface CustomerController {
    afterRead(customerList: Customers): Customers;
}