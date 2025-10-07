// services/articleService.js

const API_BASE_URL = 'http://localhost:9090/api/article';

// Récupérer tous les articles
export const fetchArticles = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Erreur lors de la récupération des articles');
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchArticles:', error);
    throw error;
  }
};

// Créer un nouvel article
export const createArticle = async (articleData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    });
    
    if (!response.ok) throw new Error('Erreur lors de la création de l\'article');
    return await response.json();
  } catch (error) {
    console.error('Erreur createArticle:', error);
    throw error;
  }
};

// Mettre à jour un article
export const updateArticle = async (idArticle, articleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${idArticle}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    });
    
    if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'article');
    return await response.json();
  } catch (error) {
    console.error('Erreur updateArticle:', error);
    throw error;
  }
};

// Supprimer un article
export const deleteArticle = async (idArticle) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${idArticle}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'article');
    return response.ok;
  } catch (error) {
    console.error('Erreur deleteArticle:', error);
    throw error;
  }
};