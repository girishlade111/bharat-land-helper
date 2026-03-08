import { Link } from "react-router-dom";
import { Instagram, Linkedin, Github, Globe, Mail, CodeXml } from "lucide-react";

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
      <div className="container max-w-3xl px-4 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          ← Back to Converter
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-foreground">About Bharat Land Converter</h1>
        <p className="mb-8 text-sm text-muted-foreground">India's most comprehensive land area unit converter</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">

          {/* Mission */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">🇮🇳 Our Mission</h2>
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
            <h2 className="mb-3 text-xl font-semibold text-foreground">🛠️ What We Offer</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { title: "35+ Land Units", desc: "Every major Indian land measurement unit with exact sq ft values" },
                { title: "16+ States", desc: "Maharashtra, UP, Bihar, WB, Punjab, Rajasthan, Tamil Nadu, Karnataka, and more" },
                { title: "State-Smart", desc: "Select your state and see local units prioritized automatically" },
                { title: "Land Rate Calculator", desc: "Calculate total land value in ₹ with Indian number formatting (Lakh/Crore)" },
                { title: "Save & Compare", desc: "Save land parcels locally, track total area, compare Bigha across states" },
                { title: "Bilingual", desc: "Full Hindi (हिंदी) language support for all UI labels and unit names" },
                { title: "Share Anywhere", desc: "Share results via URL link or WhatsApp with formatted conversion summary" },
                { title: "100% Offline", desc: "Works without internet after first load. No server calls, no API dependencies" },
              ].map((f) => (
                <div key={f.title} className="rounded-lg border bg-card p-3">
                  <div className="font-semibold text-foreground">{f.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Who Is It For */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">👥 Who Is It For?</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Farmers (किसान / शेतकरी)</strong> — Understand your land area in any unit. Know exactly how many Guntha, Bigha, or Acre your plot measures.
              </li>
              <li>
                <strong>Real Estate Agents & Brokers (दलाल)</strong> — Quickly convert land units for clients from different states. Calculate land value instantly.
              </li>
              <li>
                <strong>Lawyers & Legal Professionals</strong> — Verify land measurements in property documents, sale deeds, and court cases with accurate conversions.
              </li>
              <li>
                <strong>Civil Engineers & Surveyors</strong> — Convert between metric (sq meter, hectare) and traditional Indian units for project planning.
              </li>
              <li>
                <strong>Students & Researchers</strong> — Learn about India's diverse land measurement systems with our quick reference tables and comparison tools.
              </li>
              <li>
                <strong>NRIs & Diaspora</strong> — Understand family land holdings back in India by converting unfamiliar local units to standard measurements.
              </li>
            </ul>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">⚙️ How It Works</h2>
            <p>Our conversion engine uses <strong>Square Feet (sq ft)</strong> as the universal base unit. The formula is simple and exact:</p>
            <div className="my-4 rounded-lg bg-muted p-4 font-mono text-xs">
              <p>BASE_SQFT = InputValue × FromUnit_SqFtValue</p>
              <p>Result = BASE_SQFT ÷ ToUnit_SqFtValue</p>
            </div>
            <p>Every unit has a precisely defined sq ft value based on official government standards and traditional measurements:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 pr-4 text-left font-semibold">Unit</th>
                    <th className="pb-2 pr-4 text-left font-semibold">State</th>
                    <th className="pb-2 text-right font-semibold">Sq Ft Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
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
                      <td className="py-1.5 pr-4 font-medium">{unit}</td>
                      <td className="py-1.5 pr-4 text-muted-foreground">{state}</td>
                      <td className="py-1.5 text-right tabular-nums">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Why Free */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">💚 Why Free?</h2>
            <p>
              Land conversion is a basic need for millions of Indians. We believe this tool should be accessible to everyone —
              from a farmer in rural Maharashtra checking his Guntha measurement, to a real estate agent in Punjab calculating Kanal to Acre.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>No login required</strong> — Use it instantly, no barriers</li>
              <li><strong>No advertisements</strong> — Clean, distraction-free experience</li>
              <li><strong>No data collection</strong> — Your privacy is fully respected</li>
              <li><strong>No internet needed</strong> — Works offline after first load</li>
              <li><strong>No app download</strong> — Works directly in any browser</li>
            </ul>
          </section>

          {/* About Lade Stack */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">🏗️ About Lade Stack</h2>
            <p>
              <strong>Bharat Land Converter</strong> is built and maintained by <strong>Lade Stack</strong> — a web development studio
              focused on building useful, accessible tools for the Indian market.
            </p>
            <p className="mt-2">
              Founded by <strong>Girish Lade</strong>, Lade Stack creates web applications that solve real problems for real people.
              We specialize in modern web technologies including React, TypeScript, and Tailwind CSS.
            </p>

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
          </section>

          {/* Technical Details */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">📱 Technical Details</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>Framework:</strong> React with TypeScript</li>
              <li><strong>Styling:</strong> Tailwind CSS with custom green/amber theme</li>
              <li><strong>Fonts:</strong> Inter (Latin) + Noto Sans Devanagari (Hindi)</li>
              <li><strong>Storage:</strong> Browser localStorage (client-side only)</li>
              <li><strong>Hosting:</strong> Static site, no server required</li>
              <li><strong>Languages:</strong> English + Hindi (हिंदी)</li>
              <li><strong>Compatibility:</strong> All modern browsers (Chrome, Firefox, Safari, Edge)</li>
              <li><strong>Mobile:</strong> Fully responsive, mobile-first design</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">⚠️ Disclaimer</h2>
            <p>
              While we strive for accuracy, land measurement standards can vary by district and local customs.
              The conversion values used in this tool are based on the most commonly accepted standards for each state.
              For official land transactions, legal documents, or government filings, always verify measurements with
              your local <strong>Talathi / Patwari / Revenue Office</strong>.
            </p>
            <p className="mt-2">
              This tool is provided "as-is" for informational and educational purposes. Lade Stack is not responsible
              for any decisions made based on the conversions provided by this tool.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">📬 Contact Us</h2>
            <p>Have feedback, found an error, or want to suggest a feature? We'd love to hear from you!</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Email:</strong> <a href="mailto:admin@ladestack.in" className="text-primary hover:underline">admin@ladestack.in</a></li>
              <li><strong>Website:</strong> <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ladestack.in</a></li>
              <li><strong>Instagram:</strong> <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@girish_lade_</a></li>
              <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Girish Lade</a></li>
            </ul>
          </section>

          {/* Hindi Tagline */}
          <div className="rounded-lg border bg-secondary/50 p-4 text-center">
            <p className="text-base font-semibold text-foreground">भारत के हर किसान और दलाल के लिए</p>
            <p className="mt-1 text-xs text-muted-foreground">For every farmer and broker in India</p>
            <p className="mt-2 text-xs text-muted-foreground">© 2026 Lade Stack. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
