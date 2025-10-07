// services/printService.js

// Fonction utilitaire pour les couleurs des prix
export const getPriceColor = (prixReel, prixConseil) => {
  const reel = parseFloat(prixReel) || 0;
  const conseil = parseFloat(prixConseil) || 0;

  if (reel < conseil) return "text-red-500";
  if (reel > conseil) return "text-green-500";
  return "text-black-500";
};

// Générer le contenu HTML pour l'impression
export const generatePrintContent = (articles, searchTerm) => {
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const currentDateTime = new Date().toLocaleString('fr-FR');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Liste des Articles</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 14px;
                background: white;
            }
            .print-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #2c3e50;
                padding-bottom: 10px;
            }
            .print-header h1 {
                color: #2c3e50;
                margin: 0;
                font-size: 24px;
            }
            .articles-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
                table-layout: fixed;
                margin: 0 auto;
            }
            .articles-table th {
                background-color: #2c3e50 !important;
                color: white;
                padding: 12px 8px;
                border: 1px solid #ddd;
                text-align: center;
                font-weight: bold;
                font-size: 14px;
            }
            .articles-table td {
                padding: 10px 8px;
                border: 1px solid #ddd;
                text-align: center;
                vertical-align: middle;
                font-size: 13px;
            }
            .articles-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            /* Largeurs optimisées */
            .col-1 { width: 15%; }   /* Fournisseur */
            .col-2 { width: 12%; }   /* Code article */
            .col-3 { width: 25%; }   /* Désignation */
            .col-4 { width: 10%; }   /* Date d'achat */
            .col-5 { width: 10%; }   /* Prix d'achat HT */
            .col-6 { width: 10%; }   /* Prix d'achat UHT */
            .col-7 { width: 9%; }    /* Prix vente conseillé */
            .col-8 { width: 9%; }    /* Prix vente réel */
            
            .text-red-500 { 
                color: #e74c3c; 
                font-weight: 600; 
            }
            .text-green-500 { 
                color: #27ae60; 
                font-weight: 600; 
            }
            .text-black-500 { 
                color: #2c3e50; 
                font-weight: 600; 
            }
            
            .print-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                font-size: 12px;
                padding: 12px 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
                border: 1px solid #dee2e6;
            }
            
            .print-summary {
                text-align: center;
                margin: 20px 0;
                font-size: 12px;
                color: #666;
                padding-top: 15px;
                border-top: 1px solid #ddd;
            }
            
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 15mm;
                }
                body { 
                    margin: 0; 
                    padding: 0;
                    font-size: 12px;
                }
                .print-header {
                    margin-bottom: 15px;
                }
                .print-header h1 {
                    font-size: 22px;
                }
                .articles-table { 
                    font-size: 11px;
                }
                .articles-table th {
                    font-size: 12px;
                    padding: 10px 6px;
                }
                .articles-table td {
                    font-size: 11px;
                    padding: 8px 6px;
                }
                .print-actions { 
                    display: none; 
                }
                .print-info {
                    font-size: 10px;
                    padding: 8px 10px;
                }
                .print-summary {
                    font-size: 10px;
                }
            }
            
            .print-actions {
                text-align: center;
                margin: 25px 0;
            }
            .btn-print-preview {
                background: #2c3e50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px;
                transition: background 0.3s;
            }
            .btn-print-preview:hover {
                background: #34495e;
                transform: translateY(-2px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            /* Gestion des sauts de page */
            .articles-table {
                page-break-inside: auto;
            }
            .articles-table tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            .articles-table thead {
                display: table-header-group;
            }
        </style>
    </head>
    <body>
        <div class="print-header">
            <h1>LISTE DES ARTICLES</h1>
        </div>
        <div class="print-actions">
            <button class="btn-print-preview" onclick="window.print()">🖨️ Imprimer maintenant</button>
        </div>

        <table class="articles-table">
            <thead>
                <tr>
                    <th class="col-1">Fournisseur</th>
                    <th class="col-2">Code article</th>
                    <th class="col-3">Désignation</th>
                    <th class="col-4">Date d'achat</th>
                    <th class="col-5">Prix d'achat HT</th>
                    <th class="col-6">Prix d'achat UHT</th>
                    <th class="col-7">Prix vente conseillé</th>
                    <th class="col-8">Prix de vente réel</th>
                </tr>
            </thead>
            <tbody>
                ${articles.map(article => `
                    <tr>
                        <td class="col-1">${article.nomFournisseur || '-'}</td>
                        <td class="col-2">${article.codeArticle || '-'}</td>
                        <td class="col-3">${article.nomArticle || '-'}</td>
                        <td class="col-4">${formatDate(article.dateAchat)}</td>
                        <td class="col-5">${formatPrice(article.prixAchatHt)} €</td>
                        <td class="col-6">${formatPrice(article.prixAchatHtUnitaire)} €</td>
                        <td class="col-7">${formatPrice(article.prixVenteTtcUnitaire)} €</td>
                        <td class="col-8 ${getPriceColor(article.prixVenteReel, article.prixVenteTtcUnitaire)}">
                            ${formatPrice(article.prixVenteReel)} €
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="print-summary">
            Document généré le ${currentDateTime}
        </div>
    </body>
    </html>
  `;
};

// Fonctions utilitaires
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatTVA = (tva) => {
  if (tva === 'TVA_5_5') return '5.5%';
  if (tva === 'TVA_10') return '10%';
  if (tva === 'TVA_20') return '20%';
  return '';
};

const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00';
  const number = parseFloat(price);
  return isNaN(number) ? '0.00' : number.toFixed(2);
};

// Fonction principale d'impression
export const handlePrint = (articles, searchTerm) => {
  const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
  
  if (!printWindow) {
    alert("Veuillez autoriser les pop-ups pour l'aperçu d'impression");
    return false;
  }

  const printContent = generatePrintContent(articles, searchTerm);
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  return true;
};