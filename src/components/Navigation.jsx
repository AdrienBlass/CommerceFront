export default function Navigation({ currentPage, onPageChange }) {
  const handleNavigation = (page) => {
    onPageChange(page);
  };

  return (
    <nav className="navigation">
      <div className="nav-container no-print">
        <button 
          onClick={() => handleNavigation('articles')}
          className={`nav-link ${currentPage === 'articles' ? 'active' : ''}`}
        >
          Liste Articles
        </button>
        <button 
          onClick={() => handleNavigation('composition')}
          className={`nav-link ${currentPage === 'composition' ? 'active' : ''}`}
        >
          Compositions
        </button>
      </div>
    </nav>
  );
}