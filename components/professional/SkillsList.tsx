import React from "react";
import { Wrench } from "lucide-react";

interface SkillsListProps {
  skillsStr: string;
}

export function SkillsList({ skillsStr }: SkillsListProps) {
  const skills = skillsStr
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (skills.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Wrench size={18} className="text-teal-600" /> 
        Expertise & Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span 
            key={i} 
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
