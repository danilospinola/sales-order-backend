import { CreationPayloadValidationResult, SalesOrderHeaderService } from "./protocols";
import { SalesOrderHeader, SalesOrderItem } from "@cds-models/sales";
import { SalesOrderHeaderModel } from '../../models/sales-order-header'
import { SalesOrderItemModel } from "../../models/sales-order-item";
import { ProductRepository } from "../../repositories/product/protocols"
import { CustomerRepository } from "srv/repositories/customer/protocols";
import { ProductModel } from "srv/models/product";
import { CustomerModel } from "srv/models/customer";



export class SalesOrderHeaderServiceImpl implements SalesOrderHeaderService {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly productRepository: ProductRepository
    ) { }


    public async beforeCreate(params: SalesOrderHeader): Promise<CreationPayloadValidationResult> {
        const products = await this.getproductsByIds(params);
        if (!products) {
            return {
                hasErrors: true,
                error: new Error(`Produto(s)  Inválido(s)`)
            }
        }

        const items = this.getSalesOrderItems(params, products);
        const header = this.getsalesOrderHeader(params, items);
        const customer = await this.getCustomerById(params);
        if (!customer) {
            return {
                hasErrors: true,
                error: new Error(`Cliente ${params.customer_id} Inválido`)
            }
        }
        const HeadervalidationResult = header.validateCreationPayload({ customer_id: customer.id });
        if (HeadervalidationResult.hasErrors) {
            return HeadervalidationResult
        }

        return {
            hasErrors: false,
            totalAmount: header.calculateDiscount()
        };
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

    private async getCustomerById(params: SalesOrderHeader): Promise<CustomerModel | null> {
        const customerId = params.customer_id as string
        return this.customerRepository.findById(customerId);
    }
}