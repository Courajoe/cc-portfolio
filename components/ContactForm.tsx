"use client";

import { useState, type FormEvent } from "react";

import { UiIcon } from "@/components/Icon";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Optional contact form, fully client-side. It POSTs to Formspree
 * (https://formspree.io), which forwards submissions to your inbox, so no
 * server code is involved. It only renders when `formspreeId` is set in
 * content/bio.json.
 */
export default function ContactForm({ formspreeId }: { formspreeId: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-lg border border-line bg-bg/70 px-4 py-2.5 text-sm text-heading placeholder:text-muted/70 transition-colors focus:border-accent/70 focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      className="glow-border relative rounded-2xl border border-line bg-surface p-6 sm:p-8"
    >
      <p className="mb-5 font-mono text-xs text-muted">
        <span className="text-accent">$</span> send-message --interactive
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-xs text-fg/80">name</span>
          <input name="name" required autoComplete="name" className={field} placeholder="Ada Lovelace" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-xs text-fg/80">email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
            placeholder="ada@example.com"
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block font-mono text-xs text-fg/80">message</span>
        <textarea
          name="message"
          required
          rows={5}
          className={`${field} resize-y`}
          placeholder="What are we building?"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/60 bg-accent/10 px-5 py-2.5 font-mono text-sm font-semibold text-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-bg hover:shadow-glow disabled:cursor-wait disabled:opacity-60"
        >
          <UiIcon name="send" className="size-4" />
          {status === "sending" ? "sending…" : "send"}
        </button>

        <p role="status" aria-live="polite" className="font-mono text-xs">
          {status === "sent" && (
            <span className="text-accent">✔ Message sent. I&apos;ll get back to you soon.</span>
          )}
          {status === "error" && (
            <span className="text-danger">✘ Something went wrong. Please try the email button instead.</span>
          )}
        </p>
      </div>
    </form>
  );
}
