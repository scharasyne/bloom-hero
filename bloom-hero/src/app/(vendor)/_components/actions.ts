"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type VendorType = "market" | "pop-up";

type ActionResult = {
  ok: boolean;
  message?: string;
  redirectTo?: string;
};

export async function getVendorApplicationStatusAction(type: VendorType) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: null, message: "You need to log in first." };
  }

  const { data, error } = await supabase
    .from("vendors")
    .select("status")
    .eq("owner_id", user.id)
    .eq("vendor_type", type)
    .maybeSingle();

  if (error) {
    return { status: null, message: error.message };
  }

  return { status: (data as { status?: string | null } | null)?.status ?? null };
}

export async function addVendorProductAction(type: VendorType, formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();

  try {
    const productName = String(formData.get("productName") ?? "").trim();
    const categoryIds = Array.from(
      new Set(
        formData
          .getAll("categoryIds")
          .map((value) => String(value).trim())
          .filter(Boolean)
      )
    );
    const description = String(formData.get("description") ?? "").trim();
    const rawPrice = Number(formData.get("price") ?? "0");
    const rawStock = Number(formData.get("stock") ?? "0");
    const productImages = formData.getAll("productImages") as File[];
    let insertedProductId: string | null = null;

    if (!productName) {
      return { ok: false, message: "Product name is required." };
    }

    if (categoryIds.length < 1 || categoryIds.length > 3) {
      return { ok: false, message: "Select between 1 and 3 categories." };
    }

    if (!Number.isFinite(rawPrice) || rawPrice < 0) {
      return { ok: false, message: "Price must be 0 or higher." };
    }

    if (!Number.isFinite(rawStock) || rawStock < 0) {
      return { ok: false, message: "Stock must be 0 or higher." };
    }

    if (!productImages || productImages.length === 0 || (productImages.length === 1 && productImages[0].size === 0)) {
      return { ok: false, message: "Please upload at least one product image." };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "You need to log in first." };
    }

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id, status")
      .eq("owner_id", user.id)
      .eq("vendor_type", type)
      .maybeSingle();

    if (vendorError || !vendor) {
      return { ok: false, message: "Vendor profile not found for this account." };
    }

    if ((vendor as { status?: string | null }).status === "pending") {
      return {
        ok: false,
        message: "Your vendor application is still pending. You cannot add products yet.",
      };
    }

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id")
      .in("id", categoryIds);

    if (categoriesError) {
      return { ok: false, message: categoriesError.message };
    }

    if (!categories || categories.length !== categoryIds.length) {
      return { ok: false, message: "One or more selected categories are invalid." };
    }

    const validImages = productImages.filter((img) => img instanceof File && img.size > 0);
    if (validImages.length === 0) {
      return { ok: false, message: "Please upload at least one valid product image." };
    }

    const uploadedImageUrls: string[] = [];

    for (let i = 0; i < validImages.length; i++) {
      const productImage = validImages[i];
      const imageExtension = productImage.name.split(".").pop() || "jpg";
      const imagePath = `${vendor.id}/${crypto.randomUUID()}.${imageExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(imagePath, productImage, {
          cacheControl: "3600",
          upsert: false,
          contentType: productImage.type,
        });

      if (uploadError) {
        return {
          ok: false,
          message: `Image upload failed for image ${i + 1}. ${uploadError.message}`,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(imagePath);

      uploadedImageUrls.push(publicUrl);
    }

    const baseInsertPayload = {
      vendor_id: vendor.id,
      category_id: categoryIds[0],
      product_name: productName,
      description: description || null,
      price: rawPrice,
      stocks: Math.floor(rawStock),
      product_image_url: uploadedImageUrls[0],
    };

    const { data: product, error: insertWithImageError } = await supabase
      .from("products")
      .insert(baseInsertPayload)
      .select("id")
      .single();

    if (insertWithImageError) {
      const missingImageColumn = /product_image_url|schema cache|column/i.test(insertWithImageError.message);

      if (!missingImageColumn) {
        return { ok: false, message: insertWithImageError.message };
      }

      const { data: fallbackProduct, error: fallbackInsertError } = await supabase
        .from("products")
        .insert(baseInsertPayload)
        .select("id")
        .single();

      if (fallbackInsertError) {
        return { ok: false, message: fallbackInsertError.message };
      }

      insertedProductId = fallbackProduct?.id ?? null;
    } else {
      insertedProductId = product?.id ?? null;
    }

    if (!insertedProductId) {
      return { ok: false, message: "Failed to create product." };
    }

    const { error: categoryLinksError } = await supabase.from("product_categories").insert(
      categoryIds.map((categoryId) => ({
        product_id: insertedProductId,
        category_id: categoryId,
      }))
    );

    if (categoryLinksError) {
      return { ok: false, message: categoryLinksError.message };
    }

    const imagesToInsert = uploadedImageUrls.map((url, index) => ({
      product_id: insertedProductId,
      image_url: url,
      display_order: index,
    }));

    const { error: imagesInsertError } = await supabase.from("product_images").insert(imagesToInsert);

    if (imagesInsertError) {
      console.warn("Warning: Some product images could not be saved to database:", imagesInsertError.message);
    }

    return { ok: true, redirectTo: `/${type}/products` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add product right now.";
    return { ok: false, message };
  }
}