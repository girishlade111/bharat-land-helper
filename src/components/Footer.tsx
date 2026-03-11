import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";
import { Instagram, Linkedin, Github, Globe, Mail, CodeXml } from "lucide-react";

const socials = [
  { href: "https://www.instagram.com/girish_lade_/", icon: Instagram, label: "Instagram" },
  { href: "https://www.linkedin.com/in/girish-lade-075bba201/", icon: Linkedin, label: "LinkedIn" },
  { href: "https://github.com/girishlade111", icon: Github, label: "GitHub" },
  { href: "https://codepen.io/Girish-Lade-the-looper", icon: CodeXml, label: "CodePen" },
  { href: "mailto:admin@ladestack.in", icon: Mail, label: "Email" },
  { href: "https://ladestack.in", icon: Globe, label: "Website" },
];

export default function Footer() {
  const { lang } = useApp();

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container max-w-4xl px-4 py-8">
        {/* Top section */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-md hero-gradient text-white text-[10px] font-bold">B</div>
              <span className="text-sm font-bold text-foreground">Bharat Land Converter</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("footerFree", lang)}
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-105"
              >
                <s.icon size={14} strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-border/50" />

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">{lang === "hi" ? "होम" : "Home"}</Link>
          <Link to="/about" className="transition-colors hover:text-foreground">{lang === "hi" ? "हमारे बारे में" : "About"}</Link>
          <Link to="/contact" className="transition-colors hover:text-foreground">{lang === "hi" ? "संपर्क" : "Contact"}</Link>
          <Link to="/faq" className="transition-colors hover:text-foreground">{lang === "hi" ? "सामान्य प्रश्न" : "FAQ"}</Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">{lang === "hi" ? "गोपनीयता नीति" : "Privacy"}</Link>
          <Link to="/terms" className="transition-colors hover:text-foreground">{lang === "hi" ? "नियम और शर्तें" : "Terms"}</Link>
        </div>

        {/* Bottom */}
        <div className="mt-5 text-center">
          <p className="text-xs text-muted-foreground">
            Built by{" "}
            <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
              Lade Stack
            </a>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {lang === "hi" ? "भारत के हर किसान और दलाल के लिए" : t("footerTagline", lang)}
          </p>
        </div>
      </div>
    </footer>
  );
}
