import { useState, useEffect } from 'react';
import './Inventaire.css';
import { Printer, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import des services existants
import { 
  fetchArticles, 
  updateArticle,
  fetchArticlesLatest
} from '../ArticlesList/Service/ArticlesListService';

export default function Inventaire() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  
  // États pour l'édition de la quantité
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [tempQuantity, setTempQuantity] = useState('');

  // Obtenir l'année en cours
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await fetchArticlesLatest();
      setArticles(data);
    } catch (error) {
      alert("Erreur lors du chargement des articles récent");
    }
  };

  // Fonction pour calculer le prix d'achat HT basé sur la quantité restante
  const calculateRemainingPrice = (article) => {
    if (!article.quantiteRest || !article.prixAchatHtUnitaire) {
      return 0;
    }
    
    // Calcul: prix unitaire HT × quantité restante
    const remainingPrice = article.prixAchatHtUnitaire * article.quantiteRest;
    
    // Arrondir à 2 décimales
    return Math.round(remainingPrice * 100) / 100;
  };

  // Calcul du total des prix restants (pour l'affichage, inclut tout)
  const calculateTotalRemainingPrice = () => {
    return articles
      .filter(article => 
        article.nomArticle?.toLowerCase().includes(search.toLowerCase()) ||
        article.codeArticle?.toLowerCase().includes(search.toLowerCase())
      )
      .reduce((total, article) => {
        return total + calculateRemainingPrice(article);
      }, 0);
  };

  // Fonctions pour l'édition de la quantité
  const startEditingQuantity = (article) => {
    setEditingQuantity(article.idArticle);
    setTempQuantity(article.quantiteRest || '0');
  };

  const saveQuantity = async (idArticle) => {
    try {
      const articleToUpdate = articles.find(a => a.idArticle === idArticle);
      if (!articleToUpdate) return;

      const quantityValue = parseFloat(tempQuantity) || 0;
      
      if (quantityValue < 0) {
        alert("La quantité ne peut pas être négative");
        return;
      }

      const updatedArticle = {
        ...articleToUpdate,
        quantiteRest: quantityValue
      };

      await updateArticle(idArticle, updatedArticle);
      await loadArticles();
      
      setEditingQuantity(null);
      setTempQuantity('');
    } catch (error) {
      alert("Erreur lors de la mise à jour de la quantité");
    }
  };

  const cancelEditingQuantity = () => {
    setEditingQuantity(null);
    setTempQuantity('');
  };

  const handleKeyPressQuantity = (e, idArticle) => {
    if (e.key === 'Enter') {
      saveQuantity(idArticle);
    } else if (e.key === 'Escape') {
      cancelEditingQuantity();
    }
  };

  // Filtrer les articles par désignation (TOUS les articles, même quantité = 0)
  const filteredArticles = articles.filter(article => 
    article.nomArticle?.toLowerCase().includes(search.toLowerCase()) ||
    article.codeArticle?.toLowerCase().includes(search.toLowerCase())
  );

  // Fonction pour récupérer les articles avec quantité > 0 uniquement pour export
  const getArticlesForExport = () => {
    return filteredArticles.filter(article => 
      article.quantiteRest && article.quantiteRest > 0
    );
  };

  // Fonction d'impression personnalisée (exclut les quantités = 0)
  const handlePrintInventory = () => {
    const articlesForPrint = getArticlesForExport();
    const totalRemaining = articlesForPrint.reduce((total, article) => {
      return total + calculateRemainingPrice(article);
    }, 0);

    const printContent = `
      <html>
        <head>
          <title>Inventaire des Articles ${currentYear}</title>
          <style>
            @page { margin: 0.5in; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            h1 { text-align: center; margin-bottom: 10px; }
            h2 { text-align: center; color: #666; margin-bottom: 20px; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f0f0f0; text-align: left; padding: 8px; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 8px; border: 1px solid #ddd; text-align: right; }
            td:first-child, td:nth-child(2) { text-align: left; }
            .header-row { background-color: #f8f9fa; font-weight: bold; }
            .summary { margin-top: 20px; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .no-data { text-align: center; padding: 20px; color: #666; font-style: italic; }
            .note { font-size: 10px; color: #999; margin-top: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Inventaire des Marchandises</h1>
          <h2>Année ${currentYear}</h2>
          ${articlesForPrint.length === 0 ? 
            '<div class="no-data">Aucun article avec quantité restante disponible</div>' : 
            `<table>
              <thead>
                <tr>
                  <th>Code Article</th>
                  <th>Désignation</th>
                  <th>Quantité Restante</th>
                  <th>Prix Unitaire HT</th>
                  <th>Valeur Restante HT</th>
                </tr>
              </thead>
              <tbody>
                ${articlesForPrint.map(article => {
                  const remainingPrice = calculateRemainingPrice(article);
                  return `
                  <tr>
                    <td>${article.codeArticle || 'N/A'}</td>
                    <td>${article.nomArticle || 'Non spécifié'}</td>
                    <td>${article.quantiteRest || 0}</td>
                    <td>${(article.prixAchatHtUnitaire || 0).toFixed(2)} €</td>
                    <td>${remainingPrice.toFixed(2)} €</td>
                  </tr>
                `}).join('')}
              </tbody>
              <tfoot>
                <tr class="header-row">
                  <td colspan="2">TOTAL</td>
                  <td>${articlesForPrint.reduce((sum, article) => sum + (article.quantiteRest || 0), 0)}</td>
                  <td>-</td>
                  <td>${totalRemaining.toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
            <div class="summary">
              <div class="summary-item" style="font-weight: bold;">
                <span>Valeur totale du stock :</span>
                <span>${totalRemaining.toFixed(2)} € HT</span>
              </div>
            </div>
       
            </div>`
          }
          <div style="margin-top: 30px; font-size: 11px; color: #666; text-align: center;">
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p>© ${currentYear} - Inventaire des Marchandises</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Fonction pour exporter en PDF (exclut les quantités = 0)
  const handleExportToPDF = () => {
    const articlesForPDF = getArticlesForExport();
    
    if (articlesForPDF.length === 0) {
      alert("Aucun article avec quantité restante disponible pour l'export PDF");
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Titre principal
    doc.setFontSize(20);
    doc.text('Inventaire des Marchandises', 105, 20, { align: 'center' });
    
    // Sous-titre avec l'année
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Année ${currentYear}`, 105, 30, { align: 'center' });
    
    // Date de génération
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 40, { align: 'center' });
    
    // Préparer les données pour le tableau
    const tableData = articlesForPDF.map(article => {
      const remainingPrice = calculateRemainingPrice(article);
      return [
        article.codeArticle || 'N/A',
        article.nomArticle || 'Non spécifié',
        article.quantiteRest || 0,
        `${(article.prixAchatHtUnitaire || 0).toFixed(2)} €`,
        `${remainingPrice.toFixed(2)} €`
      ];
    });

    // Ajouter le tableau avec autoTable
    autoTable(doc, {
      startY: 55,
      head: [['Code Article', 'Désignation', 'Qte Restante', 'Prix Unitaire HT', 'Valeur Restante HT']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 55 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 }
      },
      margin: { left: 15, right: 15 }
    });

    // Calculer les totaux
    const totalQuantite = articlesForPDF.reduce((sum, article) => sum + (article.quantiteRest || 0), 0);
    const totalValeur = articlesForPDF.reduce((total, article) => total + calculateRemainingPrice(article), 0);

    // Ajouter les totaux en bas du tableau
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      body: [
        ['TOTAL', '', totalQuantite, '', `${totalValeur.toFixed(2)} €`]
      ],
      theme: 'grid',
      styles: { fillColor: [248, 249, 250], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 55 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 }
      },
      margin: { left: 15, right: 15 }
    });

    // Sauvegarder le PDF
    const fileName = `inventaire_marchandises_${currentYear}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>Inventaire des Marchandises - {currentYear}</h1>
        <div className="header-buttons">
          <button 
            onClick={handleExportToPDF}
            className="btn-pdf no-print"
            style={{ marginRight: '10px' }}
          >
            <Download size={16} style={{marginRight: '8px'}} />
            Exporter en PDF
          </button>
          <button 
            onClick={handlePrintInventory}
            className="btn-print no-print"
          >
            <Printer size={16} style={{marginRight: '8px'}} />
            Imprimer l'inventaire
          </button>
        </div>
      </div>

      <div className="search-container no-print">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Rechercher par code ou désignation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="total-count">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} trouvé{filteredArticles.length !== 1 ? 's' : ''}
            {filteredArticles.filter(a => a.quantiteRest && a.quantiteRest > 0).length !== filteredArticles.length && 
              ` (${filteredArticles.filter(a => a.quantiteRest && a.quantiteRest > 0).length} avec stock)`}
          </div>
        </div>
      </div>

      <div className="inventory-table-wrapper">
        <div className="inventory-table">
          <div className="inventory-row header">
            <div className="inventory-cell">Code Article</div>
            <div className="inventory-cell">Désignation</div>
            <div className="inventory-cell">Quantité Restante</div>
            <div className="inventory-cell">Prix Unitaire HT</div>
            <div className="inventory-cell">Valeur Restante HT</div>
          </div>
          
          {filteredArticles.length === 0 ? (
            <div className="no-results">
              Aucun article trouvé. Essayez de modifier votre recherche.
            </div>
          ) : (
            filteredArticles.map(article => (
              <div 
                key={article.idArticle} 
                className={`inventory-row ${(!article.quantiteRest || article.quantiteRest === 0) ? 'zero-quantity' : ''}`}
              >
                <div className="inventory-cell code-cell">
                  <div className="code-badge">{article.codeArticle || 'N/A'}</div>
                </div>
                <div className="inventory-cell designation-cell">
                  {article.nomArticle || 'Non spécifié'}
                </div>
                <div className="inventory-cell quantity-cell">
                  {editingQuantity === article.idArticle ? (
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(e.target.value)}
                      onKeyPress={(e) => handleKeyPressQuantity(e, article.idArticle)}
                      onBlur={() => saveQuantity(article.idArticle)}
                      className="quantity-input"
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => startEditingQuantity(article)}
                      className={`editable-quantity ${(!article.quantiteRest || article.quantiteRest === 0) ? 'zero' : ''}`}
                      title="Cliquer pour modifier la quantité"
                    >
                      {article.quantiteRest || 0}
                      {(!article.quantiteRest || article.quantiteRest === 0) && ' (stock épuisé)'}
                    </span>
                  )}
                </div>
                <div className="inventory-cell price-cell">
                  {(article.prixAchatHtUnitaire || 0).toFixed(2)} €
                </div>
                <div className="inventory-cell unit-price-cell">
                  {calculateRemainingPrice(article).toFixed(2)} €
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="inventory-summary no-print">
        <div className="summary-card">
          <h3>Résumé de l'inventaire {currentYear}</h3>
          <div className="summary-content">
            <div className="summary-item highlight">
              <span className="summary-label">Valeur totale du stock HT :</span>
              <span className="summary-value">
                {calculateTotalRemainingPrice().toFixed(2)} €
              </span>
            </div>
          </div>
          <div className="export-note">
            <small>
              <strong>Note :</strong> L'impression et l'export PDF n'incluent que les articles avec quantité restante supérieure à 0.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}