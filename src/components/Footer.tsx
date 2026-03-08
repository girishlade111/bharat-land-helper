import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";

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
        <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="cursor-pointer hover:text-foreground">Privacy Policy</span>
          <span className="cursor-pointer hover:text-foreground">About</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {lang === "hi" ? "भारत के हर किसान और दलाल के लिए" : t("footerTagline", lang)}
        </p>
      </div>
    </footer>
  );
}
