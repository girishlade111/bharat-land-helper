import { useApp } from "@/context/AppContext";
import { QUICK_REFS } from "@/data/units";
import { t } from "@/data/translations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function QuickReference() {
  const { lang } = useApp();

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="mb-3 text-base font-bold">{t("quickRef", lang)}</h2>
      <Accordion type="multiple" className="space-y-1">
        {QUICK_REFS.map((ref) => (
          <AccordionItem key={ref.section} value={ref.section} className="border rounded-md px-3">
            <AccordionTrigger className="text-sm font-semibold py-3">
              {lang === "hi" ? ref.sectionHi : ref.section}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5 pb-2">
                {ref.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
