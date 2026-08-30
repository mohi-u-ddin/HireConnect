import { X } from 'lucide-react';
import type { EmploymentType, ExperienceLevel, JobFilters, WorkArrangement } from '../../types';
import { jobCategories } from '../../data/mock/jobs';
import { formatEmploymentType, formatExperienceLevel, formatWorkArrangement } from '../../utils/format';
import { Button } from '../ui/Button';

interface FilterPanelProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  onClear: () => void;
}

const employmentTypes: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
const experienceLevels: ExperienceLevel[] = ['ENTRY_LEVEL', 'MID_LEVEL', 'MID_SENIOR_LEVEL', 'SENIOR_LEVEL', 'LEAD', 'DIRECTOR'];
const workArrangements: WorkArrangement[] = ['ON_SITE', 'REMOTE', 'HYBRID'];

function toggleInArray<T>(arr: T[] = [], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const hasActiveFilters =
    !!filters.employmentType?.length ||
    !!filters.experienceLevel?.length ||
    !!filters.workArrangement?.length ||
    !!filters.category?.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Work Arrangement">
        {workArrangements.map((w) => (
          <FilterCheckbox
            key={w}
            label={formatWorkArrangement(w)}
            checked={!!filters.workArrangement?.includes(w)}
            onChange={() => onChange({ ...filters, workArrangement: toggleInArray(filters.workArrangement, w) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Job Type">
        {employmentTypes.map((t) => (
          <FilterCheckbox
            key={t}
            label={formatEmploymentType(t)}
            checked={!!filters.employmentType?.includes(t)}
            onChange={() => onChange({ ...filters, employmentType: toggleInArray(filters.employmentType, t) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Experience Level">
        {experienceLevels.map((e) => (
          <FilterCheckbox
            key={e}
            label={formatExperienceLevel(e)}
            checked={!!filters.experienceLevel?.includes(e)}
            onChange={() => onChange({ ...filters, experienceLevel: toggleInArray(filters.experienceLevel, e) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Category">
        {jobCategories.map((c) => (
          <FilterCheckbox
            key={c}
            label={c}
            checked={!!filters.category?.includes(c)}
            onChange={() => onChange({ ...filters, category: toggleInArray(filters.category, c) })}
          />
        ))}
      </FilterGroup>

      <Button variant="outline" fullWidth onClick={onClear} className="sm:hidden">
        Reset Filters
      </Button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30 focus:ring-2"
      />
      {label}
    </label>
  );
}
