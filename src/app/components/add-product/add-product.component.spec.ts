import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { AddProductComponent } from './add-product.component';
import { ProductService } from '../../services/product.service';

describe('AddProductComponent validation', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertSpy: jasmine.Spy;

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj<ProductService>('ProductService', ['addProduct']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    productServiceSpy.addProduct.and.returnValue(of({
      id: 1,
      name: 'Demo Product',
      brand: 'Demo Brand',
      price: 100,
      category: 'Demo Category',
      available: true,
      quantity: 5,
      description: 'A valid test description.'
    }));

    await TestBed.configureTestingModule({
      imports: [AddProductComponent],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .overrideComponent(AddProductComponent, {
      set: { template: '' }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    alertSpy = spyOn(window, 'alert');
  });

  it('should block submit when price is invalid', () => {
    component.product = {
      name: 'Phone',
      brand: 'BrandX',
      price: 0,
      category: 'Electronics',
      available: true,
      quantity: 5,
      description: 'A valid test description.'
    };

    component.addProduct();

    expect(component.validationMessage).toBe('Price must be greater than 0.');
    expect(productServiceSpy.addProduct).not.toHaveBeenCalled();
  });

  it('should block submit when description is too short', () => {
    component.product = {
      name: 'Phone',
      brand: 'BrandX',
      price: 100,
      category: 'Electronics',
      available: true,
      quantity: 5,
      description: 'short'
    };

    component.addProduct();

    expect(component.validationMessage).toBe('Description must be at least 10 characters.');
    expect(productServiceSpy.addProduct).not.toHaveBeenCalled();
  });

  it('should block submit when image is not selected', () => {
    component.product = {
      name: 'Phone',
      brand: 'BrandX',
      price: 100,
      category: 'Electronics',
      available: true,
      quantity: 5,
      description: 'A valid test description.'
    };
    component.selectedImageFile = null;

    component.addProduct();

    expect(alertSpy).toHaveBeenCalledWith('Please select a product image before saving.');
    expect(productServiceSpy.addProduct).not.toHaveBeenCalled();
  });

  it('should call addProduct and navigate when all input is valid', () => {
    component.product = {
      name: 'Phone',
      brand: 'BrandX',
      price: 100,
      category: 'Electronics',
      available: true,
      quantity: 5,
      description: 'A valid test description.'
    };
    component.selectedImageFile = new File(['img'], 'product.png', { type: 'image/png' });

    component.addProduct();

    expect(productServiceSpy.addProduct).toHaveBeenCalledWith(component.product, component.selectedImageFile);
    expect(alertSpy).toHaveBeenCalledWith('Product Added Successfully!');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
