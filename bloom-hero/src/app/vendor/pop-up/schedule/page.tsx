import { Icon } from "@iconify/react";
import { VendorDashboardSidebarCard } from "@/app/vendor/_components/vendor-dashboard-sidebar-card";
import {
  mockMostRequested,
  mockRecentRequests,
  mockUpcomingEvents,
} from "@/lib/mockData";

const mostRequested = mockMostRequested;
const recentRequests = mockRecentRequests;
const upcomingEvents = mockUpcomingEvents;

export default function PopUpDashboardPage() {
  return (
    <div
      className="flex h-screen bg-[#fbf7f4] text-[#1f1f1f]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Sidebar */}
      <VendorDashboardSidebarCard activeTab="schedule" vendorType="pop-up" />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">

            {/* Page heading */}
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-[28px] font-bold text-[#1f1f1f] tracking-[-0.64px]">Pop Ups</h1>
                <p className="text-[#6f6a65] mt-1 text-[15px] font-medium">
                  Manage your schedules and view customer requests
                </p>
              </div>
              <button className="flex items-center gap-2 bg-[#2f5d3a] hover:bg-[#264d30] text-white px-5 py-2.5 rounded-[12px] font-semibold text-sm transition-all">
                <Icon icon="mdi:plus" width={18} height={18} />
                New Schedule
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-12 gap-6">

              {/* ── Left Column ── */}
              <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">

                {/* Most Requested */}
                <section className="bg-white rounded-[20px] p-6 border border-[#edeae6]">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[17px] font-bold text-[#1f1f1f] flex items-center gap-2">
                      Most Requested
                      <span className="text-[11px] font-medium text-[#7a7a7a] bg-[#f7f4ef] px-2 py-0.5 rounded-full border border-[#edeae6]">
                        Monthly
                      </span>
                    </h2>
                    <button className="text-sm font-semibold text-[#2f5d3a] hover:underline">
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mostRequested.length === 0 ? (
                      <p className="col-span-2 py-8 text-center text-[#7a7a7a] text-sm font-medium">
                        No requests yet this month.
                      </p>
                    ) : (
                      mostRequested.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-[14px] bg-white border border-[#d6d0c8] flex justify-between items-center hover:shadow-md hover:shadow-[#e8e2da] cursor-pointer transition-all duration-200"
                        >
                          <div>
                            <p className="text-[#7a7a7a] text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                              Location
                            </p>
                            <p className="text-[#1f1f1f] font-bold text-lg">{item.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#E05850] font-black text-2xl leading-none">{item.count}</p>
                            <p className="text-[#7a7a7a] text-[10px] font-semibold uppercase tracking-wider">
                              Requests
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Recent Requests */}
                <section className="bg-white rounded-[20px] p-6 border border-[#edeae6]">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[17px] font-bold text-[#1f1f1f]">Recent Requests</h2>
                    <button className="text-sm font-semibold text-[#2f5d3a] hover:underline">
                      View Map
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentRequests.length === 0 ? (
                      <p className="col-span-2 py-8 text-center text-[#7a7a7a] text-sm font-medium">
                        No recent requests yet.
                      </p>
                    ) : (
                      recentRequests.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-[14px] bg-white border border-[#d6d0c8] hover:shadow-md hover:shadow-[#e8e2da] cursor-pointer transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-[#f7f4ef] rounded-[10px] border border-[#edeae6]">
                              <Icon icon="mdi:map-marker-outline" width={16} height={16} className="text-[#E05850]" />
                            </div>
                            <span className="text-[10px] font-bold text-[#7a7a7a] bg-[#f7f4ef] border border-[#edeae6] px-2 py-1 rounded-md">
                              {item.date}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2f5d3a] shrink-0" />
                              <span className="text-sm font-bold text-[#1f1f1f]">{item.city}</span>
                            </div>
                            <p className="text-xs text-[#6f6a65] pl-3.5">{item.barangay}</p>
                            <p className="text-xs text-[#7a7a7a] pl-3.5 italic">{item.landmark}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              {/* ── Right Column ── */}
              <div className="col-span-12 lg:col-span-5">
                <section className="bg-white rounded-[20px] p-6 border border-[#edeae6] h-full flex flex-col">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-[17px] font-bold text-[#1f1f1f]">Upcoming Pop Ups</h2>
                    <button className="p-2 text-[#6f6a65] hover:text-[#1f1f1f] hover:bg-[#f7f4ef] rounded-[10px] transition-colors">
                      <Icon icon="mdi:calendar-outline" width={20} height={20} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    {upcomingEvents.length === 0 ? (
                      <p className="py-8 text-center text-[#7a7a7a] text-sm font-medium">
                        No upcoming events scheduled.
                      </p>
                    ) : (
                      upcomingEvents.map((event, idx) => (
                        <div key={idx} className="flex gap-3 group cursor-pointer">
                          {/* Date block */}
                          <div className="flex flex-col items-center justify-center min-w-[60px] h-[72px] bg-white border border-[#d6d0c8] rounded-[14px] transition-all duration-200 group-hover:bg-[#fdf0ef] group-hover:border-[#E05850]">
                            <span className="text-[10px] font-bold text-[#7a7a7a] group-hover:text-[#E05850] transition-colors duration-200">
                              {event.date.month}
                            </span>
                            <span className="text-2xl font-black text-[#1f1f1f] group-hover:text-[#E05850] transition-colors duration-200 leading-none">
                              {event.date.day}
                            </span>
                          </div>

                          {/* Event details */}
                          <div className="flex-1 bg-white rounded-[14px] p-4 border border-[#d6d0c8] group-hover:shadow-md group-hover:shadow-[#e8e2da] transition-all duration-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-[#1f1f1f] text-sm">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6f6a65]">
                                  <Icon icon="mdi:clock-outline" width={12} height={12} className="text-[#7a7a7a]" />
                                  {event.time}
                                </div>
                              </div>
                              <button className="p-1.5 text-[#7a7a7a] hover:text-[#E05850] rounded-[8px] transition-colors duration-200">
                                <Icon icon="mdi:pencil-outline" width={14} height={14} />
                              </button>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-[#7a7a7a]">
                              <Icon icon="mdi:map-marker-outline" width={12} height={12} />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button className="mt-5 w-full py-3 border-2 border-dashed border-[#d6d0c8] rounded-[14px] text-[#6f6a65] font-semibold text-sm hover:border-[#2f5d3a] hover:text-[#2f5d3a] transition-all duration-200 flex items-center justify-center gap-2">
                    <Icon icon="mdi:calendar-outline" width={18} height={18} />
                    View All Schedules
                  </button>
                </section>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}