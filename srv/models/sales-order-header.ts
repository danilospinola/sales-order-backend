import { SalesOrderItemModel } from './sales-order-item';

type SalesOrderHeaderProps = {
    id: string;
    customer_id: string;
    totalAmount: number;
    items: SalesOrderItemModel[];
};

type SalesOrderHeaderPropsWithoutIdAndTotalAmount = Omit<SalesOrderHeaderProps, 'id' | 'totalAmount'>;


type CreationPayload = {
    customer_id: SalesOrderHeaderProps['customer_id'];
};

type CreationPayloadValidationResult = {
    hasErrors: boolean;
    errors?: Error;
};

export class SalesOrderHeaderModel {
    constructor(private props: SalesOrderHeaderProps) { }

    public static create(props: SalesOrderHeaderPropsWithoutIdAndTotalAmount): SalesOrderHeaderModel {
        return new SalesOrderHeaderModel({
            ...props,
            id: crypto.randomUUID(),
            totalAmount: 0
        });
    }

    public static with(props: SalesOrderHeaderProps): SalesOrderHeaderModel {
        return new SalesOrderHeaderModel(props);
    }

    public get id() {
        return this.props.id;
    }

    public get CustomerId() {
        return this.props.customer_id;
    }

    public get totalAmount() {
        return this.props.totalAmount;
    }

    public get items() {
        return this.props.items;
    }

    public set totalAmount(amount: number) {
        this.totalAmount = amount;
    }

    public validateCreationPayload(params: CreationPayload): CreationPayloadValidationResult {
        const customerValidationResult = this.validateCustomerOnCreation(params.customer_id);
        if (customerValidationResult.hasErrors) {
            return customerValidationResult;
        }
        const itemsValidationResult = this.validateItemsOnCreation(this.items);
        if (itemsValidationResult.hasErrors) {
            return itemsValidationResult;
        }
        return { hasErrors: false };
    }



    private validateCustomerOnCreation(customerId: CreationPayload['customer_id']): CreationPayloadValidationResult {
        if (!customerId) {
            return { hasErrors: true, errors: new Error('Customer ID Inválido') };
        }
        return { hasErrors: false };
    }

    private validateItemsOnCreation(items: SalesOrderHeaderProps['items']): CreationPayloadValidationResult {
        if (!items || items?.length === 0) {
            return { hasErrors: true, errors: new Error('Items Inválidos') };
        }
        const itemsErrors: string[] = [];
        items.forEach(item => {
            const validationResult = item.validateCreationPayload({ product_id: item.productId });
            if (validationResult.hasErrors) {
                itemsErrors.push(validationResult.errors?.message as string);
            }
        });
        if (itemsErrors.length > 0) {
            const messages = itemsErrors.join('\n -');
            return { hasErrors: true, errors: new Error(messages) };
        }

        return { hasErrors: false };
    }

    public calculateTotalAmount(): number {
        let totalAmount = 0;
        this.items.forEach(item => {
            totalAmount += (item.price as number) * (item.quantity as number);
        });
        return totalAmount;
    }

    public calculateDiscount(): number {
        const totalAmount = this.calculateTotalAmount();
        if (totalAmount > 30000) {
            return totalAmount * 0.9;
        }
        return totalAmount;
    }   


    public getProductsData(): { id: string; quantity: number }[] {
        return this.items.map(item => ({
            id: item.productId,
            quantity: item.quantity as number
        }));
    }

    public toStringfiedObject(): string {
        return JSON.stringify(this.props);
    }
}
