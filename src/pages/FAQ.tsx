import { useState } from "react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle } from "lucide-react";

interface FAQ {
  category: string;
  categoryHi: string;
  items: { q: string; qHi: string; a: string; aHi: string }[];
}

const FAQS: FAQ[] = [
  {
    category: "General",
    categoryHi: "सामान्य",
    items: [
      {
        q: "What is Bharat Land Converter?",
        qHi: "भारत भूमि कन्वर्टर क्या है?",
        a: "Bharat Land Converter is a free online tool that converts between 35+ Indian land area measurement units across 16+ states. It helps farmers, real estate agents, lawyers, and students quickly convert units like Bigha, Guntha, Acre, Hectare, Kanal, Marla, Cent, and many others.",
        aHi: "भारत भूमि कन्वर्टर एक मुफ़्त ऑनलाइन टूल है जो 16+ राज्यों में 35+ भारतीय भूमि क्षेत्र माप इकाइयों के बीच रूपांतरण करता है। यह किसानों, रियल एस्टेट एजेंटों, वकीलों और छात्रों को बीघा, गुंठा, एकड़, हेक्टेयर, कनाल, मरला, सेंट और कई अन्य इकाइयों को जल्दी से कन्वर्ट करने में मदद करता है।",
      },
      {
        q: "Is this tool really free?",
        qHi: "क्या यह टूल वास्तव में मुफ़्त है?",
        a: "Yes! Bharat Land Converter is 100% free forever. No login required, no advertisements, no hidden charges. We believe land conversion is a basic need for millions of Indians and should be accessible to everyone.",
        aHi: "हाँ! भारत भूमि कन्वर्टर हमेशा के लिए 100% मुफ़्त है। कोई लॉगिन आवश्यक नहीं, कोई विज्ञापन नहीं, कोई छिपी हुई शुल्क नहीं। हम मानते हैं कि भूमि रूपांतरण लाखों भारतीयों के लिए एक बुनियादी जरूरत है और सभी के लिए सुलभ होना चाहिए।",
      },
      {
        q: "Do I need to create an account?",
        qHi: "क्या मुझे खाता बनाने की आवश्यकता है?",
        a: "No account or login is required. You can use all features immediately without any registration. Your privacy is our priority.",
        aHi: "कोई खाता या लॉगिन आवश्यक नहीं है। आप बिना किसी पंजीकरण के तुरंत सभी सुविधाओं का उपयोग कर सकते हैं। आपकी गोपनीयता हमारी प्राथमिकता है।",
      },
      {
        q: "Does it work offline?",
        qHi: "क्या यह ऑफ़लाइन काम करता है?",
        a: "Yes! After the first load, the entire application works offline. No internet connection is needed for conversions. You can even install it as a Progressive Web App (PWA) for easier offline access.",
        aHi: "हाँ! पहले लोड के बाद, पूरा एप्लिकेशन ऑफ़लाइन काम करता है। रूपांतरण के लिए इंटरनेट कनेक्शन की आवश्यकता नहीं है। आप आसान ऑफ़लाइन एक्सेस के लिए इसे प्रोग्रेसिव वेब ऐप (PWA) के रूप में भी इंस्टॉल कर सकते हैं।",
      },
    ],
  },
  {
    category: "Units & Conversions",
    categoryHi: "इकाइयाँ और रूपांतरण",
    items: [
      {
        q: "How many square feet in 1 Guntha?",
        qHi: "1 गुंठे में कितने वर्ग फीट होते हैं?",
        a: "1 Guntha equals 1,089 square feet (33 ft × 33 ft). This is the standard measurement used in Maharashtra and Karnataka. 40 Guntha equals 1 Acre.",
        aHi: "1 गुंठा 1,089 वर्ग फीट (33 फीट × 33 फीट) के बराबर होता है। यह महाराष्ट्र और कर्नाटक में उपयोग किया जाने वाला मानक माप है। 40 गुंठा 1 एकड़ के बराबर होता है।",
      },
      {
        q: "Why does Bigha have different values?",
        qHi: "बीघा के अलग-अलग मान क्यों हैं?",
        a: "Bigha varies significantly across Indian states. For example: UP Bigha = 27,000 sq ft, Bihar Bigha = 27,220 sq ft, West Bengal Bigha = 14,400 sq ft, MP Bigha = 12,000 sq ft, Maharashtra Bigha = 27,225 sq ft. This variation is due to historical and regional measurement systems.",
        aHi: "बीघा भारतीय राज्यों में काफी भिन्न होता है। उदाहरण के लिए: UP बीघा = 27,000 वर्ग फीट, बिहार बीघा = 27,220 वर्ग फीट, पश्चिम बंगाल बीघा = 14,400 वर्ग फीट, MP बीघा = 12,000 वर्ग फीट, महाराष्ट्र बीघा = 27,225 वर्ग फीट। यह भिन्नता ऐतिहासिक और क्षेत्रीय माप प्रणालियों के कारण है।",
      },
      {
        q: "How many Guntha in 1 Acre?",
        qHi: "1 एकड़ में कितने गुंठे होते हैं?",
        a: "1 Acre equals exactly 40 Guntha. 1 Acre = 43,560 square feet = 4,840 square yards = 0.4047 hectare.",
        aHi: "1 एकड़ बिल्कुल 40 गुंठे के बराबर होता है। 1 एकड़ = 43,560 वर्ग फीट = 4,840 वर्ग गज = 0.4047 हेक्टेयर।",
      },
      {
        q: "What is the difference between Pucca and Kaccha Bigha?",
        qHi: "पक्का और कच्चा बीघा में क्या अंतर है?",
        a: "In Rajasthan, Pucca Bigha = 27,225 sq ft (larger), while Kaccha Bigha = 17,424 sq ft (smaller). Pucca is used for agricultural land, while Kaccha is often used for residential plots. Always confirm which standard is being used in your transaction.",
        aHi: "राजस्थान में, पक्का बीघा = 27,225 वर्ग फीट (बड़ा), जबकि कच्चा बीघा = 17,424 वर्ग फीट (छोटा)। पक्का का उपयोग कृषि भूमि के लिए किया जाता है, जबकि कच्चा अक्सर आवासीय प्लॉट के लिए उपयोग किया जाता है। अपने लेनदेन में किस मानक का उपयोग किया जा रहा है, यह हमेशा पुष्टि करें।",
      },
      {
        q: "What is Kanal and where is it used?",
        qHi: "कनाल क्या है और यह कहाँ उपयोग किया जाता है?",
        a: "Kanal is a land measurement unit used in Punjab, Haryana, Himachal Pradesh, and Uttarakhand. 1 Kanal = 5,445 sq ft = 20 Marla. 8 Kanal = 1 Acre (also called Killa or Ghumaon).",
        aHi: "कनाल पंजाब, हरियाणा, हिमाचल प्रदेश और उत्तराखंड में उपयोग की जाने वाली भूमि माप इकाई है। 1 कनाल = 5,445 वर्ग फीट = 20 मरला। 8 कनाल = 1 एकड़ (इसे किल्ला या घुमाओं भी कहते हैं)।",
      },
      {
        q: "What is Cent and where is it used?",
        qHi: "सेंट क्या है और यह कहाँ उपयोग किया जाता है?",
        a: "Cent (also called Decimal) is used in South Indian states like Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, and Telangana. 1 Cent = 435.6 sq ft. 100 Cent = 1 Acre.",
        aHi: "सेंट (जिसे डेसिमल भी कहते हैं) का उपयोग तमिलनाडु, केरल, कर्नाटक, आंध्र प्रदेश और तेलंगाना जैसे दक्षिण भारतीय राज्यों में किया जाता है। 1 सेंट = 435.6 वर्ग फीट। 100 सेंट = 1 एकड़।",
      },
    ],
  },
  {
    category: "Features",
    categoryHi: "सुविधाएँ",
    items: [
      {
        q: "How do I save land parcels?",
        qHi: "मैं भूमि के टुकड़ों को कैसे सहेजूं?",
        a: "Use the 'My Land List' section. Enter a name for your land (e.g., 'Shetkari Plot - Pune'), then click Save. You can save up to 3 parcels for free. The data is stored in your browser's localStorage.",
        aHi: "'मेरी भूमि सूची' अनुभाग का उपयोग करें। अपनी भूमि के लिए एक नाम दर्ज करें (जैसे, 'शेतकारी प्लॉट - पुणे'), फिर सहेजें पर क्लिक करें। आप मुफ़्त में 3 पार्सल तक सहेज सकते हैं। डेटा आपके ब्राउज़र के localStorage में संग्रहीत होता है।",
      },
      {
        q: "How do I share conversion results?",
        qHi: "मैं रूपांतरण परिणाम कैसे साझा करूं?",
        a: "Click the 'Share Link' button to copy a URL with your conversion values, or use 'WhatsApp Share' to send a formatted message directly to WhatsApp. The message includes the top 6 conversions.",
        aHi: "अपने रूपांतरण मानों के साथ URL कॉपी करने के लिए 'लिंक शेयर करें' बटन पर क्लिक करें, या व्हाट्सएप पर सीधे स्वरूपित संदेश भेजने के लिए 'व्हाट्सएप शेयर करें' का उपयोग करें। संदेश में शीर्ष 6 रूपांतरण शामिल हैं।",
      },
      {
        q: "Can I calculate land value?",
        qHi: "क्या मैं भूमि मूल्य की गणना कर सकता हूं?",
        a: "Yes! Use the 'Land Rate Calculator' section. Enter the rate per unit (e.g., ₹5000 per sq ft), and the tool will calculate the total land value in Indian Rupees with Lakh/Crore formatting.",
        aHi: "हाँ! 'भूमि दर कैलकुलेटर' अनुभाग का उपयोग करें। प्रति इकाई दर दर्ज करें (जैसे, ₹5000 प्रति वर्ग फीट), और टूल भारतीय रुपयों में कुल भूमि मूल्य की गणना करेगा।",
      },
      {
        q: "How do I compare Bigha across states?",
        qHi: "मैं राज्यों में बीघा की तुलना कैसे करूं?",
        a: "Click on 'Compare Bigha Across States' to see a detailed comparison table and visual bar chart showing how Bigha sizes vary across different Indian states.",
        aHi: "विस्तृत तुलना तालिका और दृश्य बार चार्ट देखने के लिए 'राज्यों में बीघा तुलना करें' पर क्लिक करें जो दिखाता है कि बीघा आकार विभिन्न भारतीय राज्यों में कैसे भिन्न होते हैं।",
      },
    ],
  },
  {
    category: "Accuracy & Verification",
    categoryHi: "सटीकता और सत्यापन",
    items: [
      {
        q: "How accurate are the conversions?",
        qHi: "रूपांतरण कितने सटीक हैं?",
        a: "Our conversions use officially recognized standards and traditional measurements. However, land measurement can vary by district and local customs. For legal transactions, always verify with your local Talathi, Patwari, or Revenue Office.",
        aHi: "हमारे रूपांतरण आधिकारिक तौर पर मान्यता प्राप्त मानकों और पारंपरिक मापों का उपयोग करते हैं। हालांकि, भूमि माप जिले और स्थानीय रीति-रिवाजों के अनुसार भिन्न हो सकता है। कानूनी लेनदेन के लिए, हमेशा अपने स्थानीय तलाठी, पटवारी या राजस्व कार्यालय के साथ सत्यापित करें।",
      },
      {
        q: "Can I use this for legal documents?",
        qHi: "क्या मैं इसका उपयोग कानूनी दस्तावेजों के लिए कर सकता हूं?",
        a: "This tool is for informational and preliminary calculation purposes only. For official land transactions, sale deeds, property disputes, or government filings, always verify measurements with licensed surveyors or revenue authorities.",
        aHi: "यह टूल केवल सूचनात्मक और प्रारंभिक गणना उद्देश्यों के लिए है। आधिकारिक भूमि लेनदेन, बिक्री विलेख, संपत्ति विवादों या सरकारी फाइलिंग के लिए, हमेशा लाइसेंस प्राप्त सर्वेयरों या राजस्व अधिकारियों के साथ माप सत्यापित करें।",
      },
      {
        q: "What if I find an error?",
        qHi: "अगर मुझे कोई त्रुटि मिले तो क्या करें?",
        a: "Please contact us immediately at admin@ladestack.in with details about the error. We regularly update our conversion values based on government notifications and user feedback.",
        aHi: "कृपया त्रुटि के विवरण के साथ तुरंत admin@ladestack.in पर हमसे संपर्क करें। हम सरकारी अधिसूचनाओं और उपयोगकर्ता प्रतिक्रिया के आधार पर नियमित रूप से अपने रूपांतरण मान अपडेट करते हैं।",
      },
    ],
  },
  {
    category: "Technical",
    categoryHi: "तकनीकी",
    items: [
      {
        q: "Which browsers are supported?",
        qHi: "कौन से ब्राउज़र समर्थित हैं?",
        a: "Bharat Land Converter works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For the best experience, use the latest version of your browser.",
        aHi: "भारत भूमि कन्वर्टर सभी आधुनिक ब्राउज़रों पर काम करता है जिनमें Chrome, Firefox, Safari, Edge और Opera शामिल हैं। सबसे अच्छे अनुभव के लिए, अपने ब्राउज़र का नवीनतम संस्करण उपयोग करें।",
      },
      {
        q: "Is my data secure?",
        qHi: "क्या मेरा डेटा सुरक्षित है?",
        a: "Yes! We don't collect, store, or transmit any personal data. All conversions happen locally in your browser. Saved land parcels are stored in your browser's localStorage and are only accessible to you.",
        aHi: "हाँ! हम कोई व्यक्तिगत डेटा एकत्र, संग्रहीत या प्रसारित नहीं करते हैं। सभी रूपांतरण आपके ब्राउज़र में स्थानीय रूप से होते हैं। सहेजी गई भूमि की साजिशें आपके ब्राउज़र के localStorage में संग्रहीत होती हैं और केवल आपको ही सुलभ होती हैं।",
      },
      {
        q: "Can I use this on mobile?",
        qHi: "क्या मैं इसका उपयोग मोबाइल पर कर सकता हूं?",
        a: "Absolutely! The app is fully responsive and mobile-first. It works perfectly on smartphones, tablets, and desktops. You can also add it to your home screen for app-like access.",
        aHi: "बिल्कुल! ऐप पूरी तरह से रिस्पॉन्सिव और मोबाइल-फर्स्ट है। यह स्मार्टफोन, टैबलेट और डेस्कटॉप पर पूरी तरह से काम करता है। आप ऐप जैसी पहुंच के लिए इसे अपनी होम स्क्रीन में भी जोड़ सकते हैं।",
      },
      {
        q: "What technology is used?",
        qHi: "कौन सी तकनीक का उपयोग किया गया है?",
        a: "The app is built with React, TypeScript, and Tailwind CSS. It uses Vite for fast builds and follows modern web development best practices.",
        aHi: "ऐप React, TypeScript और Tailwind CSS के साथ बनाया गया है। यह तेज़ बिल्ड के लिए Vite का उपयोग करता है और आधुनिक वेब विकास सर्वोत्तम प्रथाओं का पालन करता है।",
      },
    ],
  },
  {
    category: "Support & Feedback",
    categoryHi: "समर्थन और प्रतिक्रिया",
    items: [
      {
        q: "How can I report a bug?",
        qHi: "मैं बग की रिपोर्ट कैसे करूं?",
        a: "Visit our Contact page and use the form, or email us at admin@ladestack.in with details about the bug, including your browser, device, and steps to reproduce.",
        aHi: "हमारे संपर्क पृष्ठ पर जाएं और फॉर्म का उपयोग करें, या बग के विवरण के साथ हमें admin@ladestack.in पर ईमेल करें, जिसमें आपका ब्राउज़र, डिवाइस और पुनरुत्पादित करने के चरण शामिल हैं।",
      },
      {
        q: "Can I request a new feature?",
        qHi: "क्या मैं नई सुविधा का अनुरोध कर सकता हूं?",
        a: "Yes! We love hearing from users. Send us your feature requests via the Contact page. We prioritize features based on user demand and feasibility.",
        aHi: "हाँ! हमें उपयोगकर्ताओं से सुनना पसंद है। संपर्क पृष्ठ के माध्यम से हमें अपनी सुविधा अनुरोध भेजें। हम उपयोगकर्ता मांग और व्यवहार्यता के आधार पर सुविधाओं को प्राथमिकता देते हैं।",
      },
      {
        q: "How can I support this project?",
        qHi: "मैं इस परियोजना का समर्थन कैसे कर सकता हूं?",
        a: "Share Bharat Land Converter with friends, family, and colleagues who might find it useful. Your feedback and suggestions also help us improve!",
        aHi: "भारत भूमि कन्वर्टर को दोस्तों, परिवार और सहकर्मियों के साथ साझा करें जिन्हें यह उपयोगी लग सकता है। आपकी प्रतिक्रिया और सुझाव भी हमें बेहतर बनाने में मदद करते हैं!",
      },
    ],
  },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<"en" | "hi">("en");

  const filteredFAQs = FAQS.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lang === "hi" && (item.qHi.includes(searchQuery) || item.aHi.includes(searchQuery)))
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl px-4 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          ← Back to Converter
        </Link>

        <div className="text-center mb-10">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
          <p className="text-sm text-muted-foreground">Find answers to common questions about Bharat Land Converter</p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border bg-card p-1">
            <Button
              variant={lang === "en" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLang("en")}
              className="min-h-[36px]"
            >
              English
            </Button>
            <Button
              variant={lang === "hi" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLang("hi")}
              className="min-h-[36px]"
            >
              हिंदी
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={lang === "hi" ? "प्रश्न खोजें..." : "Search questions..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 min-h-[48px] text-base"
          />
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((category) => (
              <div key={category.category} className="space-y-3">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {lang === "hi" ? category.categoryHi : category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.category}-${index}`}
                      className="rounded-lg border bg-card px-4"
                    >
                      <AccordionTrigger className="text-sm font-medium text-left py-4 hover:no-underline">
                        {lang === "hi" ? faq.qHi : faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4">
                        {lang === "hi" ? faq.aHi : faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground">
                {lang === "hi" ? "कोई परिणाम नहीं मिला" : "No results found"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {lang === "hi"
                  ? "अलग कीवर्ड आज़माएं या श्रेणी ब्राउज़ करें"
                  : "Try a different keyword or browse categories"}
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4 min-h-[44px]"
              >
                {lang === "hi" ? "सभी प्रश्न देखें" : "View all questions"}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Help */}
        <div className="mt-10 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground text-center">
            {lang === "hi" ? "अभी भी मदद चाहिए?" : "Still Need Help?"}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {lang === "hi"
              ? "हमारी सहायता टीम आपकी मदद करने के लिए तैयार है"
              : "Our support team is ready to help you"}
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/contact">
              <Button className="min-h-[44px] gap-2">
                📬 {lang === "hi" ? "संपर्क करें" : "Contact Us"}
              </Button>
            </Link>
            <a href="mailto:admin@ladestack.in">
              <Button variant="outline" className="min-h-[44px] gap-2">
                ✉️ Email
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-10 rounded-lg border bg-secondary/50 p-4 text-center text-xs text-muted-foreground">
          <p>© 2026 Lade Stack. All rights reserved.</p>
          <p className="mt-1">Bharat Land Converter — For every farmer and broker in India</p>
        </div>
      </div>
    </div>
  );
}
