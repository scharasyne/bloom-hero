import { Icon } from "@iconify/react/dist/iconify.js";
import { redirect } from "next/navigation";

import { PopUpGalleryManager } from "@/features/pop-up/components/PopUpGalleryManager";
import { PopUpProfileScheduleEditor } from "@/features/pop-up/components/PopUpProfileScheduleEditor";
import { VendorDashboardSidebarCard } from "@/features/vendors/components/VendorDashboardSidebarCard";
import { VendorProfileHeader } from "@/features/vendors/components/VendorProfileHeader";
import { VendorProfileEditor } from "@/features/reviews/components/VendorProfileEditor";
import { getPopupGalleryPhotos } from "@/features/pop-up/queries/getPopupGalleryPhotos";
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile";
import { getPopUpVendorProfileData } from "@/features/pop-up/queries/getPopUpVendorProfileData";
import { getRecentPopUpLocationRequests } from "@/features/pop-up/queries/getRecentPopupLocationRequests";
import { publicVendorProfilePath } from "@/features/vendors/utils/publicVendorPaths";

function formatDate(value: string | null) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function VendorProfilePage() {
  const profile = await getPopUpVendorProfileData();
  const commonProfile = await getVendorCommonProfileByOwner();
  if (!profile) redirect("/login");
  if (!commonProfile) redirect("/login");

  const galleryPhotos = await getPopupGalleryPhotos(profile.vendorId);
  const recentLocationRequests = await getRecentPopUpLocationRequests(profile.vendorId);

  return (
    <main className="flex min-h-screen bg-[#fbf7f4]">
      <div className="p-4 sm:p-6 lg:p-8">
        <VendorDashboardSidebarCard activeTab="profile" businessType={commonProfile.businessType} />
      </div>

      <section className="w-full px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
        <VendorProfileHeader
          profile={commonProfile}
          previewHref={publicVendorProfilePath(profile.vendorId)}
        />

        <div className="border-b border-[#ddd8d0] pb-1.5 mt-8">
          <nav className="flex gap-6 text-[14px] font-medium text-[#8b847c]">
            {["Schedule", "Gallery", "Reviews", "About"].map((tab) => (
              <a
                key={tab}
                href={`#${tab.toLowerCase()}`}
                className="pb-2.5 transition-colors hover:text-[#1f1f1f]"
              >
                {tab}
              </a>
            ))}
          </nav>
        </div>

        <div className="space-y-14 pt-8">
          <section id="schedule" className="scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">Schedule</h2>
            <p className="mb-2 mt-1 text-[14px] text-[#8b847c]">Where and when these blooms appear</p>
            <PopUpProfileScheduleEditor />
            <div className="mt-5 flex flex-col gap-3">
              {profile.schedules.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#d8d0c7] bg-white px-4 py-5 text-sm text-[#7a746e]">
                  No upcoming schedules yet.
                </p>
              ) : (
                profile.schedules.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-[#e8e3dc] bg-white px-4 py-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[13px] font-bold uppercase tracking-wide text-[#1f1f1f]">
                        {formatDate(event.scheduledDate)}
                      </p>
                      <span className="rounded-full bg-[#2f5d3a] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {(event.startTime ? new Date(event.startTime).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }) : "TBD")}
                        {event.endTime
                          ? ` - ${new Date(event.endTime).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}`
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Icon icon="mdi:map-marker-outline" width={13} height={13} color="#d24b46" className="mt-0.5 shrink-0" />
                      <p className="text-[12px] leading-relaxed text-[#6f6a65]">{event.location}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#262321]">Most recent location requests</h3>
              <div className="mt-3 space-y-2">
                {recentLocationRequests.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[#d8d0c7] bg-white px-4 py-3 text-xs text-[#7a746e]">
                    No location requests yet.
                  </p>
                ) : (
                  recentLocationRequests.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#e8e3dc] bg-white px-3 py-2 text-sm text-[#4c4742]"
                    >
                      <p>{item.location}</p>
                      <p className="text-xs text-[#8b847c]">
                        {item.requestedDate
                          ? new Date(item.requestedDate).toLocaleDateString("en-PH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : item.createdAt
                            ? new Date(item.createdAt).toLocaleString("en-PH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "Recently"}
                      </p>
                      {(item.requestedStartTime || item.requestedEndTime) && (
                        <p className="text-xs text-[#8b847c]">
                          {item.requestedStartTime?.slice(0, 5) || "--:--"} -{" "}
                          {item.requestedEndTime?.slice(0, 5) || "--:--"}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section id="gallery" className="scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">Gallery</h2>
            <p className="mb-6 mt-1 text-[14px] text-[#8b847c]">
              Upload pop-up photos, then edit the caption, location, and event from the photo itself.
            </p>
            <PopUpGalleryManager vendorId={profile.vendorId} initialPhotos={galleryPhotos} />
          </section>

          <section id="reviews" className="scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">Reviews</h2>
            <VendorProfileEditor initialReviews={profile.reviews} />
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {profile.reviews.length === 0 ? (
                <p className="md:col-span-3 rounded-2xl border border-dashed border-[#d8d0c7] bg-white px-4 py-5 text-sm text-[#7a746e]">
                  No reviews yet.
                </p>
              ) : (
                profile.reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-[#ece5dd] bg-white px-5 py-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7da] text-sm font-bold text-[#2f5d3a]">
                        {review.customerName.trim().charAt(0).toUpperCase() || "C"}
                      </div>
                      <p className="text-[14px] font-semibold text-[#2a2724]">{review.customerName}</p>
                    </div>
                    <p className="leading-relaxed text-[13px] text-[#4c4742]">{review.comment}</p>
                    <div className="mt-3 flex items-center justify-between text-[13px]">
                      <span className="text-[#f5ad2e]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                      <span className="text-[#8b847c]">{formatDate(review.reviewDate)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section id="about" className="mb-16 scroll-mt-20">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1f1f1f]">About</h2>
            <div className="mt-4 rounded-2xl border border-[#ece5dd] bg-white px-6 py-5">
              <p className="leading-7 text-[14px] text-[#4c4742]">{profile.aboutText}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}