import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order, OrderItem } from '../../model/Order';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  selectedOrderItems: OrderItem[] = [];
  selectedOrderId: number | null = null;

  loading = true;
  loadingItems = false;

  orderIdSearch = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const placedOrderId = params.get('placed');
      if (placedOrderId) {
        this.successMessage = `Order #${placedOrderId} placed successfully.`;
      }
    });

    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = null;

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not fetch orders at the moment.';
        this.loading = false;
      }
    });
  }

  viewItems(orderId: number): void {
    this.selectedOrderId = orderId;
    this.loadingItems = true;
    this.errorMessage = null;

    this.orderService.getOrderItemsByOrderId(orderId).subscribe({
      next: (items) => {
        this.selectedOrderItems = items;
        this.loadingItems = false;
      },
      error: () => {
        this.errorMessage = `Could not fetch items for order #${orderId}.`;
        this.selectedOrderItems = [];
        this.loadingItems = false;
      }
    });
  }

  searchItemsByOrderId(): void {
    const parsedOrderId = Number(this.orderIdSearch);
    if (!this.orderIdSearch || Number.isNaN(parsedOrderId) || parsedOrderId <= 0) {
      this.errorMessage = 'Please enter a valid order ID.';
      return;
    }

    this.viewItems(parsedOrderId);
  }
}