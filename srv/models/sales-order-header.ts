type SalesOrderHeaderProps = {
    id: string;
    customer_id: string;
};

type CreationPayload = {
    customer_id: SalesOrderHeaderProps['customer_id'];
    items: any[];
};

type CreationPayloadValidationResult = {
    hasErrors: boolean;
    errors?: Error;
};

export class SalesOrderHeaderModel {
    constructor(private props: SalesOrderHeaderProps) { }


    public get id() {
        return this.props.id;
    }

    public get CustomerId() {
        return this.props.customer_id;
    }

    public validateCreationPayload(params: CreationPayload): CreationPayloadValidationResult {
        if (!params.customer_id) {
            return { hasErrors: true, errors: new Error('Customer ID Inválido') };
        }

        if (!params.items || params.items?.length === 0) {
            return { hasErrors: true, errors: new Error('Items Inválidos') };
        }
        return { hasErrors: false };
    }
}