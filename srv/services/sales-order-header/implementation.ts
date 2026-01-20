import { SalesOrderHeader, SalesOrderHeaders } from '@cds-models/sales';
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
import { Payload as BulkCreateSalesOrderPayload } from '@cds-models/db/types/BulkCreateSalesOrder';
import { SalesOrderHeaderRepository } from '@/repositories/sales-order-header/protocols';



export class SalesOrderHeaderServiceImpl implements SalesOrderHeaderService {
    constructor(
        private readonly salesOrderHeaderRepository: SalesOrderHeaderRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly salesOrderLogRepository: SalesOrderLogRepository,
        private readonly productRepository: ProductRepository
    ) { }


    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        const productsValidationResult = await this.validateProductsOnCreation(params);
        if (productsValidationResult.hasErrors) {
            return productsValidationResult;
        }

        const items = this.getSalesOrderItems(params, productsValidationResult.products as ProductModel[]);
        const header = this.getsalesOrderHeader(params, items);
        const customerValidationResult = await this.validateCustomerOnCreation(params);
        if (customerValidationResult.hasErrors) {
            return customerValidationResult;
        }
        const HeadervalidationResult = header.validateCreationPayload({ customer_id: (customerValidationResult.customer as CustomerModel).id });
        if (HeadervalidationResult.hasErrors) {
            return HeadervalidationResult;
        }

        return {
            hasErrors: false,
            totalAmount: header.calculateDiscount()
        };
    }




    public async afterCreate(params: SalesOrderHeaders | BulkCreateSalesOrderPayload[], loggedUser: User): Promise<void> {
        const headersAsArray = Array.isArray(params) ? params : [params] as SalesOrderHeaders;
        const logs: SalesOrderLogModel[] = [];
        for (const header of headersAsArray) {
            const products = await this.getproductsByIds(header) as ProductModel[];
            const items = this.getSalesOrderItems(header, products);
            const salesOrderHeader = this.getExistingSalesOrderHeader(header, items);
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

    public async bulkCreate(headers: BulkCreateSalesOrderPayload[], loggedUser: User): Promise<CreationPayloadValidationResult> {
        const bulkCreateHeaders: SalesOrderHeaderModel[] = []
        for (const headerObject of headers) {
            const productValidation = await this.validateProductsOnCreation(headerObject);
            if (productValidation.hasErrors) {
                return productValidation;
            }
            const items = this.getSalesOrderItems(headerObject, productValidation.products as ProductModel[]);
            const header = this.getsalesOrderHeader(headerObject, items);
            const customerValidationResult = await this.validateCustomerOnCreation(headerObject);
            if (customerValidationResult.hasErrors) {
                return customerValidationResult;
            }
            const HeadervalidationResult = header.validateCreationPayload({ customer_id: (customerValidationResult.customer as CustomerModel).id });
            if (HeadervalidationResult.hasErrors) {
                return HeadervalidationResult;
            }
            bulkCreateHeaders.push(header);
        }
        await this.salesOrderHeaderRepository.bulkCreate(bulkCreateHeaders);
        await this.afterCreate(headers, loggedUser);
        return this.serializeBulkCreateResult(bulkCreateHeaders);
    }

    public async cloneSalesOrder(id: string, loggedUser: User): Promise<CreationPayloadValidationResult> {
        const header = await this.salesOrderHeaderRepository.findCompleteSalesOrderById(id);
        if (!header) {
            return {
                hasErrors: true,
                error: new Error('Pedido de Venda não encontrado')
            };
        }
        const HeadervalidationResult = header.validateCreationPayload({ customer_id: header.CustomerId });
        if (HeadervalidationResult.hasErrors) {
            return HeadervalidationResult;
        }
        await this.salesOrderHeaderRepository.bulkCreate([header]);
        await this.afterCreate([header.toCreationObject()], loggedUser);
        return this.serializeBulkCreateResult([header]);
    }

    private serializeBulkCreateResult(headers: SalesOrderHeaderModel[]): CreationPayloadValidationResult {
        return {
            hasErrors: false,
            headers: headers.map(header => header.toCreationObject())
        };
    }

    private async validateProductsOnCreation(header: SalesOrderHeader | BulkCreateSalesOrderPayload): Promise<CreationPayloadValidationResult> {
        const products = await this.getproductsByIds(header);
        if (!products) {
            return {
                hasErrors: true,
                error: new Error('Produto(s)  Inválido(s)')
            };
        }
        return {
            hasErrors: false,
            products
        };
    }

    private async validateCustomerOnCreation(header: SalesOrderHeader | BulkCreateSalesOrderPayload): Promise<CreationPayloadValidationResult> {
        const customer = await this.getCustomerById(header);
        if (!customer) {
            return {
                hasErrors: true,
                error: new Error(`Cliente Inválido`)
            };
        }
        return {
            hasErrors: false,
            customer
        };
    }
    private async getproductsByIds(params: SalesOrderHeader | BulkCreateSalesOrderPayload): Promise<ProductModel[] | null> {
        const productsIds: string[] = params.items?.map((item) => item.product_id) as string[];
        return this.productRepository.findByIds(productsIds);
    }

    private getSalesOrderItems(params: SalesOrderHeader | BulkCreateSalesOrderPayload, products: ProductModel[]): SalesOrderItemModel[] {
        return params.items?.map(item => SalesOrderItemModel.create({
            productId: item.product_id as string,
            price: item.price as number,
            quantity: item.quantity as number,
            products
        })) as SalesOrderItemModel[];
    }

    private getsalesOrderHeader(params: SalesOrderHeader | BulkCreateSalesOrderPayload, items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.create({
            customer_id: params.customer_id as string,
            items
        });
    }

    private getExistingSalesOrderHeader(params: SalesOrderHeader | BulkCreateSalesOrderPayload, items: SalesOrderItemModel[]): SalesOrderHeaderModel {
        return SalesOrderHeaderModel.with({
            id: params.id as string,
            customer_id: params.customer_id as string,
            totalAmount: params.totalAmount as number,
            items
        });
    }

    private async getCustomerById(params: SalesOrderHeader | BulkCreateSalesOrderPayload): Promise<CustomerModel | null> {
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
