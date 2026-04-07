"use client";

import { useState } from "react";
import { useVendorApplications } from "@/hooks/useVendorApplications";
import ApplicationCard from "@/components/admin/ApplicationCard";
import AdminNavBar from "@/components/admin/AdminNavBar";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

// ── Simple toast ─────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-[32px] right-[32px] px-[20px] py-[12px] rounded-[12px] text-white text-[14px] font-semibold shadow-lg z-50 transition-all
        ${type === "success" ? "bg-[#2e7d5b]" : "bg-[#cc3526]"}`}
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {message}
    </div>
  );
}

export default function VendorApplicationsPage() {
  const { data: applications, approve, reject } = useVendorApplications();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // ← new

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Individual card handlers ──────────────────────────
  const handleApprove = (id: string) => {
    approve(id);
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    showToast("Vendor approved successfully! 🌸", "success");
  };

  const handleReject = (id: string, reason: string) => {
    reject(id);
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    showToast(`Application rejected: ${reason}`, "error");
  };

  // ── Checkbox handlers ─────────────────────────────────
  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set()); // deselect all
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id))); // select all
    }
  };

  // ── Batch handlers ────────────────────────────────────
  const handleApproveSelected = () => {
    selectedIds.forEach((id) => approve(id));
    showToast(`${selectedIds.size} vendor(s) approved! 🌸`, "success");
    setSelectedIds(new Set());
  };

  const handleRejectAll = () => {
    applications.forEach((app) => reject(app.id));
    showToast("All applications rejected.", "error");
    setSelectedIds(new Set());
  };

  const allSelected = applications.length > 0 && selectedIds.size === applications.length;

  return (
    <div className="flex flex-col h-screen bg-[#f7f4ef]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      {/* Top Nav */}
      <div className="shrink-0 h-[88px]">
        <AdminNavBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebarNav />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-[80px] py-[48px] flex flex-col gap-[32px]">

          {/* Header Row */}
          <div className="flex items-center justify-between w-full">
            <h1 className="font-semibold text-[40px] text-[#2c2a28] leading-[48px]">
              Vendor Applications
            </h1>
            {/* Filter button — UI only */}
            <button className="bg-white border border-[#e6e2dd] flex gap-[4px] h-[44px] items-center justify-center px-[14px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors">
              Filter ▾
            </button>
          </div>

          {/* Pending count */}
          <p className="text-[#7a746e] text-[14px] -mt-[20px]">
            Pending Applications ({applications.length})
          </p>

          {/* Batch Actions Row */}
          <div className="flex gap-[12px] items-center flex-wrap">
            <button
              onClick={handleSelectAll}
              className="bg-[#e6e2dd] flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#d9d5d0] transition-colors"
            >
              {allSelected ? "☑" : "☐"} Select All ▾
            </button>
            <button
              onClick={handleApproveSelected}
              disabled={selectedIds.size === 0}
              className="bg-[#2e7d5b] text-white flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#255f45] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✓ Approve Selected
            </button>
            <button
              onClick={handleRejectAll}
              disabled={applications.length === 0}
              className="bg-[#cc3526] text-white flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#b02d1e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✕ Reject All
            </button>

            {/* Selected count pill */}
            {selectedIds.size > 0 && (
              <span className="text-[#7a746e] text-[14px]">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          {/* Cards list or Empty state */}
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
              <p className="text-[48px]">🌿</p>
              <p className="text-[#2c2a28] font-semibold text-[20px]">All caught up!</p>
              <p className="text-[#7a746e] text-[14px]">No pending vendor applications at this time.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[32px] w-full">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isSelected={selectedIds.has(app.id)}  // ← new
                  onToggle={handleToggle}                // ← new
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
