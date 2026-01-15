import { customerRepositoryImpl } from '@/repositories/customer/implementation';
import { ProductRepositoryImpl } from '@/repositories/product/implementation';
import { SalesOrderLogRepositoryImpl } from '@/repositories/sales-order-log/implementation';
import { SalesOrderHeaderService } from '@/services/sales-order-header/protocols';
import { SalesOrderHeaderServiceImpl } from '@/services/sales-order-header/implementation';

const makeSalesOrderHeaderService = (): SalesOrderHeaderService => {
    const customerRepository = new customerRepositoryImpl();
    const productRepository = new ProductRepositoryImpl();
    const salesOrderLogRespository = new SalesOrderLogRepositoryImpl();
    return new SalesOrderHeaderServiceImpl(customerRepository, salesOrderLogRespository, productRepository);
};

export const salesOrderHeaderService = makeSalesOrderHeaderService();
