import { ProductModel } from './product';

type SalesOrderItemProps = {
    id: string;
    price: number;
    productId: string;
    quantity: number;
    products: ProductModel[]
};

type SalesOrderItemPropsWithoutId = Omit<SalesOrderItemProps, 'id'>;

type CreationPayload = {
    product_id: SalesOrderItemProps['productId'];
};


type CreationPayloadValidationResult = {
    hasErrors: boolean;
    errors?: Error;
};

export class SalesOrderItemModel {
    constructor(private props: SalesOrderItemProps) { }

    public static create(props: SalesOrderItemPropsWithoutId): SalesOrderItemModel {
        return new SalesOrderItemModel({
            ...props,
            id: crypto.randomUUID()
        });
    }

    public get id() {
        return this.props.id;
    }

    public get price() {
        return this.props.price;
    }

    public get productId() {
        return this.props.productId;
    }

    public get quantity() {
        return this.props.quantity;
    }

    public get products() {
        return this.props.products;
    }

    public validateCreationPayload(params: CreationPayload): CreationPayloadValidationResult {
        const product = this.products.find(product => product.id === params.product_id);
        if (!product) {
            return { hasErrors: true, errors: new Error(`Produto(s) ${params.product_id} Inválido(s)`) };
        }
        if (product.stock === 0) {
            return { hasErrors: true, errors: new Error(`Produto(s) ${product.name} Fora de Estoque`) };
        }
        return { hasErrors: false };
    }
}
