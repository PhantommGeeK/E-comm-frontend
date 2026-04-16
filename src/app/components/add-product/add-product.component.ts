import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../model/Product';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnDestroy {
  private readonly maxUploadSizeBytes = 950 * 1024;

  product: Product = {
    name: '',
    brand: '',
    price: 0,
    category: '',
    available: true,
    quantity: 0,
    description: ''
  };
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  imageStatusMessage = '';
  processingImage = false;

  constructor(private service: ProductService, private router: Router) {}

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }

    this.imageStatusMessage = '';
    this.selectedImageFile = null;

    if (file) {
      this.processingImage = true;

      try {
        const preparedImage = await this.prepareImageForUpload(file);
        this.selectedImageFile = preparedImage;
        this.imagePreviewUrl = URL.createObjectURL(preparedImage);

        if (preparedImage.size !== file.size) {
          this.imageStatusMessage = 'Large image optimized automatically for upload.';
        }
      } catch (error) {
        input.value = '';
        console.error('Image preparation failed:', error);
        alert('Please choose an image smaller than 1 MB.');
      } finally {
        this.processingImage = false;
      }
    }
  }

  addProduct(): void {
    if (this.processingImage) {
      alert('Image is still being prepared. Please wait a moment and try again.');
      return;
    }

    if (!this.selectedImageFile) {
      alert('Please select a product image before saving.');
      return;
    }

    this.service.addProduct(this.product, this.selectedImageFile).subscribe({
      next: (res) => {
        alert('Product Added Successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error("ERROR:", err);
        if (err.status === 413) {
          alert('Image is too large. Please use an image smaller than 1 MB.');
          return;
        }

        const errorMessage =
          typeof err.error === 'string' && err.error.trim().length > 0
            ? err.error
            : 'Failed to add product. Please try again.';

        alert(errorMessage);
      }
    });
  }

  private async prepareImageForUpload(file: File): Promise<File> {
    if (file.size <= this.maxUploadSizeBytes) {
      return file;
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Unsupported file type.');
    }

    return this.compressImage(file);
  }

  private async compressImage(file: File): Promise<File> {
    const dataUrl = await this.readFileAsDataUrl(file);
    const image = await this.loadImage(dataUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas not supported.');
    }

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));

    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45]) {
      const blob = await this.canvasToBlob(canvas, 'image/jpeg', quality);

      if (blob.size <= this.maxUploadSizeBytes) {
        return new File([blob], this.renameFile(file.name), { type: 'image/jpeg' });
      }
    }

    throw new Error('Unable to compress image under the upload limit.');
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Unable to load selected image.'));
      image.src = src;
    });
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Unable to process image.'));
      }, type, quality);
    });
  }

  private renameFile(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
    return `${baseName}-optimized.jpg`;
  }

  ngOnDestroy(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
  }
}
