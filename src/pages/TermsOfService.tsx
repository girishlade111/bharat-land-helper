import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl px-4 py-8 sm:py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Converter
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Terms of Service</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated: March 11, 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using <strong>Bharat Land Converter</strong> (the "Service"), operated by <strong>Lade Stack</strong> (ladestack.in),
              you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms,
              please do not use this Service.
            </p>
            <p className="mt-2">
              These Terms of Service ("Terms") govern your use of our website at bharatlandconverter.in and any related services provided
              by Lade Stack.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">2. Description of Service</h2>
            <p>
              Bharat Land Converter is a free online tool that converts between various Indian land area measurement units.
              The Service provides conversions for 35+ units across 16+ Indian states including Bigha, Guntha, Acre, Hectare,
              Kanal, Marla, Cent, Kattha, and many others.
            </p>
            <p className="mt-2">
              The Service is provided "as-is" and "as-available" without any warranty of any kind, express or implied.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">3. Eligibility</h2>
            <p>By using this Service, you represent and warrant that you:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Are at least 13 years of age or have parental consent to use this Service</li>
              <li>Have the legal capacity to agree to these Terms</li>
              <li>Will use this Service only for lawful purposes</li>
              <li>Will not attempt to gain unauthorized access to any part of the Service</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">4. User Responsibilities</h2>
            <p>When using Bharat Land Converter, you agree to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Use the Service responsibly</strong> — Do not abuse, misuse, or attempt to interfere with the Service</li>
              <li><strong>Verify critical information</strong> — Always verify land measurements with official sources for legal transactions</li>
              <li><strong>Respect intellectual property</strong> — Do not copy, reproduce, or distribute our content without permission</li>
              <li><strong>Comply with laws</strong> — Use the Service in compliance with all applicable local, state, and national laws</li>
              <li><strong>No automated access</strong> — Do not use bots, scrapers, or automated tools to access the Service</li>
            </ul>
          </section>

          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">5. Accuracy Disclaimer</h2>
            <p className="font-semibold text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wider mb-2">Important Notice</p>
            <p>
              While we strive for accuracy, land measurement standards can vary by district, region, and local customs in India.
              The conversion values used in this tool are based on commonly accepted standards, but may not reflect local variations
              or recent government updates.
            </p>
            <p className="mt-2">
              <strong>For official land transactions, legal documents, property disputes, or government filings, always verify
              measurements with your local Talathi, Patwari, Revenue Office, or licensed surveyor.</strong>
            </p>
            <p className="mt-2">
              Bharat Land Converter is intended for informational, educational, and preliminary calculation purposes only.
              We are not responsible for any discrepancies, losses, or legal issues arising from reliance on our conversion results.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">6. Intellectual Property Rights</h2>
            <p>
              All content, features, and functionality of Bharat Land Converter, including but not limited to text, graphics,
              logos, icons, images, code, software, and the overall design, are the exclusive property of <strong>Lade Stack</strong>
              or its content suppliers and are protected by Indian and international copyright, trademark, and other intellectual
              property laws.
            </p>
            <p className="mt-2">
              You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for
              personal, non-commercial purposes only.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">7. Prohibited Uses</h2>
            <p>You may not use the Service to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Violate any local, state, national, or international law</li>
              <li>Engage in fraudulent, deceptive, or misleading activities</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service for any illegal land transactions or activities</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Remove any copyright, trademark, or proprietary notices</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">8. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites or services (such as WhatsApp for sharing, Google Fonts,
              or social media links) that are not owned or controlled by Lade Stack.
            </p>
            <p className="mt-2">
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any
              third-party websites or services. You acknowledge and agree that Lade Stack shall not be responsible or liable,
              directly or indirectly, for any damage or loss caused by your use of any such websites or services.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, LADE STACK DISCLAIMS ALL WARRANTIES,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Implied warranties of merchantability</li>
              <li>Implied warranties of fitness for a particular purpose</li>
              <li>Implied warranties of non-infringement</li>
              <li>Warranties of accuracy, completeness, or reliability</li>
              <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">10. Limitation of Liability</h2>
            <p className="font-semibold mb-2">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL LADE STACK, ITS DIRECTORS, EMPLOYEES, PARTNERS,
              AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Any direct, indirect, incidental, special, consequential, or exemplary damages</li>
              <li>Loss of profits, data, business, or goodwill</li>
              <li>Personal injury or property damage resulting from use of the Service</li>
              <li>Any errors, omissions, or inaccuracies in the Service content</li>
              <li>Any conduct or content of any third party on or through the Service</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">11. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Lade Stack and its employees, contractors, agents, officers,
              and directors from and against any and all claims, damages, obligations, losses, liabilities, costs or debt,
              and expenses (including but not limited to attorney's fees) arising from:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Your use of and access to the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third-party right, including any copyright, property, or privacy right</li>
              <li>Any claim that your use of the Service caused damage to a third party</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">12. Modifications to the Service</h2>
            <p>
              Lade Stack reserves the right to modify, suspend, discontinue, or terminate the Service (or any part thereof)
              at any time, with or without notice and without liability to you or any third party.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">13. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for
              any reason, including if you breach these Terms. Upon termination, your right to use the Service will
              immediately cease.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">14. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its
              conflict of law provisions. Any disputes arising out of or relating to these Terms or the Service shall be
              subject to the exclusive jurisdiction of the courts located in Maharashtra, India.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">15. Changes to These Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
              is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            <p className="mt-2">
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by
              the revised terms. If you do not agree to the new terms, please discontinue using the Service.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">16. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Email:</strong> <a href="mailto:admin@ladestack.in" className="text-primary hover:underline">admin@ladestack.in</a></li>
              <li><strong>Website:</strong> <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ladestack.in</a></li>
              <li><strong>Organization:</strong> Lade Stack</li>
            </ul>
          </section>

          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
            <p>© 2026 Lade Stack. All rights reserved.</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">Bharat Land Converter — Free · No login · No ads · No tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
