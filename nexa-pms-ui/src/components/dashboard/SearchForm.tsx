import React from 'react';
import { Search } from 'lucide-react';

interface SearchFormProps {
  searchLocation: string;
  searchCategory: string;
  setSearchLocation: (val: string) => void;
  setSearchCategory: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
  loading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchLocation, searchCategory, setSearchLocation, setSearchCategory, onSearch, loading
}) => {
  return (
    <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
      <div className="flex gap-3 flex-1 lg:w-[480px]">
        <div className="relative group w-[40%] sm:w-1/3">
          <select 
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="pl-4 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl w-full shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-slate-700 appearance-none h-full cursor-pointer"
          >
            <option value="any">All Industries</option>
            <option value="hotel">Hotels & Lodging</option>
            <option value="restaurant">Restaurants</option>
            <option value="real_estate_agency">Real Estate</option>
            <option value="hospital">Hospitals</option>
          </select>
        </div>
        <div className="relative group w-[60%] sm:w-2/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="e.g., Hotels in Cairo..." 
            value={searchLocation} 
            onChange={(e) => setSearchLocation(e.target.value)} 
            className="pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl w-full shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder-slate-400" 
          />
        </div>
      </div>
      <button 
        type="submit" 
        disabled={loading} 
        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-sm hover:shadow-md hover:bg-slate-800 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
        Find Leads
      </button>
    </form>
  );
};
