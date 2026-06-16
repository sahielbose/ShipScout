"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";

// Detected skills (CONTEXT.md section 3.4): editable, removable, reorderable by
// drag. Chips are the retrieval anchors, so changing them re-runs retrieval.
export function SkillChips() {
  const skills = useAppStore((s) => s.skills);
  const addSkill = useAppStore((s) => s.addSkill);
  const removeSkill = useAppStore((s) => s.removeSkill);
  const reorderSkills = useAppStore((s) => s.reorderSkills);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const onAdd = () => {
    const v = window.prompt("Add a capability to match on:");
    if (v && v.trim()) addSkill(v.trim());
  };

  return (
    <>
      <div className="sh" style={{ marginTop: 6 }}>
        <span className="grp gl" style={{ margin: 0 }}>
          Skills
        </span>
        <span className="add" onClick={onAdd}>
          + Add
        </span>
      </div>
      <div>
        {skills.map((sk, i) => (
          <div
            key={sk + i}
            className={`skl-row ${dragIdx === i ? "drag" : ""}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragEnd={() => setDragIdx(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIdx !== null && dragIdx !== i) reorderSkills(dragIdx, i);
              setDragIdx(null);
            }}
          >
            <span className="gp">::</span>
            <span className="n">{i + 1}</span>
            <span className="nm">{sk}</span>
            <span
              className="rm"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(i);
              }}
            >
              x
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
