import { SalesOrderHeaderService } from "srv/services/sales-order-header/protocols";
import { SalesOrderHeaderServiceImpl } from "srv/services/sales-order-header/implementation";
import { ProductRepositoryImpl } from "srv/repositories/product/implementation";
import { customerRepositoryImpl } from "srv/repositories/customer/implementation";

const makeSalesOrderHeaderService = (): SalesOrderHeaderService => {
    const customerRepository = new customerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, productRepository);
}

export const salesOrderHeaderService = makeSalesOrderHeaderService();