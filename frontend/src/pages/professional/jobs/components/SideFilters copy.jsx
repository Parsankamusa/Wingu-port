import React from "react";
import Button from "../../../../components/common/Button";
import { SlidersHorizontal } from "lucide-react";

const aviationDepartments = [
  "Flight Operations",
  "Aircraft Maintenance & Engineering",
  "Ground Operations",
  "Cabin Crew Services",
  "Air Traffic Control",
  "Airport Management",
  "Aviation Safety & Security",
  "Corporate & Administration",
  "Sales & Marketing",
  "Cargo & Logistics",
  "Training & Development",
  "Unmanned Aerial Systems (Drones)",
  "Other",
];

const jobTypes = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "temporary", label: "Temporary" },
];

const experienceLevels = [
  { id: "entry", label: "Entry Level (0-2 years)" },
  { id: "mid", label: "Mid Level (3-5 years)" },
  { id: "senior", label: "Senior Level (6-10 years)" },
  { id: "executive", label: "Executive (10+ years)" },
];

const SideFilters = ({
  filters,
  handleFilterChange,
  resetFilters,
  handleCheckboxChange,
  applyFilters,
}) => {
  return (
    <aside className="lg:col-span-4 xl:col-span-3">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2" /> Filters
          </h3>
          <Button variant="link" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
        <div className="space-y-6">
          <FilterSection title="Department">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Departments</option>
              {aviationDepartments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </FilterSection>
          <FilterSection title="Job Type">
            {jobTypes.map((type) => (
              <CheckboxItem
                key={type.id}
                id={type.id}
                label={type.label}
                checked={filters.job_type.includes(type.id)}
                onChange={() => handleCheckboxChange("job_type", type.id)}
              />
            ))}
          </FilterSection>
          <FilterSection title="Experience Level">
            {experienceLevels.map((level) => (
              <CheckboxItem
                key={level.id}
                id={level.id}
                label={level.label}
                checked={filters.experience_level.includes(level.id)}
                onChange={() =>
                  handleCheckboxChange("experience_level", level.id)
                }
              />
            ))}
          </FilterSection>
          <FilterSection title="Work Arrangement">
            <CheckboxItem
              id="is_remote"
              label="Remote Only"
              checked={filters.is_remote}
              onChange={() =>
                handleFilterChange("is_remote", !filters.is_remote)
              }
            />
          </FilterSection>
        </div>
        <Button onClick={applyFilters} fullWidth className="mt-8">
          Apply Filters
        </Button>
      </div>
    </aside>
  );
};

export default SideFilters;

const FilterSection = ({ title, children }) => (
  <div className="border-t pt-4 first:border-t-0 first:pt-0">
    <h4 className="font-semibold mb-3">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const CheckboxItem = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
    />
    <label htmlFor={id} className="ml-3 text-sm text-gray-600">
      {label}
    </label>
  </div>
);
