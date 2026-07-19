"use client";

import { useState } from "react";
import { Mail, Instagram, Phone } from "lucide-react";

export function ContactSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
    setMessage("");
  };

  return (
    <section id="contattaci" className="scroll-mt-24">
      <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20 lg:py-32">
        <div className="mx-auto max-w-5xl">
          {/* Titolo */}
          <div className="text-center">
            <p className="product-label text-muted-foreground">Scrivici</p>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
              Contattaci
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hai domande sui nostri caffè o vini? Scrivici, ti rispondiamo entro 24 ore.
            </p>
          </div>

          <div className="mt-12 grid gap-12 md:grid-cols-2">
            {/* Form */}
            <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-4 font-display text-xl font-medium text-foreground">
                    Messaggio inviato!
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ti risponderemo al più presto.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
                  >
                    Invia un altro messaggio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="la-tua@email.com"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                      Messaggio
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Raccontaci cosa cerchi..."
                      className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Invia Messaggio
                  </button>
                </form>
              )}
            </div>

            {/* Contatti diretti */}
            <div className="flex flex-col justify-center gap-8">
              <div>
                <h3 className="font-display text-xl font-medium text-foreground">
                  Parlaci direttamente
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Preferisci un contatto diretto? Scrivici su Instagram o WhatsApp.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="https://www.instagram.com/caffetoninho/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Instagram</p>
                    <p className="text-xs text-muted-foreground">@caffetoninho</p>
                  </div>
                </a>

                <a
                  href="tel:+39069066529"
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Telefono</p>
                    <p className="text-xs text-muted-foreground">06 9066 529</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Chiacchierata veloce</p>
                  </div>
                </a>
              </div>

              <div className="mt-2 border-t border-border pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Risposta garantita entro 24h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
