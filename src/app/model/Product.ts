export interface Product {
  id?: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  available: boolean;
  quantity: number;
  description: string;
  imageName?: string;
  imageType?: string;
  imageData?: string;
}
