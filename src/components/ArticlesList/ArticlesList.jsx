// ArticlesList.js
import { useState, useEffect } from 'react';
import './ArticlesList.css';
import { Trash2, ArrowUp, ArrowDown, Printer } from 'lucide-react';

// Import des services
import { 
  fetchArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '../ArticlesList/Service/ArticlesListService';

import { 
  handlePrint, 
  getPriceColor 
} from '../ArticlesList/Service/printService';

import { 
  sortArticlesByDate, 
  filterArticles, 
  validateArticleForm,
  getInitialFormState 
} from '../ArticlesList/utils/ArticlesUtils';

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(getInitialFormState());
  const [search, setSearch] = useState('');
  const [editingPrice, setEditingPrice] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [sortByDate, setSortByDate] = useState(null);
  
  // Nouveaux states pour l'édition de la désignation et du code article
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [tempDesignation, setTempDesignation] = useState('');
  const [editingCode, setEditingCode] = useState(null);
  const [tempCode, setTempCode] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      alert("Erreur lors du chargement des articles");
    }
  };

  const handleDelete = async (idArticle) => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
    try {
      await deleteArticle(idArticle);
      await loadArticles(); // Recharger les articles après suppression
    } catch (error) {
      alert("Erreur lors de la suppression de l'article");
    }
  }
};
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const errors = validateArticleForm(form);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return; // On retourne simplement sans bloquer le formulaire
    }

    try {
      const newArticle = await createArticle(form);
      setArticles(prev => [...prev, newArticle]);
      setForm(getInitialFormState());
    } catch (error) {
      alert("Erreur lors de la création de l'article");
    }
  };

  // Fonctions pour l'édition du prix (existantes)
  const startEditing = (article) => {
    setEditingPrice(article.idArticle);
    setTempPrice(article.prixVenteReel || '');
  };

  const savePrice = async (idArticle) => {
    try {
      const articleToUpdate = articles.find(a => a.idArticle === idArticle);
      if (!articleToUpdate) return;

      const updatedArticle = {
        ...articleToUpdate,
        prixVenteReel: parseFloat(tempPrice) || 0
      };

      await updateArticle(idArticle, updatedArticle);
      await loadArticles();
      
      setEditingPrice(null);
      setTempPrice('');
    } catch (error) {
      alert("Erreur lors de la mise à jour du prix");
    }
  };

  const cancelEditing = () => {
    setEditingPrice(null);
    setTempPrice('');
  };

  const handleKeyPress = (e, idArticle) => {
    if (e.key === 'Enter') {
      savePrice(idArticle);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Fonctions pour l'édition de la désignation
  const startEditingDesignation = (article) => {
    setEditingDesignation(article.idArticle);
    setTempDesignation(article.nomArticle || '');
  };

  const saveDesignation = async (idArticle) => {
    try {
      const articleToUpdate = articles.find(a => a.idArticle === idArticle);
      if (!articleToUpdate) return;

      const updatedArticle = {
        ...articleToUpdate,
        nomArticle: tempDesignation
      };

      await updateArticle(idArticle, updatedArticle);
      await loadArticles();
      
      setEditingDesignation(null);
      setTempDesignation('');
    } catch (error) {
      alert("Erreur lors de la mise à jour de la désignation");
    }
  };

  const cancelEditingDesignation = () => {
    setEditingDesignation(null);
    setTempDesignation('');
  };

  const handleKeyPressDesignation = (e, idArticle) => {
    if (e.key === 'Enter') {
      saveDesignation(idArticle);
    } else if (e.key === 'Escape') {
      cancelEditingDesignation();
    }
  };

  // Fonctions pour l'édition du code article
  const startEditingCode = (article) => {
    setEditingCode(article.idArticle);
    setTempCode(article.codeArticle || '');
  };

  const saveCode = async (idArticle) => {
    try {
      const articleToUpdate = articles.find(a => a.idArticle === idArticle);
      if (!articleToUpdate) return;

      const updatedArticle = {
        ...articleToUpdate,
        codeArticle: tempCode
      };

      await updateArticle(idArticle, updatedArticle);
      await loadArticles();
      
      setEditingCode(null);
      setTempCode('');
    } catch (error) {
      alert("Erreur lors de la mise à jour du code article");
    }
  };

  const cancelEditingCode = () => {
    setEditingCode(null);
    setTempCode('');
  };

  const handleKeyPressCode = (e, idArticle) => {
    if (e.key === 'Enter') {
      saveCode(idArticle);
    } else if (e.key === 'Escape') {
      cancelEditingCode();
    }
  };

  const handleSortByDate = () => {
    setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc');
  };

  // Filtrer et trier les articles
  let filteredArticles = filterArticles(articles, search);
  filteredArticles = sortArticlesByDate(filteredArticles, sortByDate);

   return (
    <div className="container">
      <div className="header-container">
        <h1>Liste des articles</h1>
        <button 
          onClick={() => handlePrint(filteredArticles, search, getPriceColor)}
          className="btn-print no-print"
        >
          <Printer size={16} style={{marginRight: '8px'}} />
          Imprimer
        </button>
      </div>
      
      <div className="form-container no-print">
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label>Fournisseur</label>
              <input 
                name="nomFournisseur" 
                placeholder="Fournisseur" 
                value={form.nomFournisseur} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="form-group">
              <label>Code article</label>
              <input 
                name="codeArticle" 
                placeholder="Code article" 
                value={form.codeArticle} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="form-group">
              <label>Désignation</label>
              <input 
                name="nomArticle" 
                placeholder="Désignation" 
                value={form.nomArticle} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="form-group">
              <label>Quantité</label>
              <input 
                name="quantite" 
                type="double" 
                placeholder="Quantité" 
                value={form.quantite} 
                onChange={handleChange} 
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Date d'achat</label>
              <input 
                name="dateAchat" 
                type="date" 
                value={form.dateAchat} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Prix d'achat HT</label>
              <input 
                name="prixAchatHt" 
                type="number" 
                step="0.01" 
                placeholder="Prix d'achat HT" 
                value={form.prixAchatHt} 
                onChange={handleChange} 
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Taux de TVA achat</label>
              <select name="tva" value={form.tva} onChange={handleChange} required>
                <option value="">Taux de TVA Achat</option>
                <option value="TVA_5_5">5.5%</option>
                <option value="TVA_10">10%</option>
                <option value="TVA_20">20%</option>
              </select>
            </div>
            <div className="form-group">
              <label>Taux de TVA vente</label>
              <select name="tvaVente" value={form.tvaVente} onChange={handleChange} required>
                <option value="">Taux de TVA Vente</option>
                <option value="TVA_5_5">5.5%</option>
                <option value="TVA_10">10%</option>
                <option value="TVA_20">20%</option>
              </select>
            </div>
            <button type="submit" className="btn-submit">Créer</button>
          </div>
        </form>
      </div>

      <div className="search-container no-print">
        <div className="relative">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Rechercher par désignation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <div className="articles-container">
          <div className="article-row header">
            <div className="article-cell">Fournisseur</div>
            <div className="article-cell">Code article</div>
            <div className="article-cell">Désignation</div>
            <div className="article-cell">
              <div className="date-sort-container">
                <span>Date d'achat</span>
                <button 
                  className="sort-button"
                  onClick={handleSortByDate}
                  title={`Trier par date ${sortByDate === 'asc' ? 'décroissante' : 'croissante'}`}
                >
                  {sortByDate === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </button>
              </div>
            </div>
            <div className="article-cell">Quantité</div>
            <div className="article-cell">Prix d'achat HT</div>
            <div className="article-cell">Prix d'achat UHT</div>
            <div className="article-cell">Taux de TVA</div>
            <div className="article-cell">Montant TVA</div>
            <div className="article-cell">Prix d'achat TTC</div>
            <div className="article-cell">Prix d'achat UTTC</div>
            <div className="article-cell">Coefficient majoré x3</div>
            <div className="article-cell">Prix de vente conseillé UTTC</div>
            <div className="article-cell">Prix de Vente Réel</div>
            <div className="article-cell">TVA Vente</div>
            <div className="article-cell no-print">Supprimer</div>
          </div>
          
          {filteredArticles.map(article => (
            <div key={article.idArticle} className="article-row">
              <div className="article-cell">{article.nomFournisseur}</div>
              
              {/* Code article éditable */}
              <div className="article-cell">
                {editingCode === article.idArticle ? (
                  <input
                    type="text"
                    value={tempCode}
                    onChange={(e) => setTempCode(e.target.value)}
                    onKeyPress={(e) => handleKeyPressCode(e, article.idArticle)}
                    onBlur={() => saveCode(article.idArticle)}
                    className="editable-input"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => startEditingCode(article)}
                    className="editable-field"
                    title="Cliquer pour modifier"
                  >
                    {article.codeArticle}
                  </span>
                )}
              </div>
              
              {/* Désignation éditable */}
              <div className="article-cell">
                {editingDesignation === article.idArticle ? (
                  <input
                    type="text"
                    value={tempDesignation}
                    onChange={(e) => setTempDesignation(e.target.value)}
                    onKeyPress={(e) => handleKeyPressDesignation(e, article.idArticle)}
                    onBlur={() => saveDesignation(article.idArticle)}
                    className="editable-input"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => startEditingDesignation(article)}
                    className="editable-field"
                    title="Cliquer pour modifier"
                  >
                    {article.nomArticle}
                  </span>
                )}
              </div>
              
              <div className="article-cell">
                {article.dateAchat ? new Date(article.dateAchat).toLocaleDateString() : ''}
              </div>
              <div className="article-cell">{article.quantite}</div>
              <div className="article-cell">{article.prixAchatHt}</div>
              <div className="article-cell">{article.prixAchatHtUnitaire}</div>
              <div className="article-cell">
                {article.tva === 'TVA_5_5' ? '5.5%' :
                 article.tva === 'TVA_10' ? '10%' :
                 article.tva === 'TVA_20' ? '20%' :
                 article.tva}
              </div>
              <div className="article-cell">{article.montantTva}</div>
              <div className="article-cell">{article.prixAchatTtc}</div>
              <div className="article-cell">{article.prixAchatTtcUnitaire}</div>
              <div className="article-cell">{article.coefficiantMagore}</div>
              <div className="article-cell">{article.prixVenteTtcUnitaire}</div>
              
              {/* Prix de vente réel (existant) */}
              <div className="article-cell">
                {editingPrice === article.idArticle ? (
                  <input
                    type="number"
                    step="0.01"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, article.idArticle)}
                    onBlur={() => savePrice(article.idArticle)}
                    className="price-input"
                    autoFocus
                  />
                ) : (
                <span 
                  onClick={() => startEditing(article)}
                  className={`editable-price ${getPriceColor(article.prixVenteReel, article.prixVenteTtcUnitaire)}`}
                  title="Cliquer pour modifier"
                >
                  {article.prixVenteReel || '0.00'}
                </span>
                )}
              </div>
              
              <div className="article-cell">
                {article.tvaVente === 'TVA_5_5' ? '5.5%' :
                 article.tvaVente === 'TVA_10' ? '10%' :
                 article.tvaVente === 'TVA_20' ? '20%' :
                 article.tvaVente}
              </div>
              <div className="article-cell no-print">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(article.idArticle)}
                  title="Supprimer"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}