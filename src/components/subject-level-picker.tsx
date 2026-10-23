"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADE_LEVEL_LABELS, GRADE_LEVELS } from "@/lib/constants";

export type SubjectLevelRow = { subjectId: string; level: string };

export function SubjectLevelPicker({
  subjectOptions,
  initialRows,
}: {
  subjectOptions: { id: string; name: string }[];
  initialRows: SubjectLevelRow[];
}) {
  const [rows, setRows] = useState<SubjectLevelRow[]>(
    initialRows.length > 0
      ? initialRows
      : [{ subjectId: "", level: "" }],
  );

  function updateRow(index: number, patch: Partial<SubjectLevelRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { subjectId: "", level: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const validRows = rows.filter((r) => r.subjectId && r.level);

  return (
    <div className="space-y-3">
      <input type="hidden" name="subjectsJson" value={JSON.stringify(validRows)} />
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <Select
            value={row.subjectId}
            onValueChange={(v) => updateRow(i, { subjectId: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกวิชา" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={row.level} onValueChange={(v) => updateRow(i, { level: v })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ระดับชั้น" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {GRADE_LEVEL_LABELS[lvl]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            className="btn-danger px-2.5 py-1.5 text-xs"
            onClick={() => removeRow(i)}
            disabled={rows.length === 1}
          >
            ลบ
          </button>
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={addRow}>
        + เพิ่มวิชา
      </button>
    </div>
  );
}
