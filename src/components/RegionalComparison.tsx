import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { formatIndianNumber } from "@/core/formatter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  Copy,
  ShieldCheck,
  Search,
  Filter,
  Check,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

export type UnitFamily = "bigha" | "kattha" | "biswa" | "guntha" | "kanal_marla" | "cent_ground";

export interface ComparisonEntry {
  id: string;
  family: UnitFamily;
  state: string;
  stateHi: string;
  variant: string;
  variantHi: string;
  sqFt: number;
  acres: number;
  sqM: number;
  confidence: "OFFICIAL_STANDARD" | "REGIONAL_STATUTORY" | "CUSTOMARY_UNOFFICIAL" | "WIDELY_USED_CUSTOMARY" | "LOCAL_VARIANT" | "HISTORICAL_CUSTOMARY";
  sourceDoc: string;
  geographicScope: string;
  notes?: string;
}

export const COMPARISON_DATA: ComparisonEntry[] = [
  // BIGHA FAMILY
  {
    id: "bigha_up_pucca",
    family: "bigha",
    state: "Uttar Pradesh",
    stateHi: "उत्तर प्रदेश",
    variant: "Pucca Bigha (55 yd × 55 yd)",
    variantHi: "पक्का बीघा (55 गज × 55 गज)",
    sqFt: 27225,
    acres: 27225 / 43560,
    sqM: 27225 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "UP Revenue Code, 2006",
    geographicScope: "Central, Eastern & Southern UP",
    notes: "Official cadastral standard (1 Bigha = 20 Biswa = 3,025 sq yd)",
  },
  {
    id: "bigha_br_6haath",
    family: "bigha",
    state: "Bihar (North)",
    stateHi: "उत्तर बिहार",
    variant: "Tirhut / 6.0-Haath Lagga",
    variantHi: "तिरहुत (6.0 हाथ लग्गी)",
    sqFt: 32400,
    acres: 32400 / 43560,
    sqM: 32400 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "Tirhut Settlement Records",
    geographicScope: "Darbhanga, Madhubani, Samastipur",
    notes: "Lagga = 9 ft; 1 Dhur = 81 sq ft; 1 Kattha = 1,620 sq ft",
  },
  {
    id: "bigha_br_std",
    family: "bigha",
    state: "Bihar (South/Central)",
    stateHi: "बिहार (मध्य/दक्षिण)",
    variant: "Standard 5.5-Haath Lagga",
    variantHi: "मानक 5.5 हाथ लग्गी",
    sqFt: 27225,
    acres: 27225 / 43560,
    sqM: 27225 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Bihar Tenancy Manual",
    geographicScope: "Patna, Gaya, Bhagalpur",
    notes: "Lagga = 8.25 ft; 1 Dhur = 68.0625 sq ft; 1 Kattha = 1,361.25 sq ft",
  },
  {
    id: "bigha_mh",
    family: "bigha",
    state: "Maharashtra",
    stateHi: "महाराष्ट्र",
    variant: "Customary Bigha (25 Guntha)",
    variantHi: "पारंपरिक बीघा (25 गुंठा)",
    sqFt: 27225,
    acres: 0.625,
    sqM: 27225 * 0.09290304,
    confidence: "CUSTOMARY_UNOFFICIAL",
    sourceDoc: "Maharashtra Land Revenue Code, 1966",
    geographicScope: "Western Maharashtra & Marathwada",
    notes: "Customary farming unit. Official revenue registry records Guntha / Hectare.",
  },
  {
    id: "bigha_rj_pucca",
    family: "bigha",
    state: "Rajasthan",
    stateHi: "राजस्थान",
    variant: "Pucca Bigha (165 ft × 165 ft)",
    variantHi: "पक्का बीघा (165 फीट × 165 फीट)",
    sqFt: 27225,
    acres: 0.625,
    sqM: 27225 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Rajasthan Tenancy Act, 1955",
    geographicScope: "Kota, Bikaner, Ganganagar canal colonies",
    notes: "Statutory surveyed standard = 3,025 sq yd = 20 Biswa",
  },
  {
    id: "bigha_mp_malwa",
    family: "bigha",
    state: "Madhya Pradesh",
    stateHi: "मध्य प्रदेश",
    variant: "Standard / Malwa Bigha",
    variantHi: "मानक / मालवा बीघा",
    sqFt: 27225,
    acres: 0.625,
    sqM: 27225 * 0.09290304,
    confidence: "WIDELY_USED_CUSTOMARY",
    sourceDoc: "Central India Customary Standard",
    geographicScope: "Indore, Ujjain, Bhopal, Jabalpur",
    notes: "Traditional benchmark = 3,025 sq yd = 27,225 sq ft (0.625 Acre). Computerized MP Bhulekh records use Metric Hectares.",
  },
  {
    id: "bigha_gj",
    family: "bigha",
    state: "Gujarat",
    stateHi: "गुजरात",
    variant: "Standard Vigha (16 Guntha)",
    variantHi: "मानक वीघा (16 गुंठा)",
    sqFt: 17424,
    acres: 0.4,
    sqM: 17424 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "AnyRoR Revenue Standard Gujarat",
    geographicScope: "Entire Gujarat state",
    notes: "1 Vigha = 16 Guntha = 17,424 sq ft = 1,936 sq yd (Exactly 2/5 Acre)",
  },
  {
    id: "bigha_rj_kaccha",
    family: "bigha",
    state: "Rajasthan (Eastern)",
    stateHi: "राजस्थान (पूर्वी)",
    variant: "Kaccha Bigha (1,936 sq yd)",
    variantHi: "कच्चा बीघा (1,936 वर्ग गज)",
    sqFt: 17424,
    acres: 0.4,
    sqM: 17424 * 0.09290304,
    confidence: "CUSTOMARY_UNOFFICIAL",
    sourceDoc: "Apna Khata Customary Survey Records",
    geographicScope: "Alwar, Bharatpur, Dausa",
    notes: "Customary agricultural bigha = 16 Guntha = 1,618.74 sq m",
  },
  {
    id: "bigha_wb",
    family: "bigha",
    state: "West Bengal",
    stateHi: "पश्चिम बंगाल",
    variant: "Statutory Bengal Bigha",
    variantHi: "वैधानिक बंगाल बीघा",
    sqFt: 14400,
    acres: 14400 / 43560,
    sqM: 14400 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "West Bengal Land Reforms Act, 1955",
    geographicScope: "Entire West Bengal state",
    notes: "120 ft × 120 ft = 1,600 sq yd = 20 Kattha = 40/121 Acre (~0.3306 Acre)",
  },
  {
    id: "bigha_as",
    family: "bigha",
    state: "Assam",
    stateHi: "असम",
    variant: "Assam Standard Bigha",
    variantHi: "असम मानक बीघा",
    sqFt: 14400,
    acres: 14400 / 43560,
    sqM: 14400 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Dharitree Assam Land Records Manual",
    geographicScope: "Brahmaputra Valley & Plains",
    notes: "1 Bigha = 5 Kattha = 100 Lessa = 14,400 sq ft (1 Kattha = 2,880 sq ft)",
  },
  {
    id: "bigha_mp_gwalior",
    family: "bigha",
    state: "Madhya Pradesh (North)",
    stateHi: "मध्य प्रदेश (ग्वालियर)",
    variant: "Gwalior / Chambal Bigha",
    variantHi: "ग्वालियर / चंबल बीघा",
    sqFt: 12000,
    acres: 12000 / 43560,
    sqM: 12000 * 0.09290304,
    confidence: "WIDELY_USED_CUSTOMARY",
    sourceDoc: "Gwalior State Customary Settlement",
    geographicScope: "Gwalior, Morena, Bhind, Shivpuri",
    notes: "1 Bigha = 20 Biswa = 12,000 sq ft (1 Biswa = 600 sq ft). Modern records use Metric Hectares.",
  },
  {
    id: "bigha_up_kaccha",
    family: "bigha",
    state: "Western UP",
    stateHi: "पश्चिमी उत्तर प्रदेश",
    variant: "Kaccha Bigha (1/3 Pucca)",
    variantHi: "कच्चा बीघा (1/3 पक्का)",
    sqFt: 9075,
    acres: 9075 / 43560,
    sqM: 9075 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "UP Board of Revenue Settlement Standard",
    geographicScope: "Meerut, Bulandshahr, Muzaffarnagar",
    notes: "1 Kaccha Bigha = 9,075 sq ft = 1,008.33 sq yd (1 Acre = 4.8 Kaccha Bigha)",
  },
  {
    id: "bigha_hp",
    family: "bigha",
    state: "Himachal Pradesh",
    stateHi: "हिमाचल प्रदेश",
    variant: "Hill Bigha (0.2 Acre)",
    variantHi: "पहाड़ी बीघा (0.2 एकड़)",
    sqFt: 8712,
    acres: 0.2,
    sqM: 8712 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "HP Land Revenue Act, 1954",
    geographicScope: "Shimla, Mandi, Solan, Kangra",
    notes: "Statutory standard = exactly 1/5 Acre (8,712 sq ft = 20 Biswa)",
  },

  // KATTHA / KATHA FAMILY
  {
    id: "kattha_as",
    family: "kattha",
    state: "Assam",
    stateHi: "असम",
    variant: "Assam Kattha (1/5 Bigha)",
    variantHi: "असम कट्ठा (1/5 बीघा)",
    sqFt: 2880,
    acres: 2880 / 43560,
    sqM: 2880 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Assam Land Records Manual",
    geographicScope: "Entire Assam state",
    notes: "Largest Kattha in India = 2,880 sq ft = 20 Lessa (1 Lessa = 144 sq ft)",
  },
  {
    id: "kattha_br_6haath",
    family: "kattha",
    state: "Bihar (North)",
    stateHi: "उत्तर बिहार",
    variant: "6.0-Haath Lagga Kattha",
    variantHi: "6.0 हाथ लग्गी कट्ठा",
    sqFt: 1620,
    acres: 1620 / 43560,
    sqM: 1620 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "Tirhut Settlement Records",
    geographicScope: "Mithila region",
    notes: "1/20 of 32,400 sq ft Bigha = 180 sq yd = 1,620 sq ft",
  },
  {
    id: "kattha_br_std",
    family: "kattha",
    state: "Bihar (Standard)",
    stateHi: "बिहार (मानक)",
    variant: "5.5-Haath Lagga Kattha",
    variantHi: "5.5 हाथ लग्गी कट्ठा",
    sqFt: 1361.25,
    acres: 1361.25 / 43560,
    sqM: 1361.25 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Bihar Tenancy Manual",
    geographicScope: "Central and South Bihar",
    notes: "1/20 of 27,225 sq ft Bigha = 20 Dhur = 1,361.25 sq ft",
  },
  {
    id: "kattha_up",
    family: "kattha",
    state: "Uttar Pradesh (East)",
    stateHi: "पूर्वी उत्तर प्रदेश",
    variant: "Eastern UP Kattha / Biswa",
    variantHi: "पूर्वी उप्र कट्ठा / बिस्वा",
    sqFt: 1361.25,
    acres: 1361.25 / 43560,
    sqM: 1361.25 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "UP Revenue Code, 2006",
    geographicScope: "Varanasi, Gorakhpur, Azamgarh",
    notes: "Locally called Kattha, identical to 1 Biswa Pucca",
  },
  {
    id: "kattha_wb",
    family: "kattha",
    state: "West Bengal",
    stateHi: "पश्चिम बंगाल",
    variant: "Bengal Standard Kattha (Cottah)",
    variantHi: "बंगाल मानक कट्ठा",
    sqFt: 720,
    acres: 720 / 43560,
    sqM: 720 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "West Bengal Land Reforms Act, 1955",
    geographicScope: "Kolkata & across West Bengal",
    notes: "1/20 of Bengal Bigha = 80 sq yd = 16 Chatak = 720 sq ft",
  },
  {
    id: "kattha_mp",
    family: "kattha",
    state: "Madhya Pradesh (North)",
    stateHi: "मध्य प्रदेश",
    variant: "Gwalior Kattha / Biswa",
    variantHi: "ग्वालियर कट्ठा",
    sqFt: 600,
    acres: 600 / 43560,
    sqM: 600 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "Gwalior Settlement Manual",
    geographicScope: "Chambal Division",
    notes: "1/20 of 12,000 sq ft Bigha = 600 sq ft",
  },

  // BISWA FAMILY
  {
    id: "biswa_up_pucca",
    family: "biswa",
    state: "Uttar Pradesh",
    stateHi: "उत्तर प्रदेश",
    variant: "Pucca Biswa",
    variantHi: "पक्का बिस्वा",
    sqFt: 1361.25,
    acres: 1361.25 / 43560,
    sqM: 1361.25 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "UP Revenue Code, 2006",
    geographicScope: "Standard throughout UP",
    notes: "1/20 of Pucca Bigha = 151.25 sq yd = 1,361.25 sq ft",
  },
  {
    id: "biswa_rj",
    family: "biswa",
    state: "Rajasthan",
    stateHi: "राजस्थान",
    variant: "Pucca Biswa",
    variantHi: "पक्का बिस्वा",
    sqFt: 1361.25,
    acres: 1361.25 / 43560,
    sqM: 1361.25 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Rajasthan Tenancy Act, 1955",
    geographicScope: "Statewide surveyed tracts",
    notes: "1/20 of 27,225 sq ft Bigha = 1,361.25 sq ft",
  },
  {
    id: "biswa_hp",
    family: "biswa",
    state: "Himachal Pradesh",
    stateHi: "हिमाचल प्रदेश",
    variant: "HP Hill Biswa",
    variantHi: "हिमाचल बिस्वा",
    sqFt: 435.6,
    acres: 435.6 / 43560,
    sqM: 435.6 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "HP Land Revenue Act, 1954",
    geographicScope: "Himachal Pradesh",
    notes: "1/20 of 8,712 sq ft Bigha = 435.6 sq ft (Exactly 1/100 Acre)",
  },
  {
    id: "biswa_up_kaccha",
    family: "biswa",
    state: "Western UP",
    stateHi: "पश्चिमी उप्र",
    variant: "Kaccha Biswa",
    variantHi: "कच्चा बिस्वा",
    sqFt: 453.75,
    acres: 453.75 / 43560,
    sqM: 453.75 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "UP Board of Revenue Records",
    geographicScope: "Western UP districts",
    notes: "1/20 of 9,075 sq ft Bigha = 453.75 sq ft",
  },

  // GUNTHA FAMILY
  {
    id: "guntha_mh",
    family: "guntha",
    state: "Maharashtra",
    stateHi: "महाराष्ट्र",
    variant: "Standard Guntha",
    variantHi: "मानक गुंठा",
    sqFt: 1089,
    acres: 1 / 40,
    sqM: 1089 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Maharashtra Land Revenue Code, 1966",
    geographicScope: "Entire Maharashtra state",
    notes: "33 ft × 33 ft = 121 sq yd = 1,089 sq ft (1 Acre = 40 Guntha)",
  },
  {
    id: "guntha_ka",
    family: "guntha",
    state: "Karnataka",
    stateHi: "कर्नाटक",
    variant: "Standard Guntha",
    variantHi: "मानक गुंठा",
    sqFt: 1089,
    acres: 1 / 40,
    sqM: 1089 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Karnataka Land Revenue Act, 1964",
    geographicScope: "Northern & Central Karnataka",
    notes: "1 Acre = 40 Guntha = 1,089 sq ft (Bhoomi portal standard)",
  },
  {
    id: "guntha_gj",
    family: "guntha",
    state: "Gujarat",
    stateHi: "गुजरात",
    variant: "Standard Guntha",
    variantHi: "मानक गुंठा",
    sqFt: 1089,
    acres: 1 / 40,
    sqM: 1089 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Gujarat Land Revenue Code",
    geographicScope: "Entire Gujarat state",
    notes: "1 Vigha = 16 Guntha; 1 Acre = 40 Guntha = 1,089 sq ft",
  },
  {
    id: "guntha_ts",
    family: "guntha",
    state: "Telangana & AP",
    stateHi: "तेलंगाना व आं.प्र.",
    variant: "Standard Guntha",
    variantHi: "मानक गुंठा",
    sqFt: 1089,
    acres: 1 / 40,
    sqM: 1089 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Telangana Dharani & AP Meebhoomi Standards",
    geographicScope: "Telangana and Rayalaseema",
    notes: "1 Acre = 40 Guntha = 121 sq yd = 1,089 sq ft",
  },

  // KANAL & MARLA FAMILY
  {
    id: "kanal_pb",
    family: "kanal_marla",
    state: "Punjab & Haryana",
    stateHi: "पंजाब व हरियाणा",
    variant: "Standard Revenue Kanal (20 Marla)",
    variantHi: "मानक कनाal (20 मरला)",
    sqFt: 5445,
    acres: 5445 / 43560,
    sqM: 5445 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Punjab Land Revenue Act, 1887",
    geographicScope: "Punjab, Haryana & Chandigarh",
    notes: "1 Acre (Killa) = 8 Kanal = 5,445 sq ft (605 sq yd)",
  },
  {
    id: "marla_pb",
    family: "kanal_marla",
    state: "Punjab & Haryana",
    stateHi: "पंजाब व हरियाणा",
    variant: "Standard Revenue Marla (9 Sarsahi)",
    variantHi: "मानक मरला (9 सरसाही)",
    sqFt: 272.25,
    acres: 272.25 / 43560,
    sqM: 272.25 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Jamabandi Cadastral Standard",
    geographicScope: "Punjab & Haryana",
    notes: "Karam = 66 inches; 1 Marla = 9 sq karams = 30.25 sq yd = 272.25 sq ft",
  },
  {
    id: "kanal_hp",
    family: "kanal_marla",
    state: "Himachal Pradesh",
    stateHi: "हिमाचल प्रदेश",
    variant: "Kangra / Una Kanal",
    variantHi: "कांगड़ा कनाल",
    sqFt: 5445,
    acres: 0.125,
    sqM: 5445 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "HP Land Records Manual (Plains Division)",
    geographicScope: "Kangra, Una, Hamirpur",
    notes: "Plains tehsils bordering Punjab follow the 5,445 sq ft standard",
  },

  // CENT & GROUND FAMILY
  {
    id: "ground_tn",
    family: "cent_ground",
    state: "Tamil Nadu",
    stateHi: "तमिलनाडु",
    variant: "Standard Ground (Chennai Layouts)",
    variantHi: "मानक ग्राउंड (चेन्नई लेआउट)",
    sqFt: 2400,
    acres: 2400 / 43560,
    sqM: 2400 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Tamil Nadu Directorate of Survey and Land Records",
    geographicScope: "Chennai and urban municipal corporations",
    notes: "1 Ground = 2,400 sq ft = 222.96 sq m ≈ 5.5096 Cents",
  },
  {
    id: "cent_tn",
    family: "cent_ground",
    state: "Tamil Nadu & Kerala",
    stateHi: "तमिलनाडु व केरल",
    variant: "Standard Cent / Decimal",
    variantHi: "मानक सेंट / डेसिमल",
    sqFt: 435.6,
    acres: 0.01,
    sqM: 435.6 * 0.09290304,
    confidence: "OFFICIAL_STANDARD",
    sourceDoc: "Survey and Settlement Departments TN & Kerala",
    geographicScope: "Across South India",
    notes: "1 Cent = 1/100 Acre = 435.6 sq ft = 40.4686 sq m",
  },
  {
    id: "ankanam_ap",
    family: "cent_ground",
    state: "Andhra Pradesh",
    stateHi: "आंध्र प्रदेश",
    variant: "Ankanam (Nellore / Tirupati)",
    variantHi: "अंकणम (नेल्लोर)",
    sqFt: 72,
    acres: 72 / 43560,
    sqM: 72 * 0.09290304,
    confidence: "REGIONAL_STATUTORY",
    sourceDoc: "AP Registration & Stamps Department",
    geographicScope: "Nellore, Chittoor, Tirupati",
    notes: "1 Ankanam = 72 sq ft = 8 sq yd (1 Cent = 6.05 Ankanam)",
  },
];

export default function RegionalComparison() {
  const { lang } = useApp();
  const { toast } = useToast();

  const [selectedFamily, setSelectedFamily] = useState<UnitFamily>("bigha");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEntries = useMemo(() => {
    let list = COMPARISON_DATA.filter((e) => e.family === selectedFamily);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.state.toLowerCase().includes(q) ||
          e.variant.toLowerCase().includes(q) ||
          e.sourceDoc.toLowerCase().includes(q) ||
          e.geographicScope.toLowerCase().includes(q)
      );
    }
    // Sort descending by sqFt
    return list.sort((a, b) => b.sqFt - a.sqFt);
  }, [selectedFamily, searchQuery]);

  const maxSqFt = useMemo(() => {
    if (filteredEntries.length === 0) return 1;
    return Math.max(...filteredEntries.map((e) => e.sqFt));
  }, [filteredEntries]);

  const handleCopyTable = () => {
    const header = "State\tVariant\tSq Feet\tSq Metres\tAcre\tLegal Reference\tGeographic Scope";
    const rows = filteredEntries.map((e) =>
      `${e.state}\t${e.variant}\t${e.sqFt}\t${e.sqM.toFixed(2)}\t${e.acres.toFixed(4)}\t${e.sourceDoc}\t${e.geographicScope}`
    );
    const tsv = [header, ...rows].join("\n");

    navigator.clipboard.writeText(tsv).then(() => {
      toast({
        title: lang === "hi" ? "तालिका कॉपी हो गई!" : "Comparison Table Copied!",
        description: lang === "hi" ? "तुलना डेटा टीएसवी/एक्सेल प्रारूप में कॉपी किया गया।" : "Comparison data copied in TSV format ready for Excel/Sheets.",
      });
    });
  };

  return (
    <section
      aria-labelledby="comparison-heading"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 id="comparison-heading" className="text-base sm:text-lg font-bold text-foreground">
              {lang === "hi" ? "राज्य-वार इकाई तुलना मैट्रिक्स" : "Regional Unit Comparison Matrix"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "hi"
                ? "राज्यों में बीघा, कट्ठा, बिस्वा, गुंठा के भिन्न-भिन्न आकारों की आधिकारिक वैधानिक तुलना"
                : "Side-by-side comparison of customary and statutory regional variants with legal references"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyTable}
          className="self-start sm:self-auto text-xs gap-1.5 rounded-xl h-8 px-3"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>{lang === "hi" ? "तालिका कॉपी करें" : "Copy Data"}</span>
        </Button>
      </div>

      {/* Family Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSelectedFamily("bigha")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            selectedFamily === "bigha"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Bigha (13 Variants)
        </button>
        <button
          type="button"
          onClick={() => setSelectedFamily("kattha")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            selectedFamily === "kattha"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Kattha / Katha (6 Variants)
        </button>
        <button
          type="button"
          onClick={() => setSelectedFamily("biswa")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            selectedFamily === "biswa"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Biswa (4 Variants)
        </button>
        <button
          type="button"
          onClick={() => setSelectedFamily("guntha")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            selectedFamily === "guntha"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Guntha (4 States)
        </button>
        <button
          type="button"
          onClick={() => setSelectedFamily("kanal_marla")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            selectedFamily === "kanal_marla"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Kanal &amp; Marla
        </button>
        <button
          type="button"
          onClick={() => setSelectedFamily("cent_ground")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            selectedFamily === "cent_ground"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Ground &amp; Cent (South)
        </button>
      </div>

      {/* Filter Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by state, variant or act..."
          className="h-9 pl-9 rounded-xl text-xs"
        />
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-2.5 px-3">State &amp; Variant</th>
              <th className="py-2.5 px-3 text-right">Sq Feet</th>
              <th className="py-2.5 px-3 text-right">Sq Metres</th>
              <th className="py-2.5 px-3 text-right">Acre Eq.</th>
              <th className="py-2.5 px-3">Relative Visual Scale</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Statutory Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filteredEntries.map((e) => {
              const percentage = Math.round((e.sqFt / maxSqFt) * 100);
              return (
                <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-foreground text-sm">
                      {lang === "hi" ? e.stateHi : e.state}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {lang === "hi" ? e.variantHi : e.variant}
                    </div>
                    <div className="text-[10px] text-muted-foreground/80 italic">
                      {e.geographicScope}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground text-sm whitespace-nowrap">
                    {formatIndianNumber(e.sqFt)}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatIndianNumber(e.sqM, { maxDecimals: 1 })}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatIndianNumber(e.acres, { maxDecimals: 4 })}
                  </td>

                  {/* Relative Visual Scale Bar */}
                  <td className="py-2.5 px-3 min-w-[130px]">
                    <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden mb-1">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {percentage}% of max
                    </span>
                  </td>

                  {/* Legal Provenance & Classification */}
                  <td className="py-2.5 px-3 hidden md:table-cell max-w-[220px]">
                    <div className="flex items-center gap-1.5 font-medium text-[11px] text-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{e.sourceDoc}</span>
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                        e.confidence === "OFFICIAL_STANDARD"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : e.confidence === "REGIONAL_STATUTORY"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {e.confidence.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disclaimers & Notes */}
      <div className="flex items-start gap-2 rounded-xl bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p>
          <strong>Cadastral Disparity Notice:</strong> Units like Bigha and Kattha were historically defined by regional bamboo rods (Gattha/Lagga) which varied from 5.5 to 6.5 cubits (haath). While modern land registration in computerized Bhulekh and Jamabandi portals standardizes records in Hectares and Square Metres, local property deeds frequently cite these traditional factors.
        </p>
      </div>
    </section>
  );
}

