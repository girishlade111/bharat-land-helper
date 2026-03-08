import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl px-4 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          ← Back to Converter
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mb-8 text-sm text-muted-foreground">Last updated: March 8, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              Welcome to <strong>Bharat Land Converter</strong> ("we", "our", "us"), operated by <strong>Lade Stack</strong> (ladestack.in).
              This Privacy Policy explains how we handle information when you use our website at bharatlandconverter.in (the "Service").
            </p>
            <p className="mt-2">
              We are committed to protecting your privacy. Our Service is designed to work entirely in your browser with
              <strong> zero data collection</strong>, no user accounts, and no server-side tracking.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">2. Information We Do NOT Collect</h2>
            <p>Bharat Land Converter is a fully client-side application. We want to be transparent:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>No personal information</strong> — We do not ask for your name, email, phone number, or any personal details.</li>
              <li><strong>No account or login</strong> — There is no registration, login, or authentication system.</li>
              <li><strong>No cookies for tracking</strong> — We do not use cookies to track your behavior or identity.</li>
              <li><strong>No analytics tracking</strong> — We do not use Google Analytics, Facebook Pixel, or any third-party analytics tools.</li>
              <li><strong>No server-side data storage</strong> — All your data stays in your browser's localStorage and is never sent to any server.</li>
              <li><strong>No API calls</strong> — The application works 100% offline after the initial page load. No external APIs are called.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">3. Data Stored Locally (localStorage)</h2>
            <p>
              When you use the "My Land List" feature to save land parcels, the data is stored in your browser's
              <strong> localStorage</strong>. This includes:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Land parcel name (e.g., "Shetkari Plot - Pune")</li>
              <li>Area value and unit (e.g., "5 Guntha")</li>
              <li>Selected state</li>
              <li>Total area in square feet</li>
              <li>Date saved</li>
            </ul>
            <p className="mt-3">
              <strong>Important:</strong> This data is stored only on your device. We cannot access, read, or retrieve it.
              You can delete this data at any time by:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Using the delete (🗑) button next to each saved parcel</li>
              <li>Clearing your browser's localStorage/site data</li>
              <li>Using your browser's "Clear browsing data" feature</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">4. Third-Party Services</h2>
            <p>Our website uses the following third-party services for functionality only:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Google Fonts</strong> — We load the Inter and Noto Sans Devanagari fonts from Google Fonts. Google may collect anonymized usage data as described in their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>.</li>
              <li><strong>WhatsApp Share</strong> — When you click the "WhatsApp Share" button, it opens WhatsApp's web interface (wa.me) with a pre-filled message. No data is sent to our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">5. URL Parameters</h2>
            <p>
              When you use the "Share Link" feature, a URL is generated with query parameters (e.g., <code className="rounded bg-muted px-1.5 py-0.5 text-xs">?v=1000&u=sqft&s=Maharashtra</code>).
              These parameters contain only the conversion values you chose to share — no personal information is included.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">6. Children's Privacy</h2>
            <p>
              Our Service does not collect any personal information from anyone, including children under 13.
              The tool is safe for use by students and minors.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">7. Security</h2>
            <p>
              Since we do not collect, store, or transmit any personal data, there is minimal security risk associated with using our Service.
              All computations happen locally in your browser. We serve the website over HTTPS to ensure secure delivery of the application code.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">8. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
              "Last updated" date. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">9. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Email:</strong> <a href="mailto:admin@ladestack.in" className="text-primary hover:underline">admin@ladestack.in</a></li>
              <li><strong>Website:</strong> <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ladestack.in</a></li>
              <li><strong>Organization:</strong> Lade Stack</li>
            </ul>
          </section>

          <div className="rounded-lg border bg-secondary/50 p-4 text-center text-xs text-muted-foreground">
            <p>© 2026 Lade Stack. All rights reserved.</p>
            <p className="mt-1">Bharat Land Converter — Free · No login · No ads · No tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
