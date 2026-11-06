import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  loadHistory,
  deleteHistoryItem,
  toggleFavorite,
  clearHistory,
  downloadHistoryCsv,
  getUnit,
  type ConversionHistoryItem,
} from "@/core";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  History,
  Star,
  Trash2,
  Download,
  Printer,
  RotateCcw,
  Search,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

interface ConversionHistoryProps {
  onLoadConversion?: (item: ConversionHistoryItem) => void;
}

export default function ConversionHistory({ onLoadConversion }: ConversionHistoryProps) {
  const { lang, setConversionState } = useApp();
  const { toast } = useToast();

  const [historyItems, setHistoryItems] = useState<ConversionHistoryItem[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load history safely on client mount
  useEffect(() => {
    setHistoryItems(loadHistory());
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      if (showFavoritesOnly && !item.isFavorite) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUnit =
          item.fromUnitName.toLowerCase().includes(q) ||
          item.toUnitName.toLowerCase().includes(q) ||
          item.stateName.toLowerCase().includes(q);
        const matchesVal =
          String(item.fromValue).includes(q) || String(item.toValue).includes(q);
        if (!matchesUnit && !matchesVal) return false;
      }
      return true;
    });
  }, [historyItems, showFavoritesOnly, searchQuery]);

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    setHistoryItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
    toast({
      title: lang === "hi" ? "इतिहास हटाया गया" : "Record Removed",
      description: lang === "hi" ? "गणना सूची से हटा दी गई है" : "Conversion calculation removed from history",
    });
  };

  const handleClearAll = () => {
    if (window.confirm(lang === "hi" ? "क्या आप पूरा इतिहास मिटाना चाहते हैं?" : "Clear all conversion history?")) {
      const updated = clearHistory(false);
      setHistoryItems(updated);
      toast({
        title: lang === "hi" ? "इतिहास साफ किया गया" : "History Cleared",
        description: lang === "hi" ? "सभी प्रविष्टियां हटा दी गई हैं" : "All history records have been cleared",
      });
    }
  };

  const handleExportCsv = () => {
    if (historyItems.length === 0) {
      toast({
        title: lang === "hi" ? "कोई डेटा नहीं" : "No Data",
        description: lang === "hi" ? "निर्यात के लिए कोई इतिहास नहीं है" : "No conversion history to export",
        variant: "destructive",
      });
      return;
    }
    const success = downloadHistoryCsv(filteredItems.length > 0 ? filteredItems : historyItems);
    if (success) {
      toast({
        title: lang === "hi" ? "CSV डाउनलोड शुरू" : "CSV Exported",
        description: lang === "hi" ? "रूपांतरण इतिहास फ़ाइल सहेजी गई" : "Conversion history CSV downloaded successfully",
      });
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleReRun = (item: ConversionHistoryItem) => {
    // Check if both units exist in canonical registry or active custom presets
    const resolvedFrom = getUnit(item.fromUnitId);
    const resolvedTo = getUnit(item.toUnitId);

    // Case 1: Both source and target exist
    if (resolvedFrom && resolvedTo) {
      setConversionState({
        value: String(item.fromValue),
        fromUnitId: item.fromUnitId,
        toUnitId: item.toUnitId,
        regionCode: item.stateCode || undefined,
      });
      if (onLoadConversion) {
        onLoadConversion(item);
      }
      toast({
        title: lang === "hi" ? "गणना लोड की गई" : "Conversion Loaded",
        description: `${item.fromValue} ${item.fromUnitName} → ${item.toUnitName}`,
      });
      return;
    }

    // Case 2: Target unit was deleted (e.g. custom target removed)
    if (resolvedFrom && !resolvedTo) {
      const fallbackTarget = resolvedFrom.id === "sqft" ? "acre" : "sqft";
      setConversionState({
        value: String(item.fromValue),
        fromUnitId: resolvedFrom.id,
        toUnitId: fallbackTarget,
        regionCode: item.stateCode || undefined,
      });
      toast({
        title: lang === "hi" ? "कस्टम लक्ष्य इकाई उपलब्ध नहीं" : "Custom Target Unit Removed",
        description:
          lang === "hi"
            ? `लक्ष्य इकाई '${item.toUnitName}' हटा दी गई है। ${item.fromValue} ${resolvedFrom.name} को ${fallbackTarget} में लोड किया गया। सहेजा गया परिणाम: ${item.formattedResult} ${item.toUnitName}`
            : `Custom target '${item.toUnitName}' was deleted. Loaded ${item.fromValue} ${resolvedFrom.name} into ${fallbackTarget}. Saved result was ${item.formattedResult} ${item.toUnitName}.`,
        variant: "destructive",
      });
      return;
    }

    // Case 3: Source unit was deleted, but target unit exists
    if (!resolvedFrom && resolvedTo) {
      const fromSqFt = item.fromUnitSqFtSnapshot || 1;
      const totalSqFt = item.fromValue * fromSqFt;
      setConversionState({
        value: String(totalSqFt),
        fromUnitId: "sqft",
        toUnitId: resolvedTo.id,
        regionCode: item.stateCode || undefined,
      });
      toast({
        title: lang === "hi" ? "कस्टम स्रोत इकाई उपलब्ध नहीं" : "Custom Source Unit Removed",
        description:
          lang === "hi"
            ? `कस्टम स्रोत इकाई '${item.fromUnitName}' हटा दी गई है। ${totalSqFt.toLocaleString("en-IN")} वर्ग फीट लोड किया गया।`
            : `Custom unit '${item.fromUnitName}' was deleted. Loaded ${totalSqFt.toLocaleString("en-IN")} sq ft equivalent into ${resolvedTo.name}.`,
      });
      return;
    }

    // Case 4: Both source and target were deleted
    if (!resolvedFrom && !resolvedTo) {
      const fromSqFt = item.fromUnitSqFtSnapshot || 1;
      const totalSqFt = item.fromValue * fromSqFt;
      setConversionState({
        value: String(totalSqFt),
        fromUnitId: "sqft",
        toUnitId: "acre",
        regionCode: item.stateCode || undefined,
      });
      toast({
        title: lang === "hi" ? "कस्टम इकाइयाँ उपलब्ध नहीं" : "Custom Units Unavailable",
        description:
          lang === "hi"
            ? `मूल इकाइयाँ '${item.fromUnitName}' और '${item.toUnitName}' हटा दी गई हैं। ${totalSqFt.toLocaleString("en-IN")} वर्ग फीट लोड किया गया। मूल परिणाम: ${item.formattedResult}`
            : `Custom units '${item.fromUnitName}' and '${item.toUnitName}' were deleted. Loaded ${totalSqFt.toLocaleString("en-IN")} sq ft into Acre. Stored result: ${item.formattedResult}.`,
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <section
      aria-label="Conversion History and Export"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {lang === "hi" ? "रूपांतरण इतिहास एवं निर्यात" : "Conversion History & Export"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === "hi"
              ? "ब्राउज़र में स्थानीय रूप से सहेजी गई गणनाएं, CSV डाउनलोड और प्रिंट मेमो"
              : "Client-side private calculation history, spreadsheet export & printable memo"}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={historyItems.length === 0}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === "hi" ? "CSV निर्यात" : "Export CSV"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={historyItems.length === 0}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Printer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang === "hi" ? "प्रिंट मेमो" : "Print Memo"}</span>
          </Button>

          {historyItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "साफ करें" : "Clear"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      {historyItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "hi" ? "इकाई या मान खोजें..." : "Filter by unit, value or state..."}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showFavoritesOnly
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  showFavoritesOnly ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                }`}
              />
              <span>{lang === "hi" ? "पसंदीदा केवल" : "Favorites Only"}</span>
            </button>
            <span className="text-xs text-muted-foreground">
              {filteredItems.length} {lang === "hi" ? "प्रविष्टियां" : "records"}
            </span>
          </div>
        </div>
      )}

      {/* History Items List / Table */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-2">
          <History className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-foreground">
            {lang === "hi" ? "कोई इतिहास रिकॉर्ड नहीं" : "No conversion history recorded"}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {lang === "hi"
              ? "जब आप परिवर्तक का उपयोग करेंगे, तो आपकी गणनाएं स्वचालित रूप से यहाँ सुरक्षित रहेंगी।"
              : "As you perform land area conversions, your calculation history will appear here for instant reference and CSV export."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-all text-sm group"
            >
              {/* Left Column: Values & Units */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {item.fromValue} {item.fromUnitName}
                  </span>
                  <span className="text-muted-foreground text-xs">→</span>
                  <span className="font-bold text-primary">
                    {item.formattedResult} {item.toUnitName}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {item.stateName}
                  </span>
                  {item.isCustomUnit && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                      {lang === "hi" ? "कस्टम इकाई" : "Custom Factor"}
                    </span>
                  )}
                  {item.snapshotProvenance === "VERIFIED_SNAPSHOT" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" title="Factor verified at time of calculation">
                      Snapshot
                    </span>
                  )}
                  {item.snapshotProvenance === "RECOVERED_FROM_STORED_RESULT" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20" title="Factor mathematically recovered from stored calculation result">
                      Recovered
                    </span>
                  )}
                  {item.snapshotProvenance === "INFERRED_FROM_CURRENT_DEFINITION" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20" title="Factor inferred from current unit definition">
                      Inferred
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <span>{item.formula}</span>
                  <span className="text-[10px] text-muted-foreground/60">•</span>
                  <span className="text-[11px] text-muted-foreground/80">
                    {new Date(item.timestamp).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(item.id)}
                  title={item.isFavorite ? "Remove favorite" : "Mark as favorite"}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                >
                  <Star
                    className={`h-4 w-4 ${
                      item.isFavorite
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground hover:text-amber-500"
                    }`}
                  />
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReRun(item)}
                  title={lang === "hi" ? "पुनः लोड करें" : "Re-run calculation"}
                  className="h-7 text-xs gap-1 px-2.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{lang === "hi" ? "लोड करें" : "Load"}</span>
                </Button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete record"
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Memo View (Visible only during @media print) */}
      <div className="printable-memo hidden print:block space-y-4">
        <div className="border-b-2 border-black pb-3">
          <h1 className="text-xl font-bold">Bharat Land Measurement Calculation Memo</h1>
          <p className="text-xs text-gray-600">
            Source: https://land.ladestack.in | Generated on: {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="py-1">From</th>
              <th className="py-1">To</th>
              <th className="py-1">Result</th>
              <th className="py-1">State Context</th>
              <th className="py-1">Derivation Formula</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-1">{item.fromValue} {item.fromUnitName}</td>
                <td className="py-1">{item.toUnitName}</td>
                <td className="py-1 font-bold">{item.formattedResult}</td>
                <td className="py-1">{item.stateName}</td>
                <td className="py-1 font-mono">{item.formula}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-[10pt] text-gray-700 pt-3 border-t border-gray-400">
          <p>
            <strong>Statutory Notice:</strong> This document is an informational conversion memo generated by Bharat Land Converter (https://land.ladestack.in). It does not constitute a certified cadastral map, official revenue extract, or legally binding survey document. For statutory registration under Indian Registration Act 1908, verify all regional unit dimensions with the relevant Tahsildar / Taluk revenue surveyor.
          </p>
        </div>
      </div>

      {/* Cadastral Print / Legal Notice */}
      <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-3 flex items-start gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <span>
          {lang === "hi"
            ? "सूचना: यह गणना इतिहास आपके उपकरण पर स्थानीय रूप से सुरक्षित रहता है। विधिक विलेख हेतु स्थानीय राजस्व पटवारी रिकॉर्ड से सत्यापन आवश्यक है।"
            : "Notice: Conversion records are stored in browser local storage. For statutory land registration, verify all regional unit factors with the relevant Tehsil Revenue Authority."}
        </span>
      </div>
    </section>
  );
}

