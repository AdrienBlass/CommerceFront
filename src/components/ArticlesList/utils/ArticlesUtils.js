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
  
  if (!formData.nomFournisseur?.trim()) {
    errors.push("Le nom du fournisseur est obligatoire");
  }
  
  if (!formData.codeArticle?.trim()) {
    errors.push("Le code article est obligatoire");
  }
  
  if (!formData.nomArticle?.trim()) {
    errors.push("La désignation est obligatoire");
  }
  
  if (!formData.quantite || formData.quantite <= 0) {
    errors.push("La quantité doit être supérieure à 0");
  }
  
  if (!formData.prixAchatHt || formData.prixAchatHt <= 0) {
    errors.push("Le prix d'achat HT doit être supérieur à 0");
  }
  
  if (!formData.tva) {
    errors.push("Le taux de TVA achat est obligatoire");
  }
  
  if (!formData.tvaVente) {
    errors.push("Le taux de TVA vente est obligatoire");
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