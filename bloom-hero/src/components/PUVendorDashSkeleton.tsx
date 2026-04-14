export function DashboardSkeleton() {
  return (
    <div
      className="flex-1 overflow-y-auto p-8 animate-pulse"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Heading */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-36 bg-[#edeae6] rounded-xl" />
            <div className="h-4 w-64 bg-[#edeae6] rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-[#edeae6] rounded-[12px]" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-[20px] p-6 border border-[#edeae6]">
              <div className="h-5 w-40 bg-[#edeae6] rounded-lg mb-5" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#edeae6] rounded-[14px]" />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-6 border border-[#edeae6]">
              <div className="h-5 w-40 bg-[#edeae6] rounded-lg mb-5" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-[#edeae6] rounded-[14px]" />
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-[20px] p-6 border border-[#edeae6] flex flex-col gap-3">
              <div className="h-5 w-40 bg-[#edeae6] rounded-lg mb-2" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="min-w-[60px] h-[72px] bg-[#edeae6] rounded-[14px]" />
                  <div className="flex-1 h-[72px] bg-[#edeae6] rounded-[14px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}