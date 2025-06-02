  {showSuggestions && suggestions.length > 0 && (
    <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
      <ul className="py-1 max-h-60 overflow-auto">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  )} 