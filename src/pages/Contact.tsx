import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Github, Globe, Mail, CodeXml, Send, MapPin, Phone, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const socials = [
  { href: "https://www.instagram.com/girish_lade_/", icon: Instagram, label: "Instagram" },
  { href: "https://www.linkedin.com/in/girish-lade-075bba201/", icon: Linkedin, label: "LinkedIn" },
  { href: "https://github.com/girishlade111", icon: Github, label: "GitHub" },
  { href: "https://codepen.io/Girish-Lade-the-looper", icon: CodeXml, label: "CodePen" },
  { href: "mailto:admin@ladestack.in", icon: Mail, label: "Email" },
  { href: "https://ladestack.in", icon: Globe, label: "Website" },
];

const contactInfo = [
  { icon: Mail, label: "Email", value: "admin@ladestack.in", href: "mailto:admin@ladestack.in" },
  { icon: Globe, label: "Website", value: "ladestack.in", href: "https://ladestack.in" },
  { icon: MapPin, label: "Location", value: "Maharashtra, India", href: "#" },
  { icon: Phone, label: "Response Time", value: "Within 24-48 hours", href: "#" },
];

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create mailto link with pre-filled content
    const mailtoLink = `mailto:admin@ladestack.in?subject=${encodeURIComponent(formData.subject || "Contact from Bharat Land Converter")}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    // Open default email client
    window.location.href = mailtoLink;

    toast({
      title: "Opening Email Client",
      description: "Please send the email from your email client to complete your message.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl px-4 py-8 sm:py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Converter
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Contact Us</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'd love to hear from you. Get in touch with our team.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h2 className="mb-3 text-base font-bold text-foreground">Get in Touch</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Have questions, feedback, or suggestions? We're here to help! Whether you've found a bug,
                want to request a new feature, or just want to say hello, feel free to reach out.
              </p>

              <div className="space-y-2.5">
                {contactInfo.map((info) => (
                  <a
                    key={info.label}
                    href={info.href}
                    target={info.href.startsWith("http") ? "_blank" : undefined}
                    rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 rounded-lg bg-secondary/40 p-3 transition-colors hover:bg-secondary/70"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <info.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{info.label}</div>
                      <div className="text-sm font-semibold text-foreground">{info.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h2 className="mb-3 text-base font-bold text-foreground">Connect on Social Media</h2>
              <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Response Time */}
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <h3 className="text-sm font-semibold text-foreground">Expected Response Time</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                We typically respond within 24-48 hours during business days (Monday-Saturday).
                For urgent matters, mention "URGENT" in your subject line.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="mb-4 text-base font-bold text-foreground">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="name" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Your Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ramesh Kumar"
                  required
                  className="min-h-[42px] rounded-lg border-border/60"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ramesh@example.com"
                  required
                  className="min-h-[42px] rounded-lg border-border/60"
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Feature Request / Bug Report / General Inquiry"
                  className="min-h-[42px] rounded-lg border-border/60"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  required
                  rows={5}
                  className="min-h-[100px] resize-none rounded-lg border-border/60"
                />
              </div>

              <Button type="submit" className="w-full min-h-[42px] gap-2 rounded-lg" disabled={isSubmitting}>
                <Send size={16} />
                {isSubmitting ? "Opening Email..." : "Send Message"}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                This will open your default email client. Your email will be sent to admin@ladestack.in
              </p>
            </form>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-8 rounded-xl border border-border/50 bg-card p-5">
          <h2 className="mb-4 text-base font-bold text-foreground text-center">Frequently Asked Questions</h2>
          <div className="grid gap-2.5 md:grid-cols-2">
            {[
              { q: "Is Bharat Land Converter really free?", a: "Yes! 100% free forever. No login, no ads, no hidden charges." },
              { q: "How accurate are the conversions?", a: "We use official government standards. Always verify with local revenue offices for legal documents." },
              { q: "Can I use this offline?", a: "Yes! The app works 100% offline after the first load." },
              { q: "How do I report a bug?", a: "Use this contact form or email us at admin@ladestack.in with details." },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg bg-secondary/30 p-3.5">
                <div className="font-semibold text-foreground text-sm">{faq.q}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/faq" className="text-sm font-medium text-primary hover:underline">
              View all FAQs →
            </Link>
          </div>
        </div>

        {/* Support Options */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { icon: "🐛", title: "Report a Bug", desc: "Found an error or issue? Let us know!" },
            { icon: "💡", title: "Request Feature", desc: "Have an idea? We'd love to hear it!" },
            { icon: "🤝", title: "Partnership", desc: "Want to collaborate? Get in touch!" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border/50 bg-card p-4 text-center transition-colors hover:border-primary/30">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold text-foreground">{item.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-border/50 bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
          <p>© 2026 Lade Stack. All rights reserved.</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">Bharat Land Converter — For every farmer and broker in India</p>
        </div>
      </div>
    </div>
  );
}
