import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { AddToCartRequest, Cart, UpdateCartItemRequest } from '../model/Cart';

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
    const storedCartId = this.getStoredCartId();
    const request: AddToCartRequest = {
      cartId: storedCartId ?? undefined,
      productId,
      quantity
    };

    return this.http.post<Cart>(`${this.apiUrl}/items`, request).pipe(
      tap((cart) => this.setCart(cart)),
      catchError((error) => {
        // Recover automatically when a previously stored cart no longer exists on the server.
        if (error?.status === 404 && storedCartId) {
          this.clearCart();

          const retryRequest: AddToCartRequest = { productId, quantity };
          return this.http.post<Cart>(`${this.apiUrl}/items`, retryRequest).pipe(
            tap((cart) => this.setCart(cart))
          );
        }

        return throwError(() => error);
      })
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

  updateItemQuantity(productId: number, quantity: number): Observable<Cart> {
    const cartId = this.getStoredCartId();
    if (!cartId) {
      throw new Error('Cart ID is not available');
    }

    const request: UpdateCartItemRequest = { quantity };
    return this.http.put<Cart>(`${this.apiUrl}/${cartId}/items/${productId}`, request).pipe(
      tap((cart) => this.setCart(cart))
    );
  }

  removeItem(productId: number): Observable<Cart> {
    const cartId = this.getStoredCartId();
    if (!cartId) {
      throw new Error('Cart ID is not available');
    }

    return this.http.delete<Cart>(`${this.apiUrl}/${cartId}/items/${productId}`).pipe(
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
