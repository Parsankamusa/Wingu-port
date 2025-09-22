import React, { useState } from "react";
import Button from "../../../../components/common/Button";
import { 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  X,
  Plane,
  Wrench,
  Users,
  Shield,
  Building,
  Briefcase,
  Truck,
  BookOpen,
  MapPin
} from "lucide-react";
import { Slider, Chip } from "@mui/material";

const aviationDepartments = [
  { value: "Flight Operations", icon: <Plane className="w-4 h-4" /> },
  { value: "Aircraft Maintenance & Engineering", icon: <Wrench className="w-4 h-4" /> },
  { value: "Ground Operations", icon: <Users className="w-4 h-4" /> },
  { value: "Cabin Crew Services", icon: <Users className="w-4 h-4" /> },
  { value: "Air Traffic Control", icon: <Shield className="w-4 h-4" /> },
  { value: "Airport Management", icon: <Building className="w-4 h-4" /> },
  { value: "Aviation Safety & Security", icon: <Shield className="w-4 h-4" /> },
  { value: "Corporate & Administration", icon: <Briefcase className="w-4 h-4" /> },
  { value: "Sales & Marketing", icon: <Briefcase className="w-4 h-4" /> },
  { value: "Cargo & Logistics", icon: <Truck className="w-4 h-4" /> },
  { value: "Training & Development", icon: <BookOpen className="w-4 h-4" /> },
  { value: "Unmanned Aerial Systems (Drones)", icon: <Plane className="w-4 h-4" /> },
  { value: "Other", icon: <Briefcase className="w-4 h-4" /> },
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

const aircraftTypes = [
  { id: "commercial", label: "Commercial" },
  { id: "cargo", label: "Cargo" },
  { id: "private", label: "Private" },
  { id: "military", label: "Military" },
  { id: "helicopter", label: "Helicopter" },
  { id: "uav", label: "UAV/Drones" },
];

const salaryRanges = [
  { label: "Under $30K", min: 0, max: 30000 },
  { label: "$30K - $50K", min: 30000, max: 50000 },
  { label: "$50K - $80K", min: 50000, max: 80000 },
  { label: "$80K - $100K", min: 80000, max: 100000 },
  { label: "Over $100K", min: 100000, max: 200000 },
];

const SideFilters = ({
  filters,
  handleFilterChange,
  resetFilters,
  handleCheckboxChange,
  applyFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    department: true,
    jobType: true,
    experience: true,
    aircraft: false,
    workArrangement: true,
    salary: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSalaryChange = (event, newValue) => {
    handleFilterChange("min_salary", newValue[0]);
    handleFilterChange("max_salary", newValue[1]);
  };

  const handleSalaryRangeClick = (min, max) => {
    handleFilterChange("min_salary", min);
    handleFilterChange("max_salary", max);
  };

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    // Skip page and page_size from count
    if (key === 'page' || key === 'page_size') return count;
    
    if (Array.isArray(value)) return count + value.length;
    if (typeof value === 'boolean') return count + (value ? 1 : 0);
    if (typeof value === 'number') return count + (value > 0 ? 1 : 0);
    return count + (value ? 1 : 0);
  }, 0);

  const clearFilter = (filterType, value = null) => {
    if (filterType === 'min_salary' || filterType === 'max_salary') {
      handleFilterChange('min_salary', '');
      handleFilterChange('max_salary', '');
    } else if (Array.isArray(filters[filterType])) {
      if (value) {
        handleCheckboxChange(filterType, value);
      } else {
        // Clear all values for this filter type
        filters[filterType].forEach(val => {
          handleCheckboxChange(filterType, val);
        });
      }
    } else {
      handleFilterChange(filterType, '');
    }
  };

  return (
    <aside className="lg:col-span-4 xl:col-span-3">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2" /> 
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>
          <Button 
            variant="link" 
            size="sm" 
            onClick={resetFilters}
            className="flex items-center text-gray-500 hover:text-primary-600"
          >
            <X className="w-4 h-4 mr-1" /> Clear all
          </Button>
        </div>

        <div className="space-y-4">
          {/* Department Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection('department')}
            >
              <h4 className="font-semibold text-gray-800">Department</h4>
              {expandedSections.department ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.department && (
              <div className="p-4">
                <select
                  value={filters.department || ''}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Departments</option>
                  {aviationDepartments.map((dep) => (
                    <option key={dep.value} value={dep.value}>
                      {dep.value}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Job Type Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection('jobType')}
            >
              <h4 className="font-semibold text-gray-800">Job Type</h4>
              {expandedSections.jobType ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.jobType && (
              <div className="p-4 space-y-3">
                {jobTypes.map((type) => (
                  <CheckboxItem
                    key={type.id}
                    id={`job-type-${type.id}`}
                    label={type.label}
                    checked={filters.job_type?.includes(type.id) || false}
                    onChange={() => handleCheckboxChange("job_type", type.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Experience Level Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection('experience')}
            >
              <h4 className="font-semibold text-gray-800">Experience Level</h4>
              {expandedSections.experience ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.experience && (
              <div className="p-4 space-y-3">
                {experienceLevels.map((level) => (
                  <CheckboxItem
                    key={level.id}
                    id={`exp-${level.id}`}
                    label={level.label}
                    checked={filters.experience_level?.includes(level.id) || false}
                    onChange={() => handleCheckboxChange("experience_level", level.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Aircraft Type Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection('aircraft')}
            >
              <h4 className="font-semibold text-gray-800">Aircraft Type</h4>
              {expandedSections.aircraft ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.aircraft && (
              <div className="p-4 space-y-3">
                {aircraftTypes.map((type) => (
                  <CheckboxItem
                    key={type.id}
                    id={`aircraft-${type.id}`}
                    label={type.label}
                    checked={filters.aircraft_type?.includes(type.id) || false}
                    onChange={() => handleCheckboxChange("aircraft_type", type.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Work Arrangement Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection('workArrangement')}
            >
              <h4 className="font-semibold text-gray-800">Work Arrangement</h4>
              {expandedSections.workArrangement ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.workArrangement && (
              <div className="p-4">
                <CheckboxItem
                  id="is_remote"
                  label="Remote Only"
                  checked={filters.is_remote || false}
                  onChange={() => handleFilterChange("is_remote", !filters.is_remote)}
                />
              </div>
            )}
          </div>

          {/* Salary Range Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100"
              onClick={() => toggleSection('salary')}
            >
              <h4 className="font-semibold text-gray-800">Salary Range</h4>
              {expandedSections.salary ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections.salary && (
              <div className="p-4">
                <div className="mb-4">
                  <Slider
                    value={[filters.min_salary || 0, filters.max_salary || 200000]}
                    onChange={handleSalaryChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    min={0}
                    max={200000}
                    step={5000}
                    className="text-primary-600"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>${(filters.min_salary || 0).toLocaleString()}</span>
                  <span>${(filters.max_salary || 200000).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {salaryRanges.map((range) => (
                    <Chip
                      key={range.label}
                      label={range.label}
                      onClick={() => handleSalaryRangeClick(range.min, range.max)}
                      variant={
                        filters.min_salary === range.min && filters.max_salary === range.max 
                          ? "filled" 
                          : "outlined"
                      }
                      color="primary"
                      size="small"
                      className="text-xs"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={applyFilters} fullWidth className="mt-6 py-3">
          Apply Filters
        </Button>

        {/* Active filters display */}
        {activeFilterCount > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.department && (
                <Chip
                  label={`Department: ${filters.department}`}
                  onDelete={() => clearFilter('department')}
                  size="small"
                  variant="outlined"
                />
              )}
              {filters.job_type?.map(type => (
                <Chip
                  key={type}
                  label={`Job: ${jobTypes.find(t => t.id === type)?.label}`}
                  onDelete={() => clearFilter('job_type', type)}
                  size="small"
                  variant="outlined"
                />
              ))}
              {filters.experience_level?.map(level => (
                <Chip
                  key={level}
                  label={`Exp: ${experienceLevels.find(l => l.id === level)?.label}`}
                  onDelete={() => clearFilter('experience_level', level)}
                  size="small"
                  variant="outlined"
                />
              ))}
              {filters.aircraft_type?.map(type => (
                <Chip
                  key={type}
                  label={`Aircraft: ${aircraftTypes.find(t => t.id === type)?.label}`}
                  onDelete={() => clearFilter('aircraft_type', type)}
                  size="small"
                  variant="outlined"
                />
              ))}
              {filters.is_remote && (
                <Chip
                  label="Remote Only"
                  onDelete={() => clearFilter('is_remote')}
                  size="small"
                  variant="outlined"
                />
              )}
              {(filters.min_salary || filters.max_salary) && (
                <Chip
                  label={`Salary: $${(filters.min_salary || 0).toLocaleString()} - $${(filters.max_salary || 200000).toLocaleString()}`}
                  onDelete={() => clearFilter('min_salary')}
                  size="small"
                  variant="outlined"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideFilters;

const CheckboxItem = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
    />
    <label htmlFor={id} className="ml-3 text-sm text-gray-700 cursor-pointer">
      {label}
    </label>
  </div>
);