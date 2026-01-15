import { SalesOrderHeader, SalesOrderHeaders, SalesOrderItem } from '@cds-models/sales';
import { CreationPayloadValidationResult, SalesOrderHeaderService } from './protocols';
import { User } from '@sap/cds';
import { CustomerModel } from '@/models/customer';
import { CustomerRepository } from '@/repositories/customer/protocols';
import { LoggedUserModel } from '@/models/logged-user';
import { ProductModel } from '@/models/product';
import { ProductRepository } from '../../repositories/product/protocols';
import { SalesOrderHeaderModel } from '../../models/sales-order-header';
import { SalesOrderItemModel } from '../../models/sales-order-item';
import { SalesOrderLogModel } from '@/models/sales-order-log';
import { SalesOrderLogRepository } from '@/repositories/sales-order-log/protocols';



export class SalesOrderHeaderServiceImpl implements SalesOrderHeaderService {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly salesOrderLogRepository: SalesOrderLogRepository,
        private readonly productRepository: ProductRepository
    ) { }


    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        const products = await this.getproductsByIds(params);
        if (!products) {
            return {
                hasErrors: true,
                error: new Error('Produto(s)  Inválido(s)')
            };
        }

        const items = this.getSalesOrderItems(params, products);
        const header = this.getsalesOrderHeader(params, items);
        const customer = await this.getCustomerById(params);
        if (!customer) {
            return {
                hasErrors: true,
                error: new Error(`Cliente ${params.customer_id} Inválido`)
            };
        }
        const HeadervalidationResult = header.validateCreationPayload({ customer_id: customer.id });
        if (HeadervalidationResult.hasErrors) {
            return HeadervalidationResult;
        }

        return {
            hasErrors: false,
            totalAmount: header.calculateDiscount()
        };
    }




    public async afterCreate(params: SalesOrderHeaders, loggedUser: User): Promise<void> {
        const headersAsArray = Array.isArray(params) ? params : [params] as SalesOrderHeaders;
        const logs: SalesOrderLogModel[] = [];
        for (const header of headersAsArray) {
            const products = await this.getproductsByIds(header) as ProductModel[];
            const items = this.getSalesOrderItems(header, products);
            const salesOrderHeader = this.getsalesOrderHeader(header, items);
            const productsData = salesOrderHeader.getProductsData();

            for (const product of products) {
                const foundProduct = productsData.find(productData => productData.id === product.id);
                product.sell(foundProduct?.quantity as number);
                await this.productRepository.updateStock(product);
            }
            const user = this.getLogedUser(loggedUser);



            const log = this.getSalesOrderLog(salesOrderHeader, user);

            logs.push(log);
        }

        await this.salesOrderLogRepository.create(logs);

    }

    private async getproductsByIds(params: SalesOrderHeader): Promise<ProductModel[] | null> {
        const productsIds: string[] = params.items?.map((item: SalesOrderItem) => item.product_id) as string[];
        return this.productRepository.findByIds(productsIds);
    }

    private getSalesOrderItems(params: SalesOrderHeader, products: ProductModel[]): SalesOrderItemModel[] {
        return params.items?.map(item => SalesOrderItemModel.create({
            productId: item.product_id as string,
            price: item.price as number,
            quantity: item.quantity as number,
            products
        })) as SalesOrderItemModel[];
    }

    private getsalesOrderHeader(params: SalesOrderHeader, items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.create({
            customer_id: params.customer_id as string,
            items
        });
    }

    private getExistingSalesOrderHeader(params: SalesOrderHeader, items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.with({
            id: params.id as string,
            customer_id: params.customer_id as string,
            totalAmount: params.totalAmount as number,
            items
        });
    }

    private async getCustomerById(params: SalesOrderHeader): Promise<CustomerModel | null> {
        const customerId = params.customer_id as string;
        return this.customerRepository.findById(customerId);
    }

    private getLogedUser(loggedUser: User): LoggedUserModel {
        return LoggedUserModel.create({
            id: loggedUser.id,
            roles: loggedUser.roles as string[],
            attributes: {
                id: loggedUser.attr.id as unknown as number,
                groups: loggedUser.attr.groups as unknown as string[]
            }
        });
    }

    private getSalesOrderLog(salesOrderHeader: SalesOrderHeaderModel, user: LoggedUserModel): SalesOrderLogModel {
        return SalesOrderLogModel.create({
            headerId: salesOrderHeader.id,
            userData: user.toStringfiedObject(),
            orderData: salesOrderHeader.toStringfiedObject()
        });
    }
}
