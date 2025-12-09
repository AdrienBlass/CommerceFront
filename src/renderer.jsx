import { createRoot } from "react-dom/client";
import { useState } from "react";
import Navigation from "./components/Navigation";
import ArticlesList from "./components/ArticlesList/ArticlesList";
import './index.css'
import Composition from "./components/Compositions/Composition";
import Fournisseurs from "./components/Fournisseurs/Fournisseurs ";
import Inventaire from "./components/Inventaire/Inventaire";
const App = () => {
  const [currentPage, setCurrentPage] = useState('articles');

  const renderPage = () => {
    switch(currentPage) {
      case 'articles':
        return <ArticlesList />;
      case 'composition':
        return <Composition />;
      case 'fournisseurs':
        return <Fournisseurs />;
      case 'inventaire':
        return <Inventaire />;
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