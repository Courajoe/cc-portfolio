import Image from "next/image";

import ContactForm from "@/components/ContactForm";
import { BrandIcon, UiIcon } from "@/components/Icon";
import SectionHeading from "@/components/SectionHeading";
import { bio } from "@/lib/content";

/**
 * About + contact. No backend: the primary action is a mailto: link. If
 * `formspreeId` is set in content/bio.json, a client-side form that posts
 * straight to Formspree is shown too.
 */
export default function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        index="04"
        command="./contact.sh"
        title="Let's build something"
        description="Collabs, sponsorships, video ideas, or you just shipped something with AI and want to show it off. My inbox is open."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* About card */}
        <div className="glow-border relative rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <p className="font-mono text-xs text-muted">
            <span className="text-violet">$</span> cat README.md
          </p>
          <div className="mt-5 flex items-center gap-4">
            <Image
              src={bio.profileImage}
              alt={bio.name}
              width={64}
              height={64}
              className="size-16 rounded-full ring-1 ring-line"
            />
            <div>
              <p className="font-mono text-lg font-bold text-heading">{bio.name}</p>
              <p className="font-mono text-xs text-muted">
                {bio.handle} <span className="mx-1 text-line">·</span> {bio.location}
              </p>
            </div>
          </div>
          <p className="mt-5 leading-relaxed text-fg/85">{bio.longBio}</p>
        </div>

        {/* Email + socials card */}
        <div className="glow-border relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent/10 blur-3xl"
          />

          <p className="font-mono text-xs text-muted">
            <span className="text-accent">$</span> echo $EMAIL
          </p>
          <p className="mt-2 font-mono text-lg break-all text-heading">{bio.email}</p>

          <a
            href={`mailto:${bio.email}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-mono text-sm font-semibold text-bg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
          >
            <UiIcon name="mail" className="size-4" />
            Send me an email
          </a>

          <div className="mt-8 border-t border-line pt-6">
            <p className="mb-3 font-mono text-xs text-muted">
              <span className="text-violet">$</span> ls ./socials
            </p>
            <ul className="flex flex-wrap gap-3">
              {bio.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg/60 px-4 py-2 font-mono text-sm text-fg transition-all duration-200 hover:-translate-y-0.5 hover:border-violet/60 hover:text-heading hover:shadow-glow-violet"
                  >
                    <BrandIcon name={social.icon} className="size-4" />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {bio.formspreeId && (
          <div className="lg:col-span-2">
            <ContactForm formspreeId={bio.formspreeId} />
          </div>
        )}
      </div>
    </section>
  );
}
