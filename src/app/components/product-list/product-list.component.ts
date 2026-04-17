import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../model/Product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categorySearch = '';
  searchingCategory = false;
  addingProductId: number | null = null;
  feedbackMessage: string | null = null;
  feedbackError: string | null = null;

  constructor(
    private service: ProductService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.service.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  searchByCategory(): void {
    this.feedbackError = null;
    const searchTerm = this.categorySearch.trim();

    if (!searchTerm) {
      this.searchingCategory = false;
      this.loadProducts();
      return;
    }

    this.searchingCategory = true;
    this.service.searchProductsByCategory(searchTerm).subscribe({
      next: (data) => {
        this.products = data;
        this.feedbackError = null;
      },
      error: (err) => {
        const status = err?.status;
        this.feedbackError = status ? `Search failed (HTTP ${status}).` : 'Could not search products right now.';
        this.searchingCategory = false;
        this.loadProducts();
      }
    });
  }

  clearCategorySearch(): void {
    this.categorySearch = '';
    this.searchingCategory = false;
    this.feedbackError = null;
    this.loadProducts();
  }

  getProductImage(product: Product): string {
    return this.service.getProductImageUrl(product);
  }

  viewProduct(id?: number): void {
    if (id) {
      this.router.navigate(['/api/products', id]);
    }
  }

  addToCart(product: Product): void {
    if (!product.id || !product.available) {
      return;
    }

    this.addingProductId = product.id;
    this.feedbackMessage = null;
    this.feedbackError = null;

    this.cartService.addItem(product.id).subscribe({
      next: (cart) => {
        this.feedbackMessage = `${product.name} added to cart. ${cart.totalItems} item(s) in cart.`;
        this.addingProductId = null;
      },
      error: () => {
        this.feedbackError = `Could not add ${product.name} to the cart.`;
        this.addingProductId = null;
      }
    });
  }
}
