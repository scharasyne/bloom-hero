export interface Product {
  id: string;
  product_name: string;
  product_image_url: string | null;
  product_images?: { image_url: string; display_order: number }[] | null;
  description: string | null;
  price: number;
}

export interface PopUpSchedule {
  id: string;
  location: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PopUpGalleryPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  location: string | null;
  event_name: string | null;
}

export interface Vendor {
  id: string;
  shop_name: string;
  business_type?: "registered" | "unregistered" | null;
  about?: string | null;
  location_text?: string | null;
  phone_number?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
}

export interface VendorReview {
  id: string;
  name: string;
  comment: string;
  rating: number;
  daysAgo: number;
}