import { useApp } from "@/context/AppContext";
import { t } from "@/data/translations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ShieldCheck } from "lucide-react";

const REFS = [
  {
    title: "Standard & Metric (All India)",
    titleHi: "मानक और मीट्रिक (अखिल भारतीय)",
    items: [
      "1 Acre = 43,560 sq ft = 4,840 sq yd = 4,046.86 sq meters",
      "1 Hectare = 10,000 sq meters = 2.47105 Acres = 1,07,639 sq ft",
      "1 Are (1 R) = 100 sq meters = 1,076.39 sq ft",
      "1 Square Yard (Gaj) = 9 sq ft = 0.8361 sq meters",
      "1 Decimal / Cent / Dismil = 1/100 Acre = 435.6 sq ft",
    ],
  },
  {
    title: "Maharashtra & Western India",
    titleHi: "महाराष्ट्र और पश्चिमी भारत",
    items: [
      "1 Guntha = 1,089 sq ft (33 ft × 33 ft = 121 sq yd)",
      "40 Guntha = 1 Acre (43,560 sq ft)",
      "1 Bigha (MH Customary) = 25 Guntha = 27,225 sq ft",
      "Satbara 7/12 records use Hectare-Are (1 Are = 1 R = 100 sq m ≈ 0.988 Guntha)",
    ],
  },
  {
    title: "Uttar Pradesh & Delhi",
    titleHi: "उत्तर प्रदेश और दिल्ली",
    items: [
      "1 Pucca Bigha = 20 Biswa = 3,025 sq yd = 27,225 sq ft (5/8 Acre)",
      "1 Biswa (Pucca) = 20 Biswansi = 151.25 sq yd = 1,361.25 sq ft",
      "1 Biswansi = 68.0625 sq ft (1 square Gunter's Gatha of 99 inches)",
      "1 Kaccha Bigha (Western UP) = 1/3 Pucca Bigha = 9,075 sq ft = 1,008.33 sq yd",
    ],
  },
  {
    title: "Bihar & Jharkhand",
    titleHi: "बिहार और झारखंड",
    items: [
      "1 Bigha (Standard 5.5-haath lagga) = 20 Kattha = 27,225 sq ft",
      "1 Kattha (Standard) = 20 Dhur = 1,361.25 sq ft",
      "1 Dhur (Standard) = 68.0625 sq ft (8.25 ft × 8.25 ft pole)",
      "1 Bigha (North Bihar 6-haath lagga) = 20 Kattha = 32,400 sq ft",
      "1 Kattha (North Bihar) = 1,620 sq ft (1 Dhur = 81 sq ft)",
    ],
  },
  {
    title: "West Bengal & Assam",
    titleHi: "पश्चिम बंगाल और असम",
    items: [
      "1 Bigha (WB) = 20 Kattha = 14,400 sq ft (1/3 Acre = 1,600 sq yd)",
      "1 Kattha (WB / Cottah) = 16 Chatak = 720 sq ft = 80 sq yd",
      "1 Chatak (WB) = 45 sq ft (5 sq yd = 1/16 Kattha)",
      "1 Bigha (Assam) = 5 Kattha = 100 Lecha = 14,400 sq ft",
      "1 Kattha (Assam) = 20 Lecha = 2,880 sq ft",
      "1 Lecha (Assam) = 144 sq ft (16 sq yd)",
    ],
  },
  {
    title: "Punjab & Haryana",
    titleHi: "पंजाब और हरियाणा",
    items: [
      "1 Killa / Ghumaon = 1 Acre = 8 Kanal = 160 Marla = 43,560 sq ft",
      "1 Kanal = 20 Marla = 605 sq yd = 5,445 sq ft",
      "1 Marla = 9 Sarsahi = 30.25 sq yd = 272.25 sq ft",
      "1 Sarsahi = 1 sq karam (5.5 ft × 5.5 ft) = 30.25 sq ft",
    ],
  },
  {
    title: "South India (Tamil Nadu, Karnataka, AP, Kerala)",
    titleHi: "दक्षिण भारत",
    items: [
      "100 Cent = 1 Acre (1 Cent = 435.6 sq ft = 48.4 sq yd)",
      "1 Ground (Tamil Nadu / Chennai) = 2,400 sq ft (266.67 sq yd)",
      "1 Guntha (Karnataka) = 1,089 sq ft (40 Guntha = 1 Acre)",
      "1 Ankanam (AP / Telangana) = 72 sq ft (8 sq yd)",
      "1 Kuncham (AP) = 10 Cents = 4,356 sq ft",
    ],
  },
];

export default function QuickReference() {
  const { lang } = useApp();

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground">{t("quickRef", lang)}</h3>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {REFS.map((ref, i) => (
          <AccordionItem
            key={i}
            value={`ref-${i}`}
            className="rounded-xl border border-border/60 bg-secondary/20 px-3.5 transition-colors"
          >
            <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>{lang === "hi" ? ref.titleHi : ref.title}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5 pb-2 pt-1 font-mono text-xs text-muted-foreground">
                {ref.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-primary font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
