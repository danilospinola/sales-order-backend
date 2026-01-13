import cds, { Request, Service } from '@sap/cds';
import { Customers, Product, Products, SalesOrderHeaders, SalesOrderItems } from '@cds-models/sales';
import { customerController } from './factories/controllers/customer';
import { FullRequestParams } from './protocols';
import { salesOrderHeaderController } from './factories/controllers/sales-order-header';



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
        const result = await salesOrderHeaderController.beforeCreate(request.data);
        if (result.hasErrors) {
            return request.reject(400, result.error?.message || 'Erro na validação do pedido de venda.');
        }
        console.log('Total Amount Calculated:', result.totalAmount);
        request.data.totalAmount = result.totalAmount;
    });


    service.after('CREATE', 'SalesOrderHeaders', async (salesOrderHeaders: SalesOrderHeaders, request: Request) => {
       await salesOrderHeaderController.afterCreate(salesOrderHeaders, request.user);
    });
}

