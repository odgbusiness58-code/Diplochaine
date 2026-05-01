"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Building2, Send } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { SectionHeader } from "./SectionHeader";

const contactInfo = [
  { icon: Mail, label: "contact@diplocha.in" },
  { icon: Phone, label: "+226 05 16 00 65" },
  { icon: MapPin, label: "Ouagadougou, Burkina Faso" },
  { icon: Building2, label: "Ministère de l'Éducation Nationale" },
];

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 4000);
  };

  return (
    <section id="contact" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          title="Contactez-nous"
          description="Intéressé par DiploChain ? Discutons de votre projet."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {contactInfo.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-slate-700">{label}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Input
              label="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jean Dupont"
            />
            <Input
              label="Votre email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jean@exemple.bf"
            />
            <Textarea
              label="Votre message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Bonjour, nous sommes intéressés par DiploChain pour notre université…"
            />
            <Button type="submit" fullWidth size="lg">
              <Send className="h-4 w-4" />
              Envoyer
            </Button>
            {submitted && (
              <p className="rounded-lg bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
                ✓ Message reçu. Nous vous répondrons sous 48h.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
