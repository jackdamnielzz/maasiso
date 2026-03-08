'use client';

import type { TRAProject } from '@/lib/tools/tra-types';

interface ProjectStepProps {
  project: TRAProject;
  onChange: (project: TRAProject) => void;
  onNext: () => void;
}

export default function ProjectStep({ project, onChange, onNext }: ProjectStepProps) {
  const update = (field: keyof TRAProject, value: string) => {
    onChange({ ...project, [field]: value });
  };

  const isValid = project.name.trim() && project.company.trim() && project.location.trim() && project.date && project.author.trim();

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-[#091E42] mb-1">Projectgegevens</h2>
      <p className="text-sm text-gray-600 mb-6">
        Vul de basisinformatie in over het project waarvoor u de TRA opstelt.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="tra-name" className="block text-sm font-medium text-[#091E42] mb-1">
            Projectnaam <span className="text-red-500">*</span>
          </label>
          <input
            id="tra-name"
            type="text"
            value={project.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Bijv. Renovatie kantoorpand Hoofdstraat 10"
            className="w-full px-3 py-2 border border-[#d8e2f0] rounded-lg text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="tra-company" className="block text-sm font-medium text-[#091E42] mb-1">
            Bedrijfsnaam <span className="text-red-500">*</span>
          </label>
          <input
            id="tra-company"
            type="text"
            value={project.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Bijv. Bouwbedrijf Jansen B.V."
            className="w-full px-3 py-2 border border-[#d8e2f0] rounded-lg text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="tra-location" className="block text-sm font-medium text-[#091E42] mb-1">
            Locatie <span className="text-red-500">*</span>
          </label>
          <input
            id="tra-location"
            type="text"
            value={project.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="Bijv. Hoofdstraat 10, Amsterdam"
            className="w-full px-3 py-2 border border-[#d8e2f0] rounded-lg text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tra-date" className="block text-sm font-medium text-[#091E42] mb-1">
              Datum <span className="text-red-500">*</span>
            </label>
            <input
              id="tra-date"
              type="date"
              value={project.date}
              onChange={(e) => update('date', e.target.value)}
              className="w-full px-3 py-2 border border-[#d8e2f0] rounded-lg text-[#091E42] focus:outline-none focus:ring-2 focus:ring-[#FF8B00] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="tra-author" className="block text-sm font-medium text-[#091E42] mb-1">
              Opgesteld door <span className="text-red-500">*</span>
            </label>
            <input
              id="tra-author"
              type="text"
              value={project.author}
              onChange={(e) => update('author', e.target.value)}
              placeholder="Uw naam"
              className="w-full px-3 py-2 border border-[#d8e2f0] rounded-lg text-[#091E42] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8B00] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2.5 bg-[#FF8B00] text-white font-semibold rounded-lg hover:bg-[#e67e00] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Volgende →
        </button>
      </div>
    </div>
  );
}
