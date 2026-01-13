import cds from '@sap/cds';

import { ProductModel, ProductProps } from 'srv/models/product';
import { ProductRepository } from '../product/protocols';
import { Products } from '@cds-models/sales';

export class ProductRepositoryImpl implements ProductRepository {

    public async findByIds(ids: ProductProps["id"][]): Promise<ProductModel[] | null> {
        const productQuery = SELECT.from('sales.Products').where({ id: ids });
        const products: Products = await cds.run(productQuery);
        if (products.length === 0) {
            return null;
        }
        return products.map(product => ProductModel.with({
            id: product.id as string,
            name: product.name as string,
            stock: product.stock as number,
            price: product.price as number
        }));
    }

    public async updateStock(product: ProductModel): Promise<void> {
                     await cds.update('sales.Products')
                    .where({ id: product.id })
                    .with({ stock: product.stock });
    }
}