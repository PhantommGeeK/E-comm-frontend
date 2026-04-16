import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'add', component: AddProductComponent },
  { path: 'api/products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent }
];
