import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  return (
    <section
      id="accueil"
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-32 pb-20 text-white sm:pt-40 sm:pb-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            Hackathon MIABE 2026
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Vérification instantanée des diplômes
          </h1>
          <p className="mt-6 max-w-xl text-lg text-blue-100 sm:text-xl">
            DiploChain utilise la cryptographie RSA et la blockchain Polygon pour
            certifier les diplômes burkinabè de manière immuable et accessible
            partout, en moins de 3 secondes.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#demo" size="lg" variant="secondary" className="bg-white !text-blue-600 border-white hover:bg-blue-50">
              Tester la démo
            </ButtonLink>
            <ButtonLink
              href="/verifier"
              size="lg"
              className="bg-blue-500/30 !text-white border border-white/40 hover:bg-blue-500/50"
            >
              Vérifier un diplôme
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-blue-100">
            <div>
              <p className="text-2xl font-bold text-white">3s</p>
              <p>Vérification</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">RSA-2048</p>
              <p>+ secp256k1</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">Polygon</p>
              <p>Amoy testnet</p>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:200ms]">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <Image
              src="/img/img1.jpg"
              alt="Interface DiploChain"
              width={800}
              height={600}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:block">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              ✓ Diplôme vérifié
            </p>
            <p className="mt-1 font-mono text-sm text-slate-700">DIPLO-…1234</p>
          </div>
        </div>
      </div>
    </section>
  );
}
