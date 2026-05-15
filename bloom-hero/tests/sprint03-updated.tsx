"use client";

import { useMemo, useState } from "react";
import sprint03Data from "@/data/sprint03-updated.json";

export type sprint03Row = {
  id: string;
  userStoryId: string;
  module: string;
  title: string;
  testType: string;
  priority: string;
  caseType: string;
  preconditions: string;
  testData: string;
  steps: string;
  expected: string;
  actual: string;
  status: string;
  remarks: string;
  route: string;
  role: string;
};

const COLUMNS: { key: keyof sprint03Row; label: string; wide?: boolean }[] = [
  { key: "id", label: "ID" },
  { key: "module", label: "Module" },
  { key: "title", label: "Test Title", wide: true },
  { key: "caseType", label: "Type" },
  { key: "priority", label: "Priority" },
  { key: "testData", label: "Test Data", wide: true },
  { key: "steps", label: "Steps to Execute", wide: true },
  { key: "expected", label: "Expected Result", wide: true },
  { key: "actual", label: "Actual Result", wide: true },
  { key: "status", label: "Status" },
  { key: "route", label: "Route" },
  { key: "role", label: "Role" },
];

function Cell({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#2c2a28]">{text || "—"}</div>
  );
}

export default function sprint03Updated() {
  const rows = sprint03Data.cases as sprint03Row[];
  const modules = useMemo(() => ["All", ...new Set(rows.map((r) => r.module))], [rows]);
  const [moduleFilter, setModuleFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) => {
    if (moduleFilter !== "All" && r.module !== moduleFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.actual.toLowerCase().includes(q) ||
      r.steps.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#fbf7f4] text-[#1f1f1f]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <header className="border-b border-[#e6e2dd] bg-white px-4 py-6 sm:px-8">
        <h1 className="text-2xl font-semibold">Sprint 03 — Updated test cases</h1>
        <p className="mt-1 text-sm text-[#7a746e]">
          Grounded in current routes (/search, /cart, /orders, /vendor/*, /map). Each module has 2 Sunny and 8 Rainy cases.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#5f5a55]">
          {Object.entries(sprint03Data.testAccounts as Record<string, string>).map(([k, v]) => (
            <span key={k} className="rounded-full bg-[#eef4f0] px-3 py-1 font-medium text-[#2f5d3a]">
              {k}: {v}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-xl border border-[#e6e2dd] bg-white px-3 py-2 text-sm"
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search id, title, steps, actual…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-[220px] flex-1 rounded-xl border border-[#e6e2dd] bg-white px-3 py-2 text-sm"
          />
          <span className="self-center text-sm text-[#7a746e]">
            {filtered.length} / {rows.length} cases
          </span>
        </div>
      </header>

      <div className="overflow-x-auto p-4 sm:p-6">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead>
            <tr className="bg-[#2f5d3a] text-white">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`sticky top-0 px-3 py-3 text-xs font-semibold uppercase tracking-wide ${col.wide ? "min-w-[200px]" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-[#faf8f5]"}>
                {COLUMNS.map((col) => {
                  const value = row[col.key];
                  const isActual = col.key === "actual";
                  return (
                    <td
                      key={col.key}
                      className={`border-b border-[#edeae6] px-3 py-3 align-top ${isActual ? "bg-[#f0f9f4] ring-1 ring-inset ring-[#c8e6d0]" : ""}`}
                    >
                      {col.key === "status" ? (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            value === "Passed"
                              ? "bg-[#eaf4ee] text-[#2e7d5b]"
                              : value === "Failed"
                                ? "bg-[#fde4e1] text-[#cc3526]"
                                : value === "Partial"
                                  ? "bg-[#fff7e8] text-[#b86a2a]"
                                  : "bg-[#f3f2f0] text-[#7a746e]"
                          }`}
                        >
                          {value || "Not Run"}
                        </span>
                      ) : (
                        <Cell text={value} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
