"use client";

interface PopUpScheduleItem {
  scheduled_date: string;
  start_time?: string | null;
  end_time?: string | null;
}

interface CustomerVendorSchedulePanelProps {
  schedule: PopUpScheduleItem[];
  vendorName: string;
}

export default function CustomerVendorSchedulePanel({
  schedule,
  vendorName,
}: CustomerVendorSchedulePanelProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="rounded-3xl border border-[#ebe5de] bg-[#fbf9f6] px-5 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7 lg:px-8">
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-[#262321]">
        Pop-up Schedule
      </h2>

      {schedule.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8d0c7] bg-[#fbf8f4] px-5 py-7 text-sm text-[#7a746e]">
          <p className="font-medium text-[#4a453f]">
            No upcoming pop-ups scheduled.
          </p>
          <p className="mt-1">Check back soon for new dates!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-2xl border border-[#ece5dd] bg-white px-4 py-4 hover:border-[#d2cbc3]"
            >
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-[#f0f8f3] text-center">
                <span className="text-[10px] font-semibold uppercase text-[#8a847d]">
                  {new Date(item.scheduled_date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
                <span className="text-lg font-bold text-[#2f5d3a]">
                  {new Date(item.scheduled_date).getDate()}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-[#2c2825]">
                  {formatDate(item.scheduled_date)}
                </p>
                {(item.start_time || item.end_time) && (
                  <p className="mt-1 text-xs text-[#8a847d]">
                    {item.start_time && formatTime(item.start_time)}
                    {item.start_time && item.end_time && " - "}
                    {item.end_time && formatTime(item.end_time)}
                  </p>
                )}
              </div>

              <button className="rounded-full border border-[#e0d8cf] px-3 py-1.5 text-xs font-medium text-[#4a453f] hover:bg-[#f3eee8]">
                Mark interest
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}