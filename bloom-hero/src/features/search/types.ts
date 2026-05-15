export type ProductImageRow = {
  image_url: string;
  display_order: number;
};

export type SearchFlowerRow = {
  id: string;
  vendor_id: string;
  product_name: string;
  product_image_url: string | null;
  image_url?: string | null;
  price: number;
  description?: string | null;
  shop_name?: string | null;
  distance?: string | null;
  categories?: string[];
  rating?: number | null;
  sold_count?: number | null;
  average_rating?: number | null;
  product_images?: ProductImageRow[] | null;
};

export type SearchVendorRow = {
  id: string;
  shop_name: string | null;
  business_type: string | null;
  average_rating: number | null;
};

export type SearchPopUpRow = {
  id: string;
  vendor_id: string;
  shop_name: string;
  business_type: string | null;
  location: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  start_label: string;
  end_label: string;
  time_label: string | null;
  status: "upcoming" | "happening" | "past";
};

export type SearchResults = {
  flowers: SearchFlowerRow[];
  vendors: SearchVendorRow[];
  popups: SearchPopUpRow[];
};
