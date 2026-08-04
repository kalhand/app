// NEP 2020 stage helpers for the frontend
export function nepStageForGrade(grade) {
  const g = parseInt(String(grade).trim(), 10);
  if (Number.isNaN(g)) return { stage: "General", code: "NA", focus: "Exploration & self-discovery" };
  if (g >= 3 && g <= 5) return { stage: "Preparatory (Grades 3-5)", code: "PREP", focus: "Play-discovery & foundational skills." };
  if (g >= 6 && g <= 8) return { stage: "Middle (Grades 6-8)", code: "MID", focus: "Experiential learning across sciences, arts & vocational tasters." };
  if (g >= 9 && g <= 10) return { stage: "Secondary — Early (Grades 9-10)", code: "SEC1", focus: "Multidisciplinary study, critical thinking, first vocational internship." };
  if (g >= 11 && g <= 12) return { stage: "Secondary — Senior (Grades 11-12)", code: "SEC2", focus: "Choice-based electives across streams, multiple entry-exit options." };
  return { stage: "General", code: "NA", focus: "Exploration & self-discovery" };
}

export function NEPBadge({ grade, className = "" }) {
  const nep = nepStageForGrade(grade);
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 border-2 border-[#0A0A0A] rounded-full bg-[#E9D5FF] ${className}`}>
      <span className="label-mono">NEP 2020 · {nep.code}</span>
      <span className="text-xs font-medium">{nep.stage}</span>
    </div>
  );
}

export const BOARDS = ["CBSE", "ICSE", "PSEB", "State Board", "IB", "IGCSE", "Other"];
