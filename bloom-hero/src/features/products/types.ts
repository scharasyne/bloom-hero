// Origin: src/lib/products.ts
// Origin: src/lib/product-images.ts

export type ProductImageRow = {
  image_url: string;
  display_order: number;
};

export type Product = {
  id: string;
  product_name: string;
  product_image_url: string | null;
  description: string | null;
  price: number;
  product_images?: ProductImageRow[] | null;
};

export type ProductDetailRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  description?: string | null;
  created_at?: string;
  stocks?: number | null;
  product_images?: ProductImageRow[] | null;
  categories?: string[];
  shop_name?: string | null;
  business_type?: string | null;
  average_rating?: number | null;
  sold_count?: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
};

export type BestSellerFlowerRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  description: string | null;
  created_at?: string;
  product_images?: ProductImageRow[] | null;
  categories?: string[];
  shop_name?: string | null;
  business_type?: string | null;
  average_rating?: number | null;
  sold_count: number;
};

export type BestSellerVendorRow = {
  id: string;
  shop_name: string | null;
  business_type: string | null;
  average_rating: number | null;
  sold_count: number;
};