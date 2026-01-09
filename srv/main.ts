import cds, { Request, Service } from '@sap/cds';
import { Customers, SalesOrderItem, Product, Products, SalesOrderHeaders, SalesOrderItems } from '@cds-models/sales';
import { customerController } from './factories/controllers/customer';
import { FullRequestParams } from './protocols';



export default (service: Service) => {

    service.before(['WRITE', 'DELETE'], '*', (request: Request) => {
        if (request.user.is('anonymous')) {
            return request.reject(401, 'Por favor, faça login.');
        }

        if (!request.user.is('admin')) {
            return request.reject(403, 'Não autorizada a escrita/deleção');
        }
    });

    service.after('READ', 'Customers', (customerslist: Customers, request) => {        
        (request as unknown as FullRequestParams<Customers>).results = customerController.afterRead(customerslist)
    });
    service.before('CREATE', 'SalesOrderHeaders', async (request: Request) => {
        const params = request.data;
        const items: SalesOrderItems = params.items;






        let totalAmount = 0;
        items.forEach(item => {
            totalAmount += (item.price as number) * (item.quantity as number)
        });
        if (totalAmount >= 30000) {
            totalAmount = totalAmount * 0.9;
        }
        request.data.totalAmount = totalAmount;

    });


    service.after('CREATE', 'SalesOrderHeaders', async (results: SalesOrderHeaders, request: Request) => {
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
            const headersAsString = JSON.stringify(header);
            const userAsString = JSON.stringify(request.user);
            const log = [{
                header_id: header.id,
                user: userAsString,
                orderData: headersAsString
            }]
        }
        await cds.create('sales.salesorderlogs').entries({});
    });
}

