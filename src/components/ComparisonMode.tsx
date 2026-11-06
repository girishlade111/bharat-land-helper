import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatIndianNumber } from "@/core";
import { t } from "@/data/translations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronDown, ShieldCheck } from "lucide-react";

interface BighaEntry {
  state: string;
  stateHi: string;
  variant: string;
  variantHi: string;
  sqft: number;
  acres: number;
  sourceDoc: string;
}

const VERIFIED_BIGHAS: BighaEntry[] = [
  { state: "Uttar Pradesh", stateHi: "उत्तर प्रदेश", variant: "Pucca / Standard (55 yd × 55 yd)", variantHi: "पक्का / मानक", sqft: 27225, acres: 0.625, sourceDoc: "UP Revenue Code 2006" },
  { state: "Maharashtra", stateHi: "महाराष्ट्र", variant: "Customary (25 Guntha)", variantHi: "पारंपरिक (25 गुंठा)", sqft: 27225, acres: 0.625, sourceDoc: "MLR Code 1966" },
  { state: "Rajasthan", stateHi: "राजस्थान", variant: "Pucca (3,025 sq yd)", variantHi: "पक्का (3,025 वर्ग गज)", sqft: 27225, acres: 0.625, sourceDoc: "Rajasthan Tenancy Act 1955" },
  { state: "Bihar", stateHi: "बिहार", variant: "Standard 5.5-Haath Lagga (20 Kattha)", variantHi: "मानक 5.5 हाथ लग्गी", sqft: 27225, acres: 0.625, sourceDoc: "Bihar Tenancy Manual" },
  { state: "Madhya Pradesh", stateHi: "मध्य प्रदेश", variant: "Malwa / Mahakoshal Customary", variantHi: "मालवा / महाकौशल पारंपरिक", sqft: 27225, acres: 0.625, sourceDoc: "Central India Customary Standard" },
  { state: "Bihar (North)", stateHi: "उत्तर बिहार", variant: "Tirhut / Mithila (6-Haath Lagga)", variantHi: "तिरहुत (6 हाथ लग्गी)", sqft: 32400, acres: 0.7438, sourceDoc: "Cadastral Survey Records" },
  { state: "Rajasthan", stateHi: "राजस्थान", variant: "Kaccha Customary (1,936 sq yd)", variantHi: "कच्चा पारंपरिक", sqft: 17424, acres: 0.4, sourceDoc: "Apna Khata Customary" },
  { state: "Gujarat", stateHi: "गुजरात", variant: "Standard Vigha (16 Guntha)", variantHi: "मानक वीघा (16 गुंठा)", sqft: 17424, acres: 0.4, sourceDoc: "AnyRoR Gujarat Standard" },
  { state: "West Bengal", stateHi: "पश्चिम बंगाल", variant: "Statutory Bigha (1/3 Acre = 20 Kattha)", variantHi: "वैधानिक बीघा (1/3 एकड़)", sqft: 14400, acres: 0.3333, sourceDoc: "WB Land Reforms Act 1955" },
  { state: "Assam", stateHi: "असम", variant: "Standard Bigha (5 Kattha)", variantHi: "मानक बीघा (5 कट्ठा)", sqft: 14400, acres: 0.3333, sourceDoc: "Dharitree Assam Manual" },
  { state: "Madhya Pradesh", stateHi: "मध्य प्रदेश", variant: "Gwalior / Chambal Customary", variantHi: "ग्वालियर / चंबल पारंपरिक", sqft: 12000, acres: 0.2755, sourceDoc: "Gwalior State Settlement" },
  { state: "Western UP", stateHi: "पश्चिमी उ.प्र.", variant: "Kaccha Customary (Meerut)", variantHi: "कच्चा पारंपरिक (मेरठ)", sqft: 9075, acres: 0.2083, sourceDoc: "Western UP Customary Settlement" },
  { state: "Himachal Pradesh", stateHi: "हिमाचल प्रदेश", variant: "Statutory Bigha (0.2 Acre = 10 Biswa)", variantHi: "वैधानिक बीघा (0.2 एकड़)", sqft: 8712, acres: 0.2, sourceDoc: "HP Land Revenue Act 1954" },
];

export default function ComparisonMode() {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);

  const maxSqft = Math.max(...VERIFIED_BIGHAS.map((b) => b.sqft));

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between rounded-2xl border-border/70 p-4 h-auto text-sm font-semibold hover:bg-secondary/40 shadow-xs"
        >
          <span className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span>{t("compareBigha", lang)}</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 animate-fade-in space-y-5 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {lang === "hi"
            ? "बीघा का आकार भारत के अलग-अलग राज्यों में ऐतिहासिक बंदोबस्त और स्थानीय लग्गी माप के कारण काफी भिन्न होता है:"
            : "The area of 1 Bigha varies dramatically across Indian states based on historical settlement systems:"}
        </p>

        {/* Detailed Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40">
                <th className="p-3 text-left font-bold uppercase tracking-wider text-muted-foreground">State &amp; Variant</th>
                <th className="p-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Sq Feet</th>
                <th className="p-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Acre</th>
                <th className="p-3 text-right font-bold uppercase tracking-wider text-muted-foreground">Guntha</th>
                <th className="p-3 text-left font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Legal Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {VERIFIED_BIGHAS.map((b, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-3 font-semibold text-foreground">
                    <div>{lang === "hi" ? b.stateHi : b.state}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">{lang === "hi" ? b.variantHi : b.variant}</div>
                  </td>
                  <td className="p-3 text-right tabular-nums font-bold text-foreground">
                    {formatIndianNumber(b.sqft)}
                  </td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">
                    {formatIndianNumber(b.acres, { maxDecimals: 4 })}
                  </td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">
                    {formatIndianNumber(b.sqft / 1089, { maxDecimals: 2 })}
                  </td>
                  <td className="p-3 text-muted-foreground text-[10px] hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{b.sourceDoc}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Bar Comparison */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {lang === "hi" ? "आपेक्षिक आकार तुलना ग्राफ" : "Relative Size Visualization (Max: 32,400 sq ft)"}
          </span>
          <div className="space-y-2">
            {VERIFIED_BIGHAS.slice(0, 8).map((b, i) => {
              const pct = (b.sqft / maxSqft) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {lang === "hi" ? b.stateHi : b.state} ({lang === "hi" ? b.variantHi : b.variant})
                    </span>
                    <span className="tabular-nums font-mono text-muted-foreground text-[11px]">
                      {formatIndianNumber(b.sqft)} sq ft
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-secondary/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
