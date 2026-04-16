export interface AddToCartRequest {
  cartId?: number;
  productId: number;
  quantity: number;
}

export interface CartItem {
  productId: number;
  productName: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  cartId: number;
  totalItems: number;
  totalAmount: number;
  items: CartItem[];
}
