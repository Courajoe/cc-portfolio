import { BrandIcon } from "@/components/Icon";
import { bio } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 font-mono text-xs text-muted sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {bio.name}
          <span className="mx-2 text-line">|</span>
          built with <span className="text-fg">next.js</span>, shipped with{" "}
          <span className="text-fg">dokploy</span>
        </p>
        <ul className="flex items-center gap-4">
          {bio.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="block text-muted transition-colors hover:text-accent"
              >
                <BrandIcon name={social.icon} className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
