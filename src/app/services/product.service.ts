import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api/products';
  private readonly fallbackImageUrl =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  searchProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?category=${encodeURIComponent(category)}`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  addProduct(product: Product, imageFile: File): Observable<Product> {
    const formData = new FormData();
    const productPayload = {
      name: product.name,
      brand: product.brand,
      price: product.price,
      category: product.category,
      available: product.available,
      quantity: product.quantity,
      description: product.description
    };

    formData.append(
      'p',
      new Blob([JSON.stringify(productPayload)], { type: 'application/json' })
    );
    formData.append('imageFile', imageFile);

    return this.http.post<Product>(this.apiUrl, formData);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  getProductImageUrl(product: Product): string {
    if (product.imageData && product.imageType) {
      return `data:${product.imageType};base64,${product.imageData}`;
    }

    return this.fallbackImageUrl;
  }
}
