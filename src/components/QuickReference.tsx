import { useApp } from "@/context/AppContext";
import { QUICK_REFS } from "@/data/units";
import { t } from "@/data/translations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export default function QuickReference() {
  const { lang } = useApp();

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-bold text-foreground">{t("quickRef", lang)}</h2>
      </div>
      <Accordion type="multiple" className="space-y-1.5">
        {QUICK_REFS.map((ref) => (
          <AccordionItem
            key={ref.section}
            value={ref.section}
            className={cn("rounded-lg border-l-[3px] border bg-card/50 px-3", ref.color)}
          >
            <AccordionTrigger className="text-sm font-semibold py-2.5 hover:no-underline">
              {lang === "hi" ? ref.sectionHi : ref.section}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5 pb-2">
                {ref.items.map((item, i) => (
                  <li key={i} className="text-[13px] leading-relaxed text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
