# Features Inventory

This file lists the feature folders and the existing query/action files that can be reused instead of creating duplicates while moving query/data-access code out of `src/app`.

## Feature folders
- `src/features/auth`
- `src/features/categories`
- `src/features/customers`
- `src/features/pop-up`
- `src/features/products`
- `src/features/reviews`
- `src/features/users`
- `src/features/vendors`

## Existing query files

### Auth
- `src/features/auth/queries/getSession.ts`

### Categories
- `src/features/categories/queries/fetch-categories.ts`

### Customers
- `src/features/customers/queries/getCustomerSetting.ts`

### Pop-up
- `src/features/pop-up/queries/getPopupGalleryPhotos.ts`
- `src/features/pop-up/queries/getPopupGalleryPhotosByVendor.ts`
- `src/features/pop-up/queries/getPopUpVendorProfileData.ts`
- `src/features/pop-up/queries/getPopupLocation.ts`
- `src/features/pop-up/queries/getPopupSchedule.ts`
- `src/features/pop-up/queries/getRecentPopupLocationRequests.ts`
- `src/features/pop-up/queries/getTopRequestedLocation.ts`

### Products
- `src/features/products/queries/getProductById.ts`
- `src/features/products/queries/getProductImages.ts`
- `src/features/products/queries/getProductImagesClient.ts`
- `src/features/products/queries/getVendorProducts.ts`

### Reviews
- `src/features/reviews/queries/getExistingReview.ts`
- `src/features/reviews/queries/getOrderReviewByCustomer.ts`
- `src/features/reviews/queries/getOrderReviewEligibility.ts`
- `src/features/reviews/queries/getProductReviewsByProductId.ts`
- `src/features/reviews/queries/getVendorReviews.ts`

### Users
- `src/features/users/queries/getUserBasicProfile.ts`
- `src/features/users/queries/getUserName.ts`
- `src/features/users/queries/getUserRole.ts`

### Vendors
- `src/features/vendors/queries/getVendorApplicationDraft.ts`
- `src/features/vendors/queries/getVendorCommonProfile.ts`
- `src/features/vendors/queries/getVendorDashboardData.ts`
- `src/features/vendors/queries/getVendorProfile.ts`
- `src/features/vendors/queries/getVendorProfileByOwnerId.ts`
- `src/features/vendors/queries/getVendorStatus.ts`
- `src/features/vendors/queries/getVendorType.ts`
- `src/features/vendors/queries/listSubmittedVendorApplications.ts`

## Existing action files

### Auth
- `src/features/auth/actions/actions.ts`

### Customers
- `src/features/customers/actions/ensureCustomer.ts`
- `src/features/customers/actions/uploadCustomerProfile.ts`
- `src/features/customers/actions/upsertCustomerSettings.ts`

### Pop-up
- `src/features/pop-up/actions/addPopupGalleryPhoto.ts`
- `src/features/pop-up/actions/createPopupSchedule.ts`
- `src/features/pop-up/actions/deletePopupGalleryPhoto.ts`
- `src/features/pop-up/actions/submitPopupLocationRequest.ts`
- `src/features/pop-up/actions/updatePopupGalleryPhoto.ts`
- `src/features/pop-up/actions/uploadGalleryImage.ts`

### Products
- `src/features/products/actions/addProductImage.ts`
- `src/features/products/actions/deleteProductImage.ts`
- `src/features/products/actions/updateProductImageOrder.ts`

### Reviews
- `src/features/reviews/actions/saveReviewByCustomer.ts`
- `src/features/reviews/actions/update-vendor-review.ts`

### Users
- `src/features/users/actions/updateUserProfile.ts`
- `src/features/users/actions/updateUserRoleAndContact.ts`
- `src/features/users/actions/upsertUserAsCustomer.ts`

### Vendors
- `src/features/vendors/actions/actions.ts`
- `src/features/vendors/actions/updateVendorCommonProfile.ts`
- `src/features/vendors/actions/uploadVendorDocument.ts`
- `src/features/vendors/actions/upsertVendorApplication.ts`
- `src/features/vendors/actions/upsertVendorOwnerById.ts`

## Reusable feature components
- `src/features/products/components/ListProduct.tsx`
- `src/features/vendors/components/VendorProfile.tsx`
- `src/features/vendors/components/VendorProfileHeader.tsx`
- `src/features/vendors/components/VendorReviewsSection.tsx`

## Already reused from `src/app`

These feature files already line up with existing `src/app` call sites, so they should be reused before creating anything new.

- `src/app/layout.tsx` -> `src/features/auth/queries/getSession.ts`
- `src/app/(customer)/layout.tsx` -> `src/features/auth/queries/getSession.ts`
- `src/app/auth/callback/route.ts` -> `src/features/auth/queries/getSession.ts`
- `src/app/(customer)/dashboard/page.tsx` -> `src/features/users/queries/getUserName.ts`
- `src/app/(customer)/settings/page.tsx` -> `src/features/users/queries/getUserBasicProfile.ts` and `src/features/customers/queries/getCustomerSetting.ts`
- `src/app/(customer)/products/[id]/page.tsx` -> `src/features/reviews/queries/getProductReviewsByProductId.ts`
- `src/app/(vendor)/market/[vendorId]/page.tsx` -> `src/features/vendors/queries/getVendorProfile.ts` and `src/features/products/queries/getVendorProducts.ts`
- `src/app/(vendor)/pop-up/[vendorId]/page.tsx` -> `src/features/vendors/queries/getVendorProfile.ts`, `src/features/products/queries/getVendorProducts.ts`, `src/features/reviews/queries/getVendorReviews.ts`, `src/features/pop-up/queries/getPopupSchedule.ts`, and `src/features/pop-up/queries/getPopupGalleryPhotosByVendor.ts`
- `src/app/(vendor)/pop-up/profile/page.tsx` -> `src/features/pop-up/queries/getPopupGalleryPhotos.ts` and `src/features/pop-up/queries/getRecentPopUpLocationRequests.ts`
- `src/app/(vendor)/pop-up/schedule/page.tsx` -> `src/features/pop-up/queries/getPopupSchedule.ts` and `src/features/pop-up/queries/getRecentPopUpLocationRequests.ts`

## Notes
- If a query or action already exists in `src/features`, reuse it instead of creating a second copy in `src/app`.
- If a matching feature file does not exist yet, create it in the owning feature folder and keep the implementation unchanged.
- If you find duplicates during the transfer, record the source file for each one so the overlap is clear.
