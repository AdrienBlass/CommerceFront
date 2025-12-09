import { useState, useEffect } from 'react';
import './Fournisseurs.css';
import { Search } from 'lucide-react';

// Import des services
import { 
  fetchArticles 
} from '../ArticlesList/Service/ArticlesListService';

export default function Fournisseurs() {
  const [articles, setArticles] = useState([]);
  const [searchFournisseur, setSearchFournisseur] = useState('');
  const [searchArticle, setSearchArticle] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
      alert("Erreur lors du chargement des articles");
    }
  };

  // Filtrer les articles selon les deux recherches
  const filteredArticles = articles.filter(article => {
    const fournisseurMatch = !searchFournisseur || 
      (article.nomFournisseur && article.nomFournisseur.toLowerCase().includes(searchFournisseur.toLowerCase()));
    
    const articleMatch = !searchArticle || 
      (article.nomArticle && article.nomArticle.toLowerCase().includes(searchArticle.toLowerCase()));
    
    return fournisseurMatch && articleMatch;
  });

  // Grouper les articles par fournisseur
  const articlesByFournisseur = filteredArticles.reduce((acc, article) => {
    const fournisseur = article.nomFournisseur || 'Non spécifié';
    if (!acc[fournisseur]) {
      acc[fournisseur] = [];
    }
    acc[fournisseur].push(article);
    return acc;
  }, {});

  return (
    <div className="fournisseurs-container">
      {/* En-tête */}
      <div className="fournisseurs-header">
        <h1 className="fournisseurs-title">Liste des produits de chaque fournisseur</h1>
      </div>

      {/* Deux barres de recherche */}
      <div className="fournisseurs-search-container">
        <div className="fournisseurs-search-grid">
          {/* Recherche par fournisseur */}
          <div className="fournisseurs-search-group">
            <label className="fournisseurs-search-label">Rechercher par fournisseur</label>
            <div className="fournisseurs-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Nom du fournisseur..."
                value={searchFournisseur}
                onChange={(e) => setSearchFournisseur(e.target.value)}
                className="fournisseurs-search-input"
              />
              {searchFournisseur && (
                <button 
                  className="fournisseurs-search-clear"
                  onClick={() => setSearchFournisseur('')}
                  title="Effacer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Recherche par article */}
          <div className="fournisseurs-search-group">
            <label className="fournisseurs-search-label">Rechercher par article</label>
            <div className="fournisseurs-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Nom de l'article..."
                value={searchArticle}
                onChange={(e) => setSearchArticle(e.target.value)}
                className="fournisseurs-search-input"
              />
              {searchArticle && (
                <button 
                  className="fournisseurs-search-clear"
                  onClick={() => setSearchArticle('')}
                  title="Effacer"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Boutons pour effacer les recherches */}
        {(searchFournisseur || searchArticle) && (
          <div className="fournisseurs-search-actions">
            <button 
              className="fournisseurs-clear-all-btn"
              onClick={() => {
                setSearchFournisseur('');
                setSearchArticle('');
              }}
            >
              Effacer toutes les recherches
            </button>
          </div>
        )}
      </div>

      {/* Tableau par fournisseur */}
      <div className="fournisseurs-table-wrapper">
        {Object.keys(articlesByFournisseur).length === 0 ? (
          <div className="fournisseurs-empty">
            {searchFournisseur || searchArticle ? 
              'Aucun résultat trouvé avec les filtres actuels' : 
              'Aucun fournisseur disponible'}
          </div>
        ) : (
          Object.entries(articlesByFournisseur).map(([fournisseur, articlesList]) => (
            <div key={fournisseur} className="fournisseurs-group">
              {/* En-tête du fournisseur */}
              <div className="fournisseurs-group-header">
                <h2 className="fournisseurs-group-title">{fournisseur}</h2>
                <div className="fournisseurs-group-count">
                  {articlesList.length} article{articlesList.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* Tableau des articles pour ce fournisseur */}
              <div className="fournisseurs-table-container">
                <div className="fournisseurs-table-header">
                  <div className="fournisseurs-table-cell">Désignation</div>
                  <div className="fournisseurs-table-cell">Prix d'achat HT</div>
                  <div className="fournisseurs-table-cell">Prix d'achat UHT</div>
                  <div className="fournisseurs-table-cell">Taux de TVA</div>
                  <div className="fournisseurs-table-cell">Montant TVA</div>
                  <div className="fournisseurs-table-cell">Prix d'achat TTC</div>
                  <div className="fournisseurs-table-cell">Prix d'achat UTTC</div>
                </div>

                {articlesList.map(article => (
                  <div key={article.idArticle} className="fournisseurs-table-row">
                    <div className="fournisseurs-table-cell">{article.nomArticle}</div>
                    <div className="fournisseurs-table-cell">{parseFloat(article.prixAchatHt || 0).toFixed(2)}</div>
                    <div className="fournisseurs-table-cell">{parseFloat(article.prixAchatHtUnitaire || 0).toFixed(2)}</div>
                    <div className="fournisseurs-table-cell">
                      {article.tva === 'TVA_5_5' ? '5.5%' :
                       article.tva === 'TVA_10' ? '10%' :
                       article.tva === 'TVA_20' ? '20%' :
                       article.tva}
                    </div>
                    <div className="fournisseurs-table-cell">{parseFloat(article.montantTva || 0).toFixed(2)}</div>
                    <div className="fournisseurs-table-cell">{parseFloat(article.prixAchatTtc || 0).toFixed(2)}</div>
                    <div className="fournisseurs-table-cell">{parseFloat(article.prixAchatTtcUnitaire || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}