// Service/CompositionService.js
const API_BASE_URL = 'http://localhost:9090/api/composition';

// Récupérer toutes les compositions
export const fetchCompositions = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Erreur lors de la récupération des compositions');
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchCompositions:', error);
    throw error;
  }
};

// Récupérer tous les articles (pour les ingrédients)
export const fetchArticles = async () => {
  try {
    const response = await fetch('http://localhost:9090/api/article');
    if (!response.ok) throw new Error('Erreur lors de la récupération des articles');
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchArticles:', error);
    throw error;
  }
};

// Créer une nouvelle composition
export const createComposition = async (compositionData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compositionData)
    });
    
    if (!response.ok) throw new Error('Erreur lors de la création de la composition');
    return await response.json();
  } catch (error) {
    console.error('Erreur createComposition:', error);
    throw error;
  }
};

// Mettre à jour une composition
export const updateComposition = async (idComposition, compositionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${idComposition}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compositionData)
    });
    
    if (!response.ok) throw new Error('Erreur lors de la mise à jour de la composition');
    return await response.json();
  } catch (error) {
    console.error('Erreur updateComposition:', error);
    throw error;
  }
};

// Supprimer une composition
export const deleteComposition = async (idComposition) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${idComposition}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression de la composition');
    return response.ok;
  } catch (error) {
    console.error('Erreur deleteComposition:', error);
    throw error;
  }
};