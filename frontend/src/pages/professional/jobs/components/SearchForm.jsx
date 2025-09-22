import { MapPin, Search } from "lucide-react";
import Button from "../../../../components/common/Button";

const SearchForm = ({ filters, handleFilterChange, applyFilters }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8"
    >
      <div className="grid md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Job title or keyword"
            value={filters.query}
            onChange={(e) => handleFilterChange("query", e.target.value)}
            className="w-full pl-12 p-3 border rounded-lg bg-secondary-50 focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="md:col-span-5 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="City, country, or remote"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full pl-12 p-3 border rounded-lg bg-secondary-50 focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" fullWidth size="lg">
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
