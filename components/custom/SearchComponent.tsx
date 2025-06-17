"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchComponent = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchInput.trim() !== "") {
      router.push(`/search?query=${searchInput}`);
    }
    setSearchInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Search Container */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
        <div className="flex items-center">
          {/* Search Icon */}
          <div className="pl-6 pr-2">
            <Search className="h-5 w-5 text-blue-400" />
          </div>
          
          {/* Input Field */}
          <input
            className="flex-grow bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 py-4 pr-2 text-lg font-medium"
            placeholder="Search for courses, topics, or skills..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          
          {/* Search Button */}
          <button
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white px-8 py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/btn relative overflow-hidden"
            disabled={searchInput.trim() === ""}
            onClick={handleSearch}
          >
            {/* Button Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4 group-hover/btn:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Search</span>
            </div>
          </button>
        </div>
        
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Popular Searches */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['Web Development', 'Data Science', 'Design', 'Marketing'].map((term) => (
          <button
            key={term}
            onClick={() => {
              setSearchInput(term);
              router.push(`/search?query=${term}`);
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-sm text-white/90 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchComponent;