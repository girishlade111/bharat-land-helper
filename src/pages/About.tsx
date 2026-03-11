import { Link } from "react-router-dom";
import { Instagram, Linkedin, Github, Globe, Mail, CodeXml, ArrowLeft } from "lucide-react";

const socials = [
  { href: "https://www.instagram.com/girish_lade_/", icon: Instagram, label: "Instagram" },
  { href: "https://www.linkedin.com/in/girish-lade-075bba201/", icon: Linkedin, label: "LinkedIn" },
  { href: "https://github.com/girishlade111", icon: Github, label: "GitHub" },
  { href: "https://codepen.io/Girish-Lade-the-looper", icon: CodeXml, label: "CodePen" },
  { href: "mailto:admin@ladestack.in", icon: Mail, label: "Email" },
  { href: "https://ladestack.in", icon: Globe, label: "Website" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl px-4 py-8 sm:py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Converter
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">About Bharat Land Converter</h1>
          <p className="mt-1 text-sm text-muted-foreground">India's most comprehensive land area unit converter</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">

          {/* Mission */}
          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-lg font-bold text-foreground">Our Mission</h2>
            <p>
              India has one of the most complex land measurement systems in the world. Every state — and sometimes every district — uses
              different units like <strong>Bigha, Guntha, Kattha, Kanal, Marla, Cent, Ground, Biswa, Dhur, Lecha, Nali, Ankanam, Kuncham</strong>, and more.
            </p>
            <p className="mt-2">
              This creates confusion for farmers, real estate agents, lawyers, civil engineers, and students who deal with land transactions
              across state borders. A Bigha in Uttar Pradesh (27,000 sq ft) is completely different from a Bigha in West Bengal (14,400 sq ft)
              or Madhya Pradesh (12,000 sq ft).
            </p>
            <p className="mt-2">
              <strong>Bharat Land Converter</strong> was built to solve this problem — a single, free, reliable tool that converts between
              <strong> 35+ Indian land units</strong> across <strong>16+ states</strong> instantly and accurately.
            </p>
          </section>

          {/* What We Offer */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">What We Offer</h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { title: "35+ Land Units", desc: "Every major Indian land measurement unit with exact sq ft values" },
                { title: "16+ States", desc: "Maharashtra, UP, Bihar, WB, Punjab, Rajasthan, Tamil Nadu, Karnataka, and more" },
                { title: "State-Smart", desc: "Select your state and see local units prioritized automatically" },
                { title: "Rate Calculator", desc: "Calculate total land value in ₹ with Indian number formatting (Lakh/Crore)" },
                { title: "Save & Compare", desc: "Save land parcels locally, track total area, compare Bigha across states" },
                { title: "Bilingual", desc: "Full Hindi language support for all UI labels and unit names" },
                { title: "Share Anywhere", desc: "Share results via URL link or WhatsApp with formatted conversion summary" },
                { title: "100% Offline", desc: "Works without internet after first load. No server calls, no API dependencies" },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border border-border/50 bg-card p-3.5">
                  <div className="text-sm font-semibold text-foreground">{f.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Who Is It For */}
          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-lg font-bold text-foreground">Who Is It For?</h2>
            <ul className="list-disc space-y-2.5 pl-5">
              <li>
                <strong>Farmers</strong> — Understand your land area in any unit. Know exactly how many Guntha, Bigha, or Acre your plot measures.
              </li>
              <li>
                <strong>Real Estate Agents & Brokers</strong> — Quickly convert land units for clients from different states. Calculate land value instantly.
              </li>
              <li>
                <strong>Lawyers & Legal Professionals</strong> — Verify land measurements in property documents, sale deeds, and court cases.
              </li>
              <li>
                <strong>Civil Engineers & Surveyors</strong> — Convert between metric (sq meter, hectare) and traditional Indian units.
              </li>
              <li>
                <strong>Students & Researchers</strong> — Learn about India's diverse land measurement systems.
              </li>
              <li>
                <strong>NRIs & Diaspora</strong> — Understand family land holdings back in India.
              </li>
            </ul>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">How It Works</h2>
            <p>Our conversion engine uses <strong>Square Feet (sq ft)</strong> as the universal base unit. The formula is simple and exact:</p>
            <div className="my-4 rounded-xl bg-secondary/50 border border-border/50 p-4 font-mono text-xs">
              <p>BASE_SQFT = InputValue × FromUnit_SqFtValue</p>
              <p>Result = BASE_SQFT ÷ ToUnit_SqFtValue</p>
            </div>
            <p>Every unit has a precisely defined sq ft value based on official government standards and traditional measurements:</p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="p-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit</th>
                    <th className="p-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State</th>
                    <th className="p-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sq Ft</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {[
                    ["Guntha", "Maharashtra / Karnataka", "1,089"],
                    ["Bigha", "UP", "27,000"],
                    ["Bigha", "Bihar", "27,220"],
                    ["Bigha", "West Bengal", "14,400"],
                    ["Bigha", "MP", "12,000"],
                    ["Kanal", "Punjab / Haryana", "5,445"],
                    ["Marla", "Punjab / Haryana", "272.25"],
                    ["Cent", "South India", "435.6"],
                    ["Acre", "All India", "43,560"],
                    ["Hectare", "All India", "1,07,639"],
                  ].map(([unit, state, val]) => (
                    <tr key={unit + state}>
                      <td className="p-2.5 pr-4 font-medium text-foreground">{unit}</td>
                      <td className="p-2.5 pr-4 text-muted-foreground">{state}</td>
                      <td className="p-2.5 text-right tabular-nums font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Why Free */}
          <section className="rounded-xl border border-primary/10 bg-primary/5 p-5">
            <h2 className="mb-3 text-lg font-bold text-foreground">Why Free?</h2>
            <p>
              Land conversion is a basic need for millions of Indians. We believe this tool should be accessible to everyone —
              from a farmer in rural Maharashtra checking his Guntha measurement, to a real estate agent in Punjab calculating Kanal to Acre.
            </p>
            <ul className="mt-3 space-y-1.5 pl-5 list-disc">
              <li><strong>No login required</strong> — Use it instantly</li>
              <li><strong>No advertisements</strong> — Clean experience</li>
              <li><strong>No data collection</strong> — Your privacy is respected</li>
              <li><strong>No internet needed</strong> — Works offline after first load</li>
              <li><strong>No app download</strong> — Works in any browser</li>
            </ul>
          </section>

          {/* About Lade Stack */}
          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-lg font-bold text-foreground">About Lade Stack</h2>
            <p>
              <strong>Bharat Land Converter</strong> is built and maintained by <strong>Lade Stack</strong> — a web development studio
              focused on building useful, accessible tools for the Indian market.
            </p>
            <p className="mt-2">
              Founded by <strong>Girish Lade</strong>, Lade Stack creates web applications that solve real problems for real people.
              We specialize in modern web technologies including React, TypeScript, and Tailwind CSS.
            </p>

            <div className="mt-4 flex justify-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-105"
                >
                  <s.icon size={16} strokeWidth={2} />
                </a>
              ))}
            </div>
          </section>

          {/* Technical Details */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">Technical Details</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["Framework", "React with TypeScript"],
                ["Styling", "Tailwind CSS"],
                ["Fonts", "Inter + Noto Sans Devanagari"],
                ["Storage", "Browser localStorage"],
                ["Hosting", "Static site, no server"],
                ["Languages", "English + Hindi"],
                ["Compatibility", "All modern browsers"],
                ["Mobile", "Fully responsive, mobile-first"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2 text-xs">
                  <span className="font-semibold text-foreground">{k}:</span>
                  <span className="text-muted-foreground">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h2 className="mb-3 text-lg font-bold text-foreground">Disclaimer</h2>
            <p>
              While we strive for accuracy, land measurement standards can vary by district and local customs.
              The conversion values used in this tool are based on the most commonly accepted standards for each state.
              For official land transactions, legal documents, or government filings, always verify measurements with
              your local <strong>Talathi / Patwari / Revenue Office</strong>.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">Contact Us</h2>
            <p className="mb-2">Have feedback, found an error, or want to suggest a feature?</p>
            <ul className="space-y-1.5 pl-5 list-disc">
              <li><strong>Email:</strong> <a href="mailto:admin@ladestack.in" className="text-primary hover:underline">admin@ladestack.in</a></li>
              <li><strong>Website:</strong> <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ladestack.in</a></li>
              <li><strong>Instagram:</strong> <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@girish_lade_</a></li>
              <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Girish Lade</a></li>
            </ul>
          </section>

          {/* Hindi Tagline */}
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-5 text-center">
            <p className="text-base font-bold text-foreground">भारत के हर किसान और दलाल के लिए</p>
            <p className="mt-1 text-xs text-muted-foreground">For every farmer and broker in India</p>
            <p className="mt-2 text-[11px] text-muted-foreground/70">© 2026 Lade Stack. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
