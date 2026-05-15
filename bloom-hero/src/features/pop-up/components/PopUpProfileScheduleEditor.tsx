"use client";

import { FormEvent, useState, useTransition } from "react";

import { createPopUpProfileSchedule } from "@/features/pop-up/actions/createPopUpProfileSchedule";

export function PopUpProfileScheduleEditor() {
  const [location, setLocation] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await createPopUpProfileSchedule({
        location,
        scheduledDate,
        startTime: startTime || null,
        endTime: endTime || null,
      });

      if (!result.ok) {
        setMessage(result.error ?? "Failed to add schedule.");
        return;
      }

      setLocation("");
      setScheduledDate("");
      setStartTime("");
      setEndTime("");
      setMessage("Schedule added.");
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-3 rounded-2xl border border-[#ece5dd] bg-white p-4 md:grid-cols-2">
      <input
        type="text"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="Location"
        className="rounded-xl border border-[#ddd6ce] px-3 py-2 text-sm md:col-span-2"
      />
      <input
        type="date"
        value={scheduledDate}
        onChange={(event) => setScheduledDate(event.target.value)}
        className="rounded-xl border border-[#ddd6ce] px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          className="rounded-xl border border-[#ddd6ce] px-3 py-2 text-sm"
        />
        <input
          type="time"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          className="rounded-xl border border-[#ddd6ce] px-3 py-2 text-sm"
        />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#2f5d3a] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add schedule"}
        </button>
        {message ? <p className="text-xs text-[#6f6a65]">{message}</p> : null}
      </div>
    </form>
  );
}
