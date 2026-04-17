export interface PlaceOrderRequest {
  cartId: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  orderId: number;
  status: string;
  createdAt: string;
  totalItems: number;
  totalAmount: number;
  items: OrderItem[];
}