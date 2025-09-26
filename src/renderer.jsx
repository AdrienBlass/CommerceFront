import { createRoot } from "react-dom/client";
import { useState } from "react";
import Navigation from "./components/Navigation";
import ArticlesList from "./components/ArticlesList";
import './index.css'

const App = () => {
  const [currentPage, setCurrentPage] = useState('articles');

  const renderPage = () => {
    switch(currentPage) {
      case 'articles':
        return <ArticlesList />;
      case 'fournisseurs':
        return <div>Page Fournisseurs - En construction</div>;
      default:
        return <ArticlesList />;
    }
  };

  return (
    <div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App/>);