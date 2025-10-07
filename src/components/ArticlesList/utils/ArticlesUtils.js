// utils/articleUtils.js
export const sortArticlesByDate = (articles, sortOrder) => {
  if (!sortOrder) return articles;
  
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.dateAchat || 0);
    const dateB = new Date(b.dateAchat || 0);
    
    if (sortOrder === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });
};

export const filterArticles = (articles, searchTerm) => {
  if (!searchTerm) return articles;
  
  return articles.filter(article =>
    article.nomArticle.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const validateArticleForm = (formData) => {
  const errors = [];
  
  if (!formData.codeArticle?.trim()) {
    errors.push("Le code article est obligatoire");
  }
  
  return errors;
};

export const getInitialFormState = () => ({
  nomFournisseur: '',
  codeArticle: '',
  nomArticle: '',
  dateAchat: '',
  prixAchatHt: '',
  prixAchatHtUnitaire: '',
  prixVenteTtc: '',
  prixVenteTtcUnitaire: '',
  prixAchatTtcUnitaire: '',
  quantite: '',
  tva: '',
  tvaVente: '' 
});