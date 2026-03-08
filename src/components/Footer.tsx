import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";

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
    <footer className="border-t bg-card py-8">
      <div className="container px-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {t("footerFree", lang)}
        </p>
        <p className="mt-2 text-sm">
          Built by <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Lade Stack</a> · ladestack.in
        </p>

        {/* Social Icons */}
        <div className="mt-4 flex justify-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110"
            >
              <s.icon size={18} strokeWidth={2} />
            </a>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground hover:underline">Privacy Policy</Link>
          <Link to="/about" className="hover:text-foreground hover:underline">About</Link>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {lang === "hi" ? "भारत के हर किसान और दलाल के लिए" : t("footerTagline", lang)}
        </p>
      </div>
    </footer>
  );
}
