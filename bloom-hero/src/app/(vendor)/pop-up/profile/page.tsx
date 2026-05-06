import { Icon } from "@iconify/react/dist/iconify.js"
import { redirect } from "next/navigation"

import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card"
import { PopUpGalleryManager } from "@/app/(vendor)/_components/PopUpGalleryManager"
import { mockUpcomingEvents } from "@/lib/mockData"
import { getPopupGalleryPhotos } from "@/lib/services/popup-gallery"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"

const mockTags = ["Pop-up", "Romantic", "Budget-friendly"]

const mockReviews = [
  { id: "1", name: "Sara Duterte", comment: "Absolutely gorgeous arrangements! My go-to florist for any occasion.", rating: 5, daysAgo: 3 },
  { id: "2", name: "Bongbong Marcos", comment: "Fresh blooms and very thoughtful wrapping. Will definitely order again.", rating: 5, daysAgo: 3 },
  { id: "3", name: "Leni Robredo", comment: "Beautiful bouquet quality and fast turnaround. Highly recommended shop.", rating: 5, daysAgo: 5 },
]

function getShopInitial(shopName: string) {
  const trimmed = shopName?.trim()
  return trimmed?.length > 0 ? trimmed[0].toUpperCase() : "?"
}

export default async function Page() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, shop_name")
    .eq("owner_id", user.id)
    .eq("vendor_type", "pop-up")
    .maybeSingle()

  if (vendorError || !vendor) throw new Error(vendorError?.message || "Pop-up vendor profile not found.")

  const galleryPhotos = await getPopupGalleryPhotos(vendor.id)
  const shopInitial = getShopInitial(vendor.shop_name)

  return (
    <main className="flex min-h-screen bg-[#fbf7f4]">
      <div className="p-4 sm:p-6 lg:p-8">
        <VendorDashboardSidebarCard activeTab="profile" vendorType="pop-up" />
      </div>

      <section className="w-full px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-[40px] font-bold tracking-tight text-[#1f1f1f] leading-tight">
              {vendor.shop_name}
            </h1>
            <div className="mt-2 flex items-center gap-1.5 text-[14px] font-medium text-[#6f6a65]">
              <Icon icon="mdi:map-marker-outline" width={16} height={16} />
              <span>Cebu City</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {mockTags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#d6d0c8] bg-white px-3 py-1 text-[13px] font-medium text-[#3a3633]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[14px] text-[#4c4742]">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:phone-outline" width={16} height={16} color="#7a7a7a" />
                <span>0998 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:clock-outline" width={16} height={16} color="#7a7a7a" />
                <span>Schedule Varies</span>
              </div>
            </div>
          </div>

          <div className="md:w-75 lg:w-85 shrink-0">
            <div className="flex h-50 w-full items-center justify-center rounded-2xl bg-[#e8dfd5] text-5xl font-bold text-[#998f84]">
              {shopInitial}
            </div>
          </div>
        </div>

        <div className="border-b border-[#ddd8d0] pb-1.5">
          <nav className="flex gap-6 text-[14px] font-medium text-[#8b847c]">
            {["Schedule", "Gallery", "Reviews", "About"].map((tab) => (
              <a
                key={tab}
                href={`#${tab.toLowerCase()}`}
                className={`pb-2.5 transition-colors hover:text-[#1f1f1f] ${
                  tab === "Schedule"
                    ? "border-b-2 border-[#1f1f1f] text-[#1f1f1f] font-semibold"
                    : ""
                }`}
              >
                {tab}
              </a>
            ))}
          </nav>
        </div>

        <div className="space-y-14 pt-8">
          <section id="schedule" className="scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">Schedule</h2>
            <p className="mb-6 mt-1 text-[14px] text-[#8b847c]">Where and when these blooms appear</p>

            <div className="flex flex-col gap-3">
              {mockUpcomingEvents.map((event, idx) => (
                <div key={idx} className="group flex gap-4 items-stretch">
                  <div className="flex min-w-15 flex-col items-center justify-center rounded-2xl border border-[#e8e3dc] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 group-hover:border-[#d24b46] group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#d24b46]">{event.date.month}</span>
                    <span className="text-[24px] font-black leading-none text-[#1f1f1f]">{event.date.day}</span>
                  </div>

                  <div className="flex-1 rounded-2xl border border-[#e8e3dc] bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 group-hover:border-[#c5bfb7] group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[13px] font-bold uppercase tracking-wide text-[#1f1f1f]">{event.title}</p>
                      <span className="rounded-full bg-[#2f5d3a] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {event.time}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Icon icon="mdi:map-marker-outline" width={13} height={13} color="#d24b46" className="mt-0.5 shrink-0" />
                      <p className="text-[12px] leading-relaxed text-[#6f6a65]">{event.location}</p>
                    </div>

                    <div className="mt-1 flex items-start gap-1.5">
                      <Icon icon="mdi:clock-outline" width={13} height={13} color="#8b847c" className="mt-0.5 shrink-0" />
                      <p className="text-[12px] leading-relaxed text-[#8b847c]">Open {event.time}, or until stocks last.</p>
                    </div>

                    <div className="mt-2.5">
                      <span className="rounded-full border border-[#cce0d4] bg-[#eef4f0] px-2 py-0.5 text-[11px] font-semibold text-[#2f5d3a]">
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="gallery" className="scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">Gallery</h2>
            <p className="mb-6 mt-1 text-[14px] text-[#8b847c]">Upload pop-up photos, then edit the caption, location, and event from the photo itself.</p>
            <PopUpGalleryManager vendorId={vendor.id} initialPhotos={galleryPhotos} />
          </section>

          <section id="reviews" className="scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">Reviews</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {mockReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-[#ece5dd] bg-white px-5 py-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7da] text-sm font-bold text-[#2f5d3a]">
                      {review.name[0]}
                    </div>
                    <p className="text-[14px] font-semibold text-[#2a2724]">{review.name}</p>
                  </div>
                  <p className="leading-relaxed text-[13px] text-[#4c4742]">{review.comment}</p>
                  <div className="mt-3 flex items-center justify-between text-[13px]">
                    <span className="text-[#f5ad2e]">{"★".repeat(review.rating)}</span>
                    <span className="text-[#8b847c]">{review.daysAgo} days ago</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="mb-16 scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">About</h2>
            <div className="mt-4 rounded-2xl border border-[#ece5dd] bg-white px-6 py-5">
              <p className="leading-7 text-[14px] text-[#4c4742]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et odio eros. Vivamus vitae
                elementum justo. Mauris volutpat suscipit ante, in hendrerit mauris tincidunt vitae.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}