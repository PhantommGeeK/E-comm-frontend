import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../model/Product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  loading = true;
  error: string | null = null;
  cartMessage: string | null = null;
  cartError: string | null = null;
  addingToCart = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Product not found or an error occurred.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.error = 'No product ID provided.';
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getProductImage(): string {
    return this.product ? this.productService.getProductImageUrl(this.product) : '';
  }

  addToCart(): void {
    if (!this.product?.id || !this.product.available) {
      return;
    }

    this.addingToCart = true;
    this.cartMessage = null;
    this.cartError = null;

    this.cartService.addItem(this.product.id).subscribe({
      next: (cart) => {
        this.cartMessage = `${this.product?.name} added to cart. ${cart.totalItems} item(s) in cart.`;
        this.addingToCart = false;
      },
      error: () => {
        this.cartError = 'Unable to add this product to the cart right now.';
        this.addingToCart = false;
      }
    });
  }
}
