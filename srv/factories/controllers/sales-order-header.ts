import { SalesOrderHeaderControllerImpl } from "srv/controllers/sales-order-header/implementation";
import { salesOrderHeaderService } from "../services/sales-order-header";
import { SalesOrderHeaderController } from "srv/controllers/sales-order-header/protocols";


const makeSalesOrderHeaderController = (): SalesOrderHeaderController => {
    return new SalesOrderHeaderControllerImpl(salesOrderHeaderService);
}

export const salesOrderHeaderController = makeSalesOrderHeaderController();