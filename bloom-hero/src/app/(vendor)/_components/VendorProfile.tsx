import { redirect } from "next/navigation"

import ProductCardImageCarousel from "@/components/ProductCardImageCarousel"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import {
  VendorReviewsSection,
  type VendorOrderDetails,
  type VendorReviewCard,
} from "./VendorReviewsSection"
import { VendorProfileHeader } from "@/app/(vendor)/_components/VendorProfileHeader"
import { getVendorCommonProfileByOwner } from "@/lib/vendors/common/actions"

type vendorType = 'market' | 'pop-up';

type VendorProfileRow = {
  id: string
  shop_name: string
  vendor_type: string | null
}

type ProductRow = {
  id: string
  product_name: string
  product_image_url: string | null
  product_images?: { image_url: string; display_order: number }[] | null
  description: string | null
  price: number
}

type ReviewRow = {
  id: string
  customer_id: string
  rating: number
  comment: string | null
  review_date: string | null
  order_id: string | null
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function getShopInitial(shopName: string) {
  if(!shopName) return "?"
  const trimmed = shopName.trim()
  return trimmed.length > 0 ? trimmed[0].toUpperCase() : "?"
}

function normalizeVendorType(value: unknown): vendorType | null {
  if (value === "market") return "market"
  if (value === "pop-up" || value === "popup" || value === "pop_up") return "pop-up"
  return null
}

export default async function VendorProfilePage({ type }: { type: vendorType }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const commonProfile = await getVendorCommonProfileByOwner(type)
  if (!commonProfile) {
    redirect("/login")
  }

  let vendor: VendorProfileRow | null = {
    id: commonProfile.vendorId,
    shop_name: commonProfile.shopName,
    vendor_type: type,
  }
  let vendorError: Error | null = null

  {
    const primary = await supabase
      .from("vendors")
      .select("id, shop_name, vendor_type")
      .eq("owner_id", user.id)
      .maybeSingle()

    vendor = (primary.data as VendorProfileRow | null) ?? null
    vendorError = primary.error
  }

  if (vendorError) {
    throw new Error(vendorError.message)
  }

  if (!vendor) {
    const { data: application, error: applicationError } = await supabase
      .from("vendor_applications")
      .select("vendor_type")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (applicationError) {
      throw new Error(applicationError.message)
    }

    const applicationType = normalizeVendorType(application?.vendor_type)
    if (applicationType) {
      redirect(`/${applicationType}/profile`)
    }

    redirect("/customer/vendor-application")
  }

  const actualVendorType = normalizeVendorType(vendor.vendor_type)
  if (actualVendorType && actualVendorType !== type) {
    redirect(`/${actualVendorType}/profile`)
  }

  let productsData: ProductRow[] | null = null
  let productsError: Error | null = null

  {
    const { data, error } = await supabase
      .from("products")
      .select("id, product_name, product_image_url, description, price, product_images(image_url, display_order)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })

    productsData = data as ProductRow[] | null
    productsError = error
  }

  if (
    productsError &&
    /product_images|relationship|schema cache|does not exist/i.test(productsError.message)
  ) {
    const fallback = await supabase
      .from("products")
      .select("id, product_name, product_image_url, description, price")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })

    productsData = fallback.data as ProductRow[] | null
    productsError = fallback.error
  }

  if (productsError) {
    throw new Error(productsError.message)
  }

  const products: ProductRow[] = (productsData ?? []) as ProductRow[]
  const shopInitial = getShopInitial(vendor.shop_name)

  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, customer_id, rating, comment, review_date, order_id")
    .eq("vendor_id", vendor.id)
    .or("status.is.null,status.neq.rejected")
    .order("review_date", { ascending: false })
    .limit(3)

  if (reviewError) {
    throw new Error(reviewError.message)
  }

  const reviews = (reviewRows ?? []) as ReviewRow[]
  const reviewerIds = Array.from(new Set(reviews.map((review) => review.customer_id)))

  const { data: reviewerRows } = reviewerIds.length
    ? await supabase.from("users").select("id, name, email").in("id", reviewerIds)
    : { data: [] }

  const reviewerMap = new Map(
    (reviewerRows ?? []).map((row) => [row.id, row.name || row.email || "Customer"])
  )

  const reviewCards: VendorReviewCard[] = reviews.map((review) => ({
    id: review.id,
    customerName: reviewerMap.get(review.customer_id) ?? "Customer",
    rating: review.rating,
    comment: review.comment,
    reviewDate: review.review_date,
    orderId: review.order_id,
  }))

  const orderIds = Array.from(new Set(reviews.map((review) => review.order_id).filter(Boolean))) as string[]
  let orderDetailsById: Record<string, VendorOrderDetails> = {}

  if (orderIds.length > 0) {
    const { data: orderRows, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, status, order_date, total_amount, customer_id, order_items(quantity, subtotal, products(product_name, product_image_url))"
      )
      .in("id", orderIds)
      .eq("vendor_id", vendor.id)

    if (orderError) {
      throw new Error(orderError.message)
    }

    const orderList = orderRows ?? []
    const customerIds = Array.from(
      new Set(orderList.map((order: any) => order.customer_id).filter(Boolean))
    ) as string[]

    const { data: customerRows } = customerIds.length
      ? await supabase.from("users").select("id, name, email").in("id", customerIds)
      : { data: [] }

    const customerMap = new Map(
      (customerRows ?? []).map((row) => [row.id, row.name || row.email || "Customer"])
    )

    orderDetailsById = orderList.reduce((acc: Record<string, VendorOrderDetails>, order: any) => {
      const orderItems = Array.isArray(order.order_items) ? order.order_items : []
      const items = orderItems.map((item: any) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return {
          productName: product?.product_name ?? "Product",
          quantity: Number(item.quantity) || 0,
          subtotal: Number(item.subtotal) || 0,
          imageUrl: product?.product_image_url ?? null,
        }
      })

      acc[order.id] = {
        id: order.id,
        status: order.status ?? "unknown",
        orderDate: order.order_date ? new Date(order.order_date).toLocaleString() : "",
        totalAmount: Number(order.total_amount) || 0,
        customerName: order.customer_id ? customerMap.get(order.customer_id) ?? "Customer" : null,
        items,
      }

      return acc
    }, {})
  }

  return (
    // <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12">
    <main className = "flex">
      {/* <div className="lg:p-6">
        <VendorDashboardSidebarCard activeTab="profile" vendorType={type} />
      </div> */}

      {/* Content */}
      <section className="w-full px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        {/* Profile header card */}
        <div>
          <VendorProfileHeader
            profile={commonProfile}
            previewHref={`/vendors/${type}/${commonProfile.vendorId}`}
          />
          <div className="mt-6 border-t border-[#ece4dc] pt-3">
            <nav className="flex flex-wrap gap-4 text-sm text-[#8b847c]">
              <a
                href="#bouquets"
                className="border-b-2 border-[#2f5d3a] pb-1 font-medium text-[#2f5d3a]"
              >
                Bouquets
              </a>
              <a
                href="#reviews"
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#d2cbc3] hover:text-[#4a453f]"
              >
                Reviews
              </a>
              <a
                href="#about"
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#d2cbc3] hover:text-[#4a453f]"
              >
                About
              </a>
            </nav>
          </div>
        </div>

        {/* Bouquets */}
        <section id="bouquets" className="mt-10 scroll-mt-20">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#262321]">
                Bouquets
              </h2>
              <p className="mt-1 text-sm text-[#8d867d]">
                Ready-to-go arrangements you currently offer in your shop.
              </p>
            </div>
            {/* optional: Add bouquet CTA for vendor */}
            {/* <button className="hidden text-sm font-medium text-[#2f5d3a] hover:underline sm:inline-flex">
              + Add bouquet
            </button> */}
          </div>

          {products.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#d8d0c7] bg-[#fbf8f4] px-5 py-7 text-sm text-[#7a746e]">
              <p className="font-medium text-[#4a453f]">No bouquets published yet.</p>
              <p className="mt-1">
                Start by adding a product to showcase your signature arrangements here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-[#e8dfd5] sm:h-48">
                    {(() => {
                      const imageUrls = (product.product_images ?? [])
                        .slice()
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((img) => img.image_url)
                        .filter(
                          (url) => typeof url === "string" && url.trim().length > 0
                        )
                      const primaryImageUrl = imageUrls[0] ?? product.product_image_url

                      return primaryImageUrl ? (
                        <ProductCardImageCarousel
                          imageUrls={imageUrls.length > 0 ? imageUrls : [primaryImageUrl]}
                          productName={product.product_name}
                          imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#998f84]">
                          {shopInitial}
                        </div>
                      )
                    })()}

                    {/* Subtle price badge overlay */}
                    <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#2f5d3a] shadow-[0_6px_16px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                      {formatPeso(Number(product.price) || 0)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-[#2a2724]">
                      {product.product_name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-[#80786f]">
                      {product.description?.trim() ||
                        "Freshly arranged bouquet made with seasonal blooms."}
                    </p>

                    {/* Placeholder meta – can be wired later */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#9a9289]">
                      <span>Made to order</span>
                      <span>1–2 day lead time</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <VendorReviewsSection
          reviews={reviewCards}
          orderDetailsById={orderDetailsById}
        />

        {/* About */}
        <section id="about" className="mt-14 scroll-mt-20">
          <h2 className="text-lg font-semibold tracking-tight text-[#262321]">
            About this shop
          </h2>
          <div className="mt-4 rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] px-6 py-5">
            <p className="text-[15px] leading-7 text-[#4c4742]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et
              odio eros. Vivamus vitae elementum justo. Mauris volutpat suscipit
              ante, in hendrerit mauris tincidunt vitae. Pellentesque habitant morbi
              tristique senectus et netus et malesuada fames ac turpis egestas.
              Curabitur sit amet nisl nec nulla posuere egestas. Integer facilisis,
              ipsum non luctus gravida, nisi urna pretium metus, ac malesuada nibh
              nibh vitae augue.
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}

