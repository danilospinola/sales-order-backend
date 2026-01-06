import cds, { Request, Service } from '@sap/cds';
import { Customers, SalesOrderItem, Product, Products, SalesOrderHeaders, SalesOrderItems } from '@cds-models/sales';

export default (service: Service) => {
service.before('*', (req: Request) => {
        console.log('====================================');
        console.log(`[DEBUG] Usuário ID: ${req.user.id}`);
        console.log(`[DEBUG] Tem role 'admin'? ${req.user.is('admin')}`);
        console.log(`[DEBUG] Roles totais:`, JSON.stringify(req.user.roles)); // ou req.user['roles'] dependendo da versão
        console.log('====================================');
    });

    service.before(['WRITE', 'DELETE'], '*', (request: Request) => {
        if (request.user.is('anonymous')) {
            return request.reject(401, 'Por favor, faça login.');
        }

        if (!request.user.is('admin')) {
            return request.reject(403, 'Não autorizada a escrita/deleção');
        }
    });

    service.after('READ', 'Customers', (results: Customers) => {
        results.forEach(customer => {
            if (customer.email?.includes('@')) {
                customer.email = `${customer.email}@gmail.com`;
            }
        })
    });
    service.before('CREATE', 'SalesOrderHeaders', async (request: Request) => {
        const params = request.data;
        const items: SalesOrderItems = params.items;

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
        const productsIds = params.items.map((item: SalesOrderItem) => item.product_id);
        const productQuery = SELECT.from('sales.Products').where({ id: productsIds });
        const products: Products = await cds.run(productQuery);
        for (const item of items) {
            const dbproduct = products.find(product => product.id === item.product_id);
            if (!dbproduct) {
                return request.reject(404, `Produto(s) ${item.product_id} Inválido(s)`);
            }
            if (dbproduct.stock === 0) {
                return request.reject(400, `Produto(s) ${dbproduct.name} Fora de Estoque`);
            }
        }

        let totalAmount = 0;
        items.forEach(item => {
            totalAmount += (item.price as number) * (item.quantity as number)
        });
        console.log(`Total Amount: ${totalAmount}`);

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

