"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { VendorApplicationRecord } from "@/typess";
import { useVendorApplications } from "@/hooks/useVendorApplications";
import ApplicationCard from "@/components/admin/ApplicationCard";
import AdminNavBar from "@/components/admin/AdminNavBar";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import type { IssuedVendorCredentials } from "./actions";

const BULK_REJECTION_REASON = "Rejected in bulk by admin";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px] animate-pulse">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[12px] items-center">
          <div className="size-[20px] rounded-[6px] bg-[#e6e2dd]" />
          <div className="size-[44px] rounded-[12px] bg-[#e6e2dd]" />
          <div className="flex flex-col gap-[8px]">
            <div className="h-[24px] w-[220px] rounded-[8px] bg-[#e6e2dd]" />
            <div className="h-[18px] w-[160px] rounded-[8px] bg-[#e6e2dd]" />
          </div>
        </div>
        <div className="h-[24px] w-[88px] rounded-full bg-[#e6e2dd]" />
      </div>
      <div className="bg-[#e6e2dd] h-px w-full" />
      <div className="space-y-[10px]">
        <div className="h-[18px] w-[280px] rounded-[8px] bg-[#e6e2dd]" />
        <div className="h-[18px] w-[220px] rounded-[8px] bg-[#e6e2dd]" />
        <div className="h-[40px] w-full rounded-[12px] bg-[#f3f2f0]" />
      </div>
      <div className="flex gap-[12px]">
        <div className="h-[44px] w-[120px] rounded-[12px] bg-[#e6e2dd]" />
        <div className="h-[44px] w-[120px] rounded-[12px] bg-[#e6e2dd]" />
      </div>
    </div>
  );
}

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
  const { data: applications, isLoading, error, approve, reject } = useVendorApplications();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedVendorCredentials[]>([]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (applications.some((application) => application.id === id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [applications]);

  // ── Individual card handlers ──────────────────────────
  const handleApprove = async (application: VendorApplicationRecord) => {
    try {
      const result = await approve(application);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(application.id);
        return next;
      });
      if (result?.credentials) {
        setIssuedCredentials((prev) => [result.credentials, ...prev]);
      }
      showToast("Vendor approved. Credentials are now available below.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve the application.";
      showToast(message, "error");
    }
  };

  const handleReject = async (application: VendorApplicationRecord, reason: string) => {
    try {
      await reject(application, reason);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(application.id);
        return next;
      });
      showToast(`Application rejected: ${reason}`, "error");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject the application.";
      showToast(message, "error");
    }
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
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)));
    }
  };

  // ── Batch handlers ────────────────────────────────────
  const handleApproveSelected = async () => {
    const selectedApplications = applications.filter((application) => selectedIds.has(application.id));

    try {
      const approvals = await Promise.all(selectedApplications.map((application) => approve(application)));
      const newCredentials = approvals
        .map((approval) => approval?.credentials)
        .filter((credential): credential is IssuedVendorCredentials => Boolean(credential));

      if (newCredentials.length > 0) {
        setIssuedCredentials((prev) => [...newCredentials, ...prev]);
      }

      showToast(`${selectedApplications.length} vendor(s) approved. Credentials are listed below.`, "success");
      setSelectedIds(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve selected applications.";
      showToast(message, "error");
    }
  };

  const handleRejectAll = async () => {
    try {
      await Promise.all(applications.map((application) => reject(application, BULK_REJECTION_REASON)));
      showToast("All applications rejected.", "error");
      setSelectedIds(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject all applications.";
      showToast(message, "error");
    }
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
            <button className="bg-white border border-[#e6e2dd] flex gap-[4px] h-[44px] items-center justify-center px-[14px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors">
              Filter ▾
            </button>
          </div>

          {/* Pending count */}
          <p className="text-[#7a746e] text-[14px] -mt-[20px]">
            Pending Applications ({isLoading ? "..." : applications.length})
          </p>

          {/* Batch Actions Row */}
          <div className="flex gap-[12px] items-center flex-wrap">
            <button
              onClick={handleSelectAll}
              disabled={isLoading || applications.length === 0}
              className="bg-[#e6e2dd] flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#d9d5d0] transition-colors"
            >
              {allSelected ? "☑" : "☐"} Select All ▾
            </button>
            <button
              onClick={handleApproveSelected}
              disabled={isLoading || selectedIds.size === 0}
              className="bg-[#2e7d5b] text-white flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#255f45] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✓ Approve Selected
            </button>
            <button
              onClick={handleRejectAll}
              disabled={isLoading || applications.length === 0}
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

          {issuedCredentials.length > 0 && (
            <section className="rounded-[16px] border border-[#d6e8dd] bg-[#f2faf5] p-[20px] flex flex-col gap-[14px]">
              <div className="flex items-center justify-between gap-[12px] flex-wrap">
                <div>
                  <p className="text-[#235640] font-semibold text-[18px]">Issued Vendor Credentials</p>
                  <p className="text-[#497361] text-[13px] mt-[2px]">Share these temporary credentials with approved vendors. They can change the password after logging in.</p>
                </div>
                <button
                  onClick={() => setIssuedCredentials([])}
                  className="bg-white border border-[#d6e8dd] text-[#235640] h-[36px] px-[12px] rounded-[10px] text-[13px] font-medium cursor-pointer hover:bg-[#e9f6ef] transition-colors"
                >
                  Clear List
                </button>
              </div>

              <div className="flex flex-col gap-[10px]">
                {issuedCredentials.map((credential) => (
                  <div
                    key={credential.userId}
                    className="rounded-[12px] border border-[#d6e8dd] bg-white p-[12px] flex flex-col gap-[6px]"
                  >
                    <p className="text-[#2c2a28] text-[14px]"><span className="font-semibold">Email:</span> {credential.email}</p>
                    <p className="text-[#2c2a28] text-[14px]"><span className="font-semibold">Temporary Password:</span> {credential.password}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cards list or Empty state */}
          {isLoading ? (
            <div className="flex flex-col gap-[24px] w-full">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <div className="bg-white border border-[#f5c6c3] rounded-[16px] p-[24px] flex items-center justify-between gap-[16px]">
              <div>
                <p className="text-[#cc3526] font-semibold text-[18px]">Unable to load vendor applications</p>
                <p className="text-[#7a746e] text-[14px] mt-[4px]">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#2e7d5b] text-white h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#255f45] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
              <Icon icon="mdi:leaf" width={48} height={48} className="text-[#b8b2ab]" />
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
                  isSelected={selectedIds.has(app.id)}
                  onToggle={handleToggle}
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
