import { useState, useEffect } from 'react';
import './Composition.css';
import { Trash2, Edit, Search, X } from 'lucide-react';

import { 
  fetchCompositions, 
  createComposition, 
  updateComposition, 
  deleteComposition,
  fetchArticles 
} from './Service/CompositionService';

import { 
  validateCompositionForm,
  getInitialFormState,
  filterCompositions,
  calculateCompositionCosts,
  filterArticles 
} from './Utils/CompositionUtils';

export default function Composition() {
  const [compositions, setCompositions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(getInitialFormState());
  const [search, setSearch] = useState('');
  const [editingComposition, setEditingComposition] = useState(null);
  const [tempComposition, setTempComposition] = useState({});
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredComposition, setHoveredComposition] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [editingPrice, setEditingPrice] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  useEffect(() => {
    loadCompositions();
    loadArticles();
  }, []);

  const startEditingPrice = (composition) => {
  setEditingPrice(composition.idComposition);
  setTempPrice(composition.prixVenteReel || '');
};

const savePrice = async (idComposition) => {
  try {
    const compositionToUpdate = compositions.find(c => c.idComposition === idComposition);
    if (!compositionToUpdate) return;

    const updatedComposition = {
      ...compositionToUpdate,
      prixVenteReel: parseFloat(tempPrice) || 0
    };

    await updateComposition(idComposition, updatedComposition);
    await loadCompositions();
    
    setEditingPrice(null);
    setTempPrice('');
  } catch (error) {
    console.error('Erreur:', error);
    alert("Erreur lors de la mise à jour du prix");
  }
};

const cancelEditingPrice = () => {
  setEditingPrice(null);
  setTempPrice('');
};

const handleKeyPressPrice = (e, idComposition) => {
  if (e.key === 'Enter') {
    savePrice(idComposition);
  } else if (e.key === 'Escape') {
    cancelEditingPrice();
  }
};

// Fonction pour déterminer la couleur du prix
const getPriceColor = (prixVenteReel, prixVenteConseille) => {
  if (!prixVenteReel || prixVenteReel === 0) return 'text-black';
  if (prixVenteReel < prixVenteConseille) return 'text-red-500';
  if (prixVenteReel > prixVenteConseille) return 'text-green-500';
  return 'text-black';
};
const loadCompositions = async () => {
  try {
    const data = await fetchCompositions();
    
    // Pour chaque composition, charger les détails des articles
    const compositionsWithIngredients = await Promise.all(
      data.map(async (composition) => {
        if (composition.ingredientIds && composition.ingredientIds.length > 0) {
          try {
            const ingredients = await fetchArticlesByIds(composition.ingredientIds);
            return {
              ...composition,
              ingredients: ingredients
            };
          } catch (error) {
            console.error(`Erreur chargement ingrédients pour ${composition.nom}:`, error);
            return {
              ...composition,
              ingredients: []
            };
          }
        } else {
          return {
            ...composition,
            ingredients: []
          };
        }
      })
    );
    
    setCompositions(compositionsWithIngredients);
  } catch (error) {
    console.error('Erreur:', error);
    alert("Erreur lors du chargement des compositions");
  }
};

  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur lors du chargement des articles");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleIngredientToggle = (article) => {
    setSelectedIngredients(prev => {
      const isAlreadySelected = prev.find(a => a.idArticle === article.idArticle);
      if (isAlreadySelected) {
        return prev.filter(a => a.idArticle !== article.idArticle);
      } else {
        return [...prev, article];
      }
    });
  };

  const isIngredientSelected = (articleId) => {
    return selectedIngredients.some(a => a.idArticle === articleId);
  };

  const removeIngredient = (articleId) => {
    setSelectedIngredients(prev => prev.filter(a => a.idArticle !== articleId));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const errors = validateCompositionForm(form, selectedIngredients);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      // Calculer les prix automatiquement
      const costs = calculateCompositionCosts(selectedIngredients);
      
      // Créer l'objet composition selon le modèle backend
      const compositionData = {
        nom: form.nomComposition,
        ingredients: selectedIngredients,
        prixHtUnitaire: costs.prixHtUnitaire,
        prixTtcUnitaire: costs.prixTtcUnitaire
      };
      
      console.log('Données envoyées:', compositionData);
      
      const newComposition = await createComposition(compositionData);
      setCompositions(prev => [...prev, newComposition]);
      setForm(getInitialFormState());
      setSelectedIngredients([]);
      setIngredientSearch('');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      alert("Erreur lors de la création de la composition: " + error.message);
    }
  };

  // Fonctions pour l'édition du nom
  const startEditing = (composition) => {
    setEditingComposition(composition.idComposition);
    setTempComposition({
      nom: composition.nom
    });
  };

  const saveComposition = async (idComposition) => {
    try {
      const compositionToUpdate = compositions.find(c => c.idComposition === idComposition);
      if (!compositionToUpdate) return;

      const updatedComposition = {
        ...compositionToUpdate,
        ...tempComposition
      };

      await updateComposition(idComposition, updatedComposition);
      await loadCompositions();
      
      setEditingComposition(null);
      setTempComposition({});
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur lors de la mise à jour de la composition");
    }
  };

  const cancelEditing = () => {
    setEditingComposition(null);
    setTempComposition({});
  };

  const handleKeyPress = (e, idComposition) => {
    if (e.key === 'Enter') {
      saveComposition(idComposition);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleDelete = async (idComposition) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette composition ?")) {
      try {
        await deleteComposition(idComposition);
        await loadCompositions();
      } catch (error) {
        console.error('Erreur:', error);
        alert("Erreur lors de la suppression de la composition");
      }
    }
  };

  // Filtrer les articles pour la recherche d'ingrédients
  const filteredArticles = filterArticles(articles, ingredientSearch);

  // Filtrer les compositions
  const filteredCompositions = filterCompositions(compositions, search);

  const costs = calculateCompositionCosts(selectedIngredients);

  return (
    <div className="composition-page">
      <div className="composition-container">
        <div className="composition-header-container">
          <h1 className="composition-title">Gestion des Compositions</h1>
        </div>
        
        {/* Formulaire de création */}
        <div className="composition-form-container">
          <form onSubmit={handleCreate}>
            <div className="composition-form-main">
              <div className="composition-form-group">
                <label>Nom de la composition *</label>
                <input 
                  name="nomComposition" 
                  placeholder="Nom de la composition" 
                  value={form.nomComposition} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <button 
                type="submit" 
                className="composition-btn-submit"
                disabled={selectedIngredients.length === 0}
              >
                Créer la composition
              </button>
            </div>

            {/* Sélection des ingrédients avec menu déroulant */}
            <div className="composition-ingredients-section">
              <h3>Sélection des ingrédients *</h3>
              
              <div className="composition-dropdown-container">
                <div 
                  className="composition-dropdown-header"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="composition-dropdown-placeholder">
                    {selectedIngredients.length > 0 
                      ? `${selectedIngredients.length} ingrédient(s) sélectionné(s)` 
                      : 'Cliquez pour sélectionner des ingrédients'}
                  </div>
                  <span className="composition-dropdown-arrow">
                    {isDropdownOpen ? '▲' : '▼'}
                  </span>
                </div>

                {isDropdownOpen && (
                  <div className="composition-dropdown-content">
                    {/* Barre de recherche */}
                    <div className="composition-search-input-container">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Rechercher un ingrédient..."
                        value={ingredientSearch}
                        onChange={(e) => setIngredientSearch(e.target.value)}
                        className="composition-search-input"
                        autoFocus
                      />
                      {ingredientSearch && (
                        <button
                          type="button"
                          onClick={() => setIngredientSearch('')}
                          className="composition-search-clear"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Liste des articles filtrés */}
                    <div className="composition-dropdown-list">
                      {filteredArticles.length > 0 ? (
                        filteredArticles.map(article => (
                          <div 
                            key={article.idArticle} 
                            className={`composition-dropdown-item ${
                              isIngredientSelected(article.idArticle) ? 'selected' : ''
                            }`}
                            onClick={() => handleIngredientToggle(article)}
                          >
                            <input
                              type="checkbox"
                              checked={isIngredientSelected(article.idArticle)}
                              onChange={() => {}}
                              className="composition-checkbox"
                            />
                            <div className="composition-article-info">
                              <div className="composition-article-name">
                                {article.nomArticle}
                              </div>
                              <div className="composition-article-details">
                                <span className="composition-article-code">
                                  {article.codeArticle}
                                </span>
                                <span className="composition-article-price">
                                  {article.prixAchatHtUnitaire?.toFixed(2)}€ HT
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="composition-no-results">
                          Aucun ingrédient trouvé
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Résumé des ingrédients sélectionnés */}
              {selectedIngredients.length > 0 && (
                <div className="composition-selected-summary">
                  <div className="composition-selected-header">
                    <h4>Ingrédients sélectionnés ({selectedIngredients.length})</h4>
                    <button
                      type="button"
                      onClick={() => setSelectedIngredients([])}
                      className="composition-clear-all"
                    >
                      Tout effacer
                    </button>
                  </div>
                  <div className="composition-selected-list">
                    {selectedIngredients.map(article => (
                      <div key={article.idArticle} className="composition-selected-item">
                        <span className="composition-selected-name">
                          {article.nomArticle}
                        </span>
                        <span className="composition-selected-price">
                          {article.prixAchatHtUnitaire?.toFixed(2)}€ HT
                        </span>
                        <button 
                          type="button"
                          onClick={() => removeIngredient(article.idArticle)}
                          className="composition-remove-selected"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="composition-total-cost">
                    <div className="composition-cost-item">
                      <strong>Total HT:</strong>
                      <span>{costs.prixHtUnitaire?.toFixed(2)}€</span>
                    </div>
                    <div className="composition-cost-item">
                      <strong>Total TTC:</strong>
                      <span>{costs.prixTtcUnitaire?.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Barre de recherche des compositions */}
        <div className="composition-search-container">
          <div className="composition-search-relative">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom de composition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tableau des compositions */}
        <div className="composition-table-wrapper">
          <div className="composition-compositions-container">
            <div className="composition-row composition-header">
              <div className="composition-cell">Nom</div>
              <div className="composition-cell">Prix HT Unitaire</div>
              <div className="composition-cell">Prix TTC Unitaire</div>
              <div className="composition-cell">Prix Vente Conseillé UTTC</div>
              <div className="composition-cell">Prix de Vente Réel</div>
              <div className="composition-cell">Ingrédients</div>
              <div className="composition-cell">Supprimer</div>
            </div>
            
            {filteredCompositions.map(composition => (
              <div key={composition.idComposition} className="composition-row">
                {/* Nom éditable */}
                <div className="composition-cell">
                  {editingComposition === composition.idComposition ? (
                    <input
                      type="text"
                      value={tempComposition.nom || ''}
                      onChange={(e) => setTempComposition(prev => ({ 
                        ...prev, 
                        nom: e.target.value 
                      }))}
                      onKeyPress={(e) => handleKeyPress(e, composition.idComposition)}
                      onBlur={() => saveComposition(composition.idComposition)}
                      className="composition-editable-input"
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => startEditing(composition)}
                      className="composition-editable-field"
                      title="Cliquer pour modifier"
                    >
                      {composition.nom}
                    </span>
                  )}
                </div>
                
                <div className="composition-cell">{composition.prixHtUnitaire?.toFixed(2)} €</div>
                <div className="composition-cell">{composition.prixTtcUnitaire?.toFixed(2)} €</div>
                
                {/* Nouvelle colonne Prix Vente Conseillé UTTC */}
                <div className="composition-cell">
                  {(composition.prixVenteUttcConseille)?.toFixed(2)} €
                </div>
                
                {/* Nouvelle colonne Prix de Vente Réel */}
                <div className="composition-cell">
                  {editingPrice === composition.idComposition ? (
                    <input
                      type="number"
                      step="0.01"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      onKeyPress={(e) => handleKeyPressPrice(e, composition.idComposition)}
                      onBlur={() => savePrice(composition.idComposition)}
                      className="composition-price-input"
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => startEditingPrice(composition)}
                      className={`composition-editable-price ${getPriceColor(composition.prixVenteReel, composition.prixVenteUttcConseille)}`}
                      title="Cliquer pour modifier"
                    >
                      {composition.prixVenteReel?.toFixed(2) || '0.00'} €
                    </span>
                  )}
                </div>
                
                {/* Nouvelle colonne Ingrédients - version compacte */}
                <div className="composition-cell composition-ingredients-cell">
                  <div 
                    className="composition-ingredients-count"
                    onMouseEnter={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setHoveredComposition(composition);
                      setTooltipPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.bottom + window.scrollY
                      });
                    }}
                    onMouseLeave={() => setHoveredComposition(null)}
                  >
                    {composition.ingredients?.length || 0} ingrédient(s)
                  </div>
                </div>
                
                <div className="composition-cell composition-actions">
                  <button
                    className="composition-delete-btn"
                    onClick={() => handleDelete(composition.idComposition)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POPUP OVERLAY */}
        {hoveredComposition && (
          <div 
            className="composition-ingredients-overlay"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
            onMouseEnter={() => setHoveredComposition(hoveredComposition)}
            onMouseLeave={() => setHoveredComposition(null)}
          >
            <div className="composition-overlay-content">
              <div className="composition-overlay-header">
                <h4>Ingrédients de "{hoveredComposition.nom}"</h4>
                <button 
                  className="composition-overlay-close"
                  onClick={() => setHoveredComposition(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="composition-overlay-list">
                {hoveredComposition.ingredients?.map((ingredient, index) => (
                  <div key={ingredient.idArticle} className="composition-overlay-item">
                    <span className="composition-overlay-index">{index + 1}.</span>
                    <span className="composition-overlay-name">{ingredient.nomArticle}</span>
                    <span className="composition-overlay-price">
                      {ingredient.prixAchatHtUnitaire?.toFixed(2)}€ HT
                    </span>
                  </div>
                ))}
              </div>
              <div className="composition-overlay-footer">
                <div className="composition-overlay-total">
                  Total: {hoveredComposition.ingredients?.length} ingrédient(s)
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}