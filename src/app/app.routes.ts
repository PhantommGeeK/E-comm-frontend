import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { OrdersComponent } from './components/orders/orders.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'add', component: AddProductComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'api/products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }
];
