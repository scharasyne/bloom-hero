import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client"

export type PopupGalleryPhotoRow = {
  id: string
  vendor_id: string
  image_url: string
  caption: string
  location: string | null
  event_name: string | null
  display_order: number
  created_at: string
  updated_at: string | null
}

export type PopupGalleryPhoto = {
  id: string
  vendorId: string
  imageUrl: string
  caption: string
  location: string
  eventName: string
  displayOrder: number
  createdAt: string
  updatedAt: string | null
}

export type PopupGalleryPhotoInput = {
  vendorId: string
  imageUrl: string
  caption: string
  location?: string
  eventName?: string
  displayOrder?: number
}

export type PopupGalleryPhotoUpdate = {
  caption?: string
  location?: string
  eventName?: string
  imageUrl?: string
  displayOrder?: number
}

export type PopupGalleryClient = ReturnType<typeof createSupabaseBrowserClient>

/*
 ——————————————————————————— LOCATION ———————————————————————————
*/

export type PopUpLocationRow = {
  id: string;
  location: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  vendors: {
    shop_name: string | null;
  } | null;
};

export type RequestedLocationRank = {
  location: string;
  count: number;
};

export type RecentPopUpLocationRequest = {
  id: string;
  location: string;
  createdAt: string | null;
  requestedDate: string | null;
  requestedStartTime: string | null;
  requestedEndTime: string | null;
};

export type CreatePopUpScheduleInput = {
  vendorId: string;
  location: string;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landmark?: string | null;
};

export type PopUpProfileSchedule = {
  id: string;
  location: string;
  scheduledDate: string;
  startTime: string | null;
  endTime: string | null;
};

export type PopUpProfileReview = {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string | null;
};

export type PopUpVendorProfileData = {
  vendorId: string;
  schedules: PopUpProfileSchedule[];
  reviews: PopUpProfileReview[];
  aboutText: string;
};

/*
  ——————————————————————————— SUPABASE ? ———————————————————————————
*/

type SupabaseLikeError = {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
};