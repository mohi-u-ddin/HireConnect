import { Search, MapPin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from './Button';

interface SearchBarProps {
  initialKeyword?: string;
  initialLocation?: string;
  onSearch: (keyword: string, location: string) => void;
  size?: 'default' | 'large';
}

export function SearchBar({ initialKeyword = '', initialLocation = '', onSearch, size = 'default' }: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(keyword, location);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-3 sm:gap-0 bg-white dark:bg-slate-900 rounded-xl sm:rounded-full border border-slate-200 dark:border-slate-800 shadow-card p-2 ${
        size === 'large' ? 'sm:p-2.5' : ''
      }`}
    >
      <div className="flex items-center flex-1 px-3 sm:px-4 gap-2.5">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, keywords, or company"
          aria-label="Search jobs by keyword"
          className="w-full bg-transparent text-sm py-2.5 sm:py-3 focus:outline-none placeholder:text-slate-400"
        />
      </div>
      <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-800 my-2" />
      <div className="flex items-center flex-1 px-3 sm:px-4 gap-2.5 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0">
        <MapPin size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or 'Remote'"
          aria-label="Search jobs by location"
          className="w-full bg-transparent text-sm py-2.5 sm:py-3 focus:outline-none placeholder:text-slate-400"
        />
      </div>
      <Button type="submit" size="lg" className="sm:rounded-full w-full sm:w-auto">
        Search Jobs
      </Button>
    </form>
  );
}
