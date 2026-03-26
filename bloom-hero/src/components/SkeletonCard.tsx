export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#edeae6] animate-pulse">
      <div className="bg-[#f0ede9] h-48 w-full" />
      <div className="p-4 flex flex-col gap-2">
        <div className="bg-[#f0ede9] h-4 w-3/4 rounded-full" />
        <div className="bg-[#f0ede9] h-3 w-1/2 rounded-full" />
        <div className="bg-[#f0ede9] h-4 w-1/4 rounded-full mt-1" />
      </div>
    </div>
  );
}
