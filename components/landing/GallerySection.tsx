import Image from "next/image";

import { SectionHeader } from "./SectionHeader";

const items = [
  { src: "/img/img4.jpg", title: "Tableau de bord", desc: "Interface intuitive pour la gestion des diplômes" },
  { src: "/img/img5.jpg", title: "Vérification temps réel", desc: "Contrôle instantané des qualifications" },
  { src: "/img/img6.jpg", title: "Certificats numériques", desc: "Documents sécurisés et traçables" },
  { src: "/img/img7.jpg", title: "Éducation", desc: "Intégration dans les établissements scolaires" },
  { src: "/img/img8.jpg", title: "Contrôle qualité", desc: "Assurance de la conformité réglementaire" },
  { src: "/img/img9.jpg", title: "Preuve irréfutable", desc: "Authenticité garantie par la blockchain" },
];

export function GallerySection() {
  return (
    <section id="galerie" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          title="DiploChain en action"
          description="Découvrez les différentes facettes de notre plateforme."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent p-5 opacity-0 transition-opacity group-hover:opacity-100">
                <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-200">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
