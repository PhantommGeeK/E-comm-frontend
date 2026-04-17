import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart } from '../../model/Cart';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  placingOrder = false;
  orderSuccessMessage: string | null = null;
  error: string | null = null;
  actionError: string | null = null;
  processingProductId: number | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.loading = false;
    });

    if (!this.cartService.getCartSnapshot()) {
      this.loading = false;
    }
  }

  increaseQuantity(productId: number, currentQuantity: number): void {
    this.updateQuantity(productId, currentQuantity + 1);
  }

  decreaseQuantity(productId: number, currentQuantity: number): void {
    if (currentQuantity <= 1) {
      return;
    }

    this.updateQuantity(productId, currentQuantity - 1);
  }

  onQuantityInputChange(productId: number, value: string): void {
    const parsedQuantity = Number(value);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      this.actionError = 'Quantity must be a positive whole number.';
      return;
    }

    this.updateQuantity(productId, parsedQuantity);
  }

  removeItem(productId: number): void {
    this.processingProductId = productId;
    this.actionError = null;

    this.cartService.removeItem(productId).subscribe({
      next: () => {
        this.processingProductId = null;
      },
      error: () => {
        this.processingProductId = null;
        this.actionError = 'Unable to remove item from cart.';
      }
    });
  }

  isProcessing(productId: number): boolean {
    return this.processingProductId === productId;
  }

  private updateQuantity(productId: number, quantity: number): void {
    this.processingProductId = productId;
    this.actionError = null;

    this.cartService.updateItemQuantity(productId, quantity).subscribe({
      next: () => {
        this.processingProductId = null;
      },
      error: () => {
        this.processingProductId = null;
        this.actionError = 'Unable to update item quantity.';
      }
    });
  }

  placeOrder(): void {
    if (!this.cart || this.cart.items.length === 0) {
      this.error = 'Your cart is empty.';
      return;
    }

    const cartId = this.cart.cartId;
    this.placingOrder = true;
    this.error = null;
    this.orderSuccessMessage = null;

    this.orderService.placeOrder(cartId).subscribe({
      next: (order) => {
        this.orderSuccessMessage = `Order #${order.orderId} has been placed.`;
        this.cartService.loadCart(cartId).subscribe({
          complete: () => {
            this.placingOrder = false;
            this.router.navigate(['/orders'], { queryParams: { placed: order.orderId } });
          }
        });
      },
      error: () => {
        this.error = 'Could not place order right now.';
        this.placingOrder = false;
      }
    });
  }
}
