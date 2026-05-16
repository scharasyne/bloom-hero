// Source: `src/app/(customer)/profile/page.tsx`

export type LinkedVendorCredentials = {
  vendor_user_id: string;
  email: string;
  password: string;
  issued_at: string;
};

export type CustomerProfilePageResult =
  | { authenticated: false }
  | {
      authenticated: true;
      displayName: string;
      phone: string;
      email: string;
      memberSince: string;
      totalStems: number;
      totalSpent: number;
      orderCount: number;
      uniqueVendorsCount: number;
      reviewCount: number;
      topVendorName: string;
      linkedVendorCredentials: LinkedVendorCredentials | null;
      shouldShowLinkedVendorCredentials: boolean;
    };

// Source: `src/app/(customer)/dashboard/page.tsx`

export type CustomerDashboardPageData = {
  welcomeName: string;
};

// Source: `src/app/(customer)/settings/page.tsx`

export type CustomerSettingsPageData = {
  initialName: string;
  initialEmail: string;
  initialContactNumber: string;
  initialShippingAddress: string;
  initialProfilePhotoUrl: string;
  initialNotificationPreferences: {
    order_updates: boolean;
    promotions: boolean;
  };
};
