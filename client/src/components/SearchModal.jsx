import { useEffect } from 'react';

function SearchModal({
  isModalOpen,
  onClose,
  searchInput,
  searchInputHandler,
  searchResults,
  isLoading,
  searchError,
  onSelectUser,
}) {
  // Close modal when pressing Escape
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;

  return (
    // Clicking the backdrop closes the modal
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-20"
    >
      {/* Prevent clicks inside the modal from closing it */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="w-full flex justify-between items-center gap-4 bg-blue-800 px-3 py-2.5">
          <p id="search-modal-title" className="text-white font-medium">
            Find People To Chat
          </p>

          <button
            id="close-search"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="font-bold text-red-400 hover:text-red-300 cursor-pointer px-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="w-full flex flex-col p-3 gap-3">
          {/* Search Input */}
          <div className="w-full flex items-center gap-2 border border-slate-400 rounded-md px-2.5 py-1.5 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
            <span className="text-xl text-slate-500 select-none">⌕</span>

            <input
              id="search-input"
              type="text"
              placeholder="Search by name, username or email..."
              value={searchInput}
              onChange={searchInputHandler}
              autoFocus
              aria-label="Search users"
              className="w-full flex-1 outline-none text-sm"
            />
          </div>

          {/* Search Results / Status */}
          <div
            className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1"
            aria-live="polite"
          >
            {/* Initial state */}
            {!searchInput.trim() && (
              <p className="text-sm text-slate-500 text-center py-4">
                Start typing to find people.
              </p>
            )}

            {/* Loading state */}
            {searchInput.trim() && isLoading && (
              <p className="text-sm text-slate-500 text-center py-4">
                Searching users...
              </p>
            )}

            {/* Error state */}
            {searchError && !isLoading && (
              <p className="text-sm text-red-500 text-center py-4">
                {searchError}
              </p>
            )}

            {/* Empty results state */}
            {searchInput.trim() &&
              !isLoading &&
              !searchError &&
              searchResults.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No users found.
                </p>
              )}

            {/* User results */}
            {!isLoading &&
              searchResults.map((person, index) => (
                <button
                  key={person._id || person.id || person.username}
                  id={`user-result-${person._id}`}
                  type="button"
                  onClick={() => onSelectUser(person)}
                  disabled={!onSelectUser}
                  style={{
                    animationDelay: `${Math.min(index * 45, 300)}ms`,
                  }}
                  className="opacity-0 animate-fade-slide-in flex w-full items-center gap-3 border border-slate-200 rounded-md p-2 text-left hover:shadow-md hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 shrink-0 border border-slate-200 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt={person.fullName || person.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-slate-500">
                        {(person.fullName || person.username || '?')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User Details */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-bold text-slate-900 truncate">
                      {person.fullName}
                    </span>

                    <span className="text-sm text-slate-600 truncate">
                      @{person.username}
                    </span>

                    <span className="text-sm text-slate-500 truncate">
                      {person.email}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
