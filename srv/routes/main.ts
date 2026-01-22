import '../configs/module-alias';

import { Customers, SalesOrderHeaders } from '@cds-models/sales';
import { Request, Service } from '@sap/cds';
import { customerController } from '@/factories/controllers/customer';
import { FullRequestParams } from '@/routes/protocols';
import { salesOrderHeaderController } from '@/factories/controllers/sales-order-header';
import { salesReportService } from '@/factories/services/sales-reports'
import { salesReportController } from '@/factories/controllers/sales-report';


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
        const result = customerController.afterRead(customerslist);
        if (result.status >= 400) {
            return request.error(result.status, result.data as string);
        }
        (request as unknown as FullRequestParams<Customers>).results = result.data as Customers;
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

    service.on('getSalesReportByDays', async (request: Request) => {
        const days = request.data?.days || 7;
        const result = await salesReportController.findByDays(days);
        if (result.status >= 400) {
            return request.error(result.status, result.data as string);
        }
        return result.data;
    })
    service.on('getSalesReportByCustomerId', async (request: Request) => {
        const [{id: customerId}] = request.params as unknown as { id: string}[];
        return salesReportController.findByCustomerId(customerId);
    })
    service.on('bulkCreateSalesOrder', async (request: Request) => {
        const {user, data} = request
        return salesOrderHeaderController.bulkCreate(data.Payload, user);
    });
    service.on('cloneSalesOrder', async (request: Request) => {
        const [{id}] = request.params as unknown as { id: string}[];
        const {user} = request
        return salesOrderHeaderController.cloneSalesOrder(id, user);
    });
};

