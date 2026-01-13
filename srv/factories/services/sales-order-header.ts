import { SalesOrderHeaderService } from "srv/services/sales-order-header/protocols";
import { SalesOrderHeaderServiceImpl } from "srv/services/sales-order-header/implementation";
import { ProductRepositoryImpl } from "srv/repositories/product/implementation";
import { customerRepositoryImpl } from "srv/repositories/customer/implementation";
import { SalesOrderLogRepositoryImpl } from "srv/repositories/sales-order-log/implementation";

const makeSalesOrderHeaderService = (): SalesOrderHeaderService => {
    const customerRepository = new customerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    const salesOrderLogRespository = new SalesOrderLogRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, salesOrderLogRespository, productRepository);
}

export const salesOrderHeaderService = makeSalesOrderHeaderService();