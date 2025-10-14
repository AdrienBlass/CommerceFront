// Utils/CompositionUtils.js
export const getInitialFormState = () => ({
  nomComposition: '',
});

export const validateCompositionForm = (form, ingredients) => {
  const errors = [];
  
  if (!form.nomComposition || !form.nomComposition.trim()) {
    errors.push('Le nom de la composition est requis');
  }
  
  if (!ingredients || ingredients.length === 0) {
    errors.push('Au moins un ingrédient doit être sélectionné');
  }
  
  return errors;
};

export const filterCompositions = (compositions, search) => {
  if (!search) return compositions;
  
  return compositions.filter(composition =>
    composition.nom.toLowerCase().includes(search.toLowerCase())
  );
};

export const filterArticles = (articles, search) => {
  if (!search) return articles;
  
  const searchLower = search.toLowerCase();
  return articles.filter(article =>
    article.nomArticle.toLowerCase().includes(searchLower) ||
    article.codeArticle.toLowerCase().includes(searchLower)
  );
};

export const calculateCompositionCosts = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return {
      prixHtUnitaire: 0,
      prixTtcUnitaire: 0
    };
  }
  
  const totalHt = ingredients.reduce((sum, article) => 
    sum + (article.prixAchatHtUnitaire || 0), 0
  );
  
  const totalTtc = ingredients.reduce((sum, article) => 
    sum + (article.prixAchatTtcUnitaire || 0), 0
  );
  
  return {
    prixHtUnitaire: parseFloat(totalHt.toFixed(2)),
    prixTtcUnitaire: parseFloat(totalTtc.toFixed(2))
  };
};