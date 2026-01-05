import cds, { Request, Service } from '@sap/cds';
import { Customers, SalesOrderItem, Product, Products, SalesOrderHeaders, SalesOrderItems } from '@cds-models/sales';

export default (service: Service) => {
    service.after('READ', 'Customers', (results: Customers) => {
        results.forEach(customer => {
            if (customer.email?.includes('@')) {
                customer.email = `${customer.email}@gmail.com`;
            }
        })
    });
    service.before('CREATE', 'SalesOrderHeaders', async (request: Request) => {
        const params = request.data;

        if (!params.customer_id) {
            return request.reject(400, 'Customer ID Inválido');
        }

        if (!params.items || params.items?.length === 0) {
            return request.reject(400, 'Items Inválidos');
        }

        const customerQuery = SELECT.one.from('sales.Customers').where({ id: params.customer_id });
        const customer = await cds.run(customerQuery);
        if (!customer) {
            return request.reject(404, 'Customer Não Encontrado');
        }
        const productsIds: string[] = params.items.map((item: SalesOrderItem) => item.product_id);
        const productQuery = SELECT.from('sales.Products').where({ id: productsIds });
        const products = await cds.run(productQuery);
        const dbproducts = products.map((product: Product) => product.id);
        for (const item of params.items) {
            const dbproduct = products.find((product: Product) => product.id === item.product_id);
            if (!dbproduct) {
                return request.reject(404, `Produto(s) ${item.product_id} Inválido(s)`);
            }
            if (dbproduct.stock === 0) {
                return request.reject(400, `Produto(s) ${item.product_id} Fora de Estoque`);
            }
        }


    });
    

    service.after('CREATE', 'SalesOrderHeaders', async (results: SalesOrderHeaders) => {
    const headersAsArray = Array.isArray(results) ? results : [results] as SalesOrderHeaders;

    for (const header of headersAsArray) {
        const items = header.items as SalesOrderItems;

        const productsData = items.map(item => ({
            id: item.product_id as string,
            quantity: item.quantity as number
        }));

        const productsIds: string[] = productsData.map((productData) => productData.id);
        const productsQuery = SELECT.from('sales.Products').where({ id: productsIds });
        const products: Products = await cds.run(productsQuery);

        for (const productData of productsData) {
            const foundProduct = products.find(product => product.id === productData.id) as Product;
            
            foundProduct.stock = (foundProduct.stock as number) - productData.quantity;

            await cds.update('sales.Products')
                .where({ id: foundProduct.id })
                .with({ stock: foundProduct.stock });
        }
    }
});
}

