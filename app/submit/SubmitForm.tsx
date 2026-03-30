"use client";

import { useActionState } from "react";
import { submitRecommendation, SubmitState } from "./actions";
import { CATEGORIES } from "../lib/constants";

const initialState: SubmitState = { status: "idle" };

export default function SubmitForm() {
  const [state, action, pending] = useActionState(submitRecommendation, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-2xl mb-2">🙌</p>
        <h2 className="text-lg font-semibold text-green-800 mb-1">Thanks for the rec!</h2>
        <p className="text-green-700 text-sm">Ben will review it and add it to the guide if he thinks it fits.</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700" htmlFor="submitterName">
          Your name <span className="text-red-400">*</span>
        </label>
        <input
          id="submitterName"
          name="submitterName"
          type="text"
          placeholder="Jane Smith"
          required
          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700" htmlFor="placeName">
          Place name <span className="text-red-400">*</span>
        </label>
        <input
          id="placeName"
          name="placeName"
          type="text"
          placeholder="e.g. Snooze, an A.M. Eatery"
          required
          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium text-stone-700" htmlFor="category">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm font-medium text-stone-700" htmlFor="neighborhood">
            Neighborhood
          </label>
          <input
            id="neighborhood"
            name="neighborhood"
            type="text"
            placeholder="e.g. RiNo"
            className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700" htmlFor="notes">
          Why do you recommend it?
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="What should Ben know about this place?"
          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700" htmlFor="passphrase">
          Passphrase <span className="text-red-400">*</span>
        </label>
        <input
          id="passphrase"
          name="passphrase"
          type="password"
          placeholder="Ask Ben for the password"
          required
          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sky-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
      >
        {pending ? "Submitting…" : "Submit recommendation"}
      </button>
    </form>
  );
}
