"use client";
import React, { useState } from "react";

const roles = [
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "ISO 9001",
    desc: "Kwaliteitsmanagement",
    info: "Heeft organisaties begeleid bij het opzetten, implementeren en optimaliseren van kwaliteitsmanagementsystemen volgens ISO 9001, met focus op praktische verbetering en continue optimalisatie.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: "ISO 27001",
    desc: "Informatiebeveiliging",
    info: "Heeft informatiebeveiligingssystemen opgezet en geïmplementeerd volgens ISO 27001, en organisaties geadviseerd over risicogestuurde beveiliging en certificering.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 17l6-6 4 4 8-8" />
      </svg>
    ),
    title: "ISO 14001",
    desc: "Milieumanagement",
    info: "Heeft milieumanagementsystemen ontwikkeld en onderhouden, en organisaties ondersteund bij duurzaamheid, naleving en praktische milieuprestaties.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "ISO 16175",
    desc: "Informatiebeheer",
    info: "Heeft advies gegeven over slim, compliant en efficiënt document- en informatiebeheer op basis van ISO 16175.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M8 12h8" />
      </svg>
    ),
    title: "BIO",
    desc: "Baseline Informatiebeveiliging Overheid",
    info: "Heeft de BIO-norm geïmplementeerd en getoetst bij overheidsorganisaties en leveranciers, en bijgedragen aan structurele compliance en praktische toepassing.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Functionaris Gegevensbescherming (FG)",
    desc: "Privacy & gegevensbescherming",
    info: "Heeft als (externe) FG toezicht gehouden op naleving van de AVG, privacybeleid, DPIA’s en bewustwording.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M8 12h8" />
      </svg>
    ),
    title: "QHSE/KAM consultant",
    desc: "Kwaliteit, Arbo, Milieu & Veiligheid",
    info: "Heeft advies en begeleiding gegeven op het gebied van kwaliteitszorg, arbeidsveiligheid, milieumanagement en compliance in uiteenlopende sectoren.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: "Hoofd Informatiebeveiliging & Privacy",
    desc: "Leidinggevende rol in security & privacy",
    info: "Heeft leidinggegeven aan en coördinatie verzorgd van informatiebeveiliging en privacy binnen organisaties.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 17l6-6 4 4 8-8" />
      </svg>
    ),
    title: "Coördinator InfoSec",
    desc: "Coördinatie informatiebeveiliging",
    info: "Heeft de rol van InfoSec-coördinator vervuld en de implementatie en naleving van informatiebeveiligingsbeleid verzorgd.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Manager Compliance",
    desc: "Compliance management",
    info: "Heeft als compliance manager toezicht gehouden op naleving van wet- en regelgeving en interne richtlijnen.",
  }
];

export default function RolesGrid() {
  const [openRow, setOpenRow] = useState<number | null>(null);

  const toggleCard = (idx: number) => {
    const row = Math.floor(idx / 2);
    setOpenRow((prev) => (prev === row ? null : row));
  };

  return (
    <div className="relative w-full py-8">
      {/* Vertical timeline line */}
      <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 z-0" style={{ transform: 'translateX(-50%)' }} />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-5 mt-2">
          {roles.map((rol, idx) => {
            const row = Math.floor(idx / 2);
            const isOpen = openRow === row;
            return (
              <div
                key={rol.title}
                className={`group flex flex-col min-h-[180px] bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:bg-white transition-all duration-200 cursor-pointer overflow-visible relative ${isOpen ? "ring-2 ring-[#00875A]" : ""}`}
                style={{
                  flex: "1 1 320px",
                  maxWidth: "calc(50% - 12px)",
                  minWidth: "280px",
                  boxSizing: "border-box",
                }}
              >
                <button
                  className="flex flex-col items-center gap-3 w-full outline-none select-none list-none cursor-pointer bg-transparent border-none"
                  onClick={() => toggleCard(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`role-info-${idx}`}
                  type="button"
                >
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12">{rol.icon}</div>
                  <div className="flex flex-col items-center text-center">
                    <div className="font-bold text-[#00875A] text-base group-hover:underline">{rol.title}</div>
                    <div className="text-gray-700 text-sm">{rol.desc}</div>
                  </div>
                </button>
                {isOpen && (
                  <div
                    id={`role-info-${idx}`}
                    className="mt-4 w-full bg-white rounded-lg border border-gray-200 p-4 text-gray-800 text-sm transition-all duration-200 flex flex-col items-center text-center"
                  >
                    {rol.info}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}