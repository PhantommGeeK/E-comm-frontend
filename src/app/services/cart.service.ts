import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AddToCartRequest, Cart } from '../model/Cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = 'http://localhost:8080/api/cart';
  private readonly cartStorageKey = 'ecom-cart-id';
  private readonly cartSubject = new BehaviorSubject<Cart | null>(null);

  readonly cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    const cartId = this.getStoredCartId();
    if (cartId) {
      this.loadCart(cartId).subscribe({
        error: () => this.clearCart()
      });
    }
  }

  getCartSnapshot(): Cart | null {
    return this.cartSubject.value;
  }

  addItem(productId: number, quantity: number = 1): Observable<Cart> {
    const request: AddToCartRequest = {
      cartId: this.getStoredCartId() ?? undefined,
      productId,
      quantity
    };

    return this.http.post<Cart>(`${this.apiUrl}/items`, request).pipe(
      tap((cart) => this.setCart(cart))
    );
  }

  loadCart(cartId?: number): Observable<Cart> {
    const resolvedCartId = cartId ?? this.getStoredCartId();
    if (!resolvedCartId) {
      throw new Error('Cart ID is not available');
    }

    return this.http.get<Cart>(`${this.apiUrl}/${resolvedCartId}`).pipe(
      tap((cart) => this.setCart(cart))
    );
  }

  private setCart(cart: Cart): void {
    this.cartSubject.next(cart);
    this.storeCartId(cart.cartId);
  }

  private clearCart(): void {
    this.cartSubject.next(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.cartStorageKey);
    }
  }

  private getStoredCartId(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const value = window.localStorage.getItem(this.cartStorageKey);
    if (!value) {
      return null;
    }

    const cartId = Number(value);
    return Number.isNaN(cartId) ? null : cartId;
  }

  private storeCartId(cartId: number): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.cartStorageKey, String(cartId));
    }
  }
}
