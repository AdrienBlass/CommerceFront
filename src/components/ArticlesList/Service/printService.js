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
                padding: 10px;
                font-size: 9px;
            }
            .print-header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px solid #2c3e50;
                padding-bottom: 5px;
            }
            .print-header h1 {
                color: #2c3e50;
                margin: 0;
                font-size: 14px;
            }
            .articles-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 6.5px;
                table-layout: fixed;
            }
            .articles-table th {
                background-color: #2c3e50 !important;
                color: white;
                padding: 3px 1px;
                border: 1px solid #ddd;
                text-align: center;
                font-weight: bold;
            }
            .articles-table td {
                padding: 2px 1px;
                border: 1px solid #ddd;
                text-align: center;
            }
            .articles-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            /* Largeurs réduites */
            .col-1 { width: 8%; }   /* Fourn. */
            .col-2 { width: 6%; }   /* Code */
            .col-3 { width: 12%; }  /* Désign. */
            .col-4 { width: 5%; }   /* Date */
            .col-5 { width: 4%; }   /* Qté */
            .col-6 { width: 6%; }   /* Px Achat */
            .col-7 { width: 6%; }   /* Px UHT */
            .col-8 { width: 4%; }   /* TVA */
            .col-9 { width: 6%; }   /* Mt TVA */
            .col-10 { width: 6%; }  /* Px TTC */
            .col-11 { width: 6%; }  /* Px UTTC */
            .col-12 { width: 5%; }  /* Coeff */
            .col-13 { width: 7%; }  /* Px Conseil */
            .col-14 { width: 6%; }  /* Px Réel */
            .col-15 { width: 4%; }  /* TVA Vte */
            
            .text-red-500 { color: #e74c3c; font-weight: 600; }
            .text-green-500 { color: #27ae60; font-weight: 600; }
            .text-black-500 { color: #2c3e50; font-weight: 600; }
            
            .print-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 8px;
                padding: 0 5px;
            }
            
            @media print {
                @page {
                    size: A4 landscape;
                    margin: 3mm;
                }
                body { 
                    margin: 0; 
                    padding: 5px;
                    font-size: 6px;
                }
                .articles-table { 
                    font-size: 5.5px;
                }
                .print-actions { 
                    display: none; 
                }
            }
            
            .print-actions {
                text-align: center;
                margin: 10px 0;
            }
            .btn-print-preview {
                background: #2c3e50;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="print-header">
            <h1>LISTE DES ARTICLES</h1>
        </div>
        <div class="print-actions">
            <button class="btn-print-preview" onclick="window.print()">🖨️ Imprimer</button>
        </div>
        <table class="articles-table">
            <thead>
                <tr>
                    <th class="col-1">Fournisseur</th>
                    <th class="col-2">Code article</th>
                    <th class="col-3">Désignation</th>
                    <th class="col-4">Date d'achat</th>
                    <th class="col-5">Quantité</th>
                    <th class="col-6">Prix d'achat HT</th>
                    <th class="col-7">Prix d'achat UHT</th>
                    <th class="col-8">Taux de TVA</th>
                    <th class="col-9">Montant TVA</th>
                    <th class="col-10">Prix d'achat TTC</th>
                    <th class="col-11">Prix d'achat UTTC</th>
                    <th class="col-12">Coefficient majoré x3</th>
                    <th class="col-13">Prix de vente conseillé UTTC</th>
                    <th class="col-14">Prix de vente réel</th>
                    <th class="col-15">TVA vente</th>
                </tr>
            </thead>
            <tbody>
                ${articles.map(article => `
                    <tr>
                        <td class="col-1">${truncateText(article.nomFournisseur, 12)}</td>
                        <td class="col-2">${article.codeArticle || ''}</td>
                        <td class="col-3">${article.nomArticle}</td>
                        <td class="col-4">${formatDate(article.dateAchat)}</td>
                        <td class="col-5">${article.quantite || ''}</td>
                        <td class="col-6">${article.prixAchatHt || ''}</td>
                        <td class="col-7">${article.prixAchatHtUnitaire || ''}</td>
                        <td class="col-8">${formatTVA(article.tva)}</td>
                        <td class="col-9">${article.montantTva || ''}</td>
                        <td class="col-10">${article.prixAchatTtc || ''}</td>
                        <td class="col-11">${article.prixAchatTtcUnitaire || ''}</td>
                        <td class="col-12">${article.coefficiantMagore || ''}</td>
                        <td class="col-13">${article.prixVenteTtcUnitaire || ''}</td>
                        <td class="col-14 ${getPriceColor(article.prixVenteReel, article.prixVenteTtcUnitaire)}">
                            ${article.prixVenteReel || '0.00'}
                        </td>
                        <td class="col-15">${formatTVA(article.tvaVente)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="text-align: center; margin-top: 8px; font-size: 7px; color: #666;">
            Généré le ${currentDateTime}
        </div>
    </body>
    </html>
  `;
};

// Fonctions utilitaires
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatTVA = (tva) => {
  if (tva === 'TVA_5_5') return '5.5%';
  if (tva === 'TVA_10') return '10%';
  if (tva === 'TVA_20') return '20%';
  return '';
};

// Fonction principale d'impression
export const handlePrint = (articles, searchTerm) => {
  const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes');
  
  if (!printWindow) {
    alert("Veuillez autoriser les pop-ups pour l'aperçu d'impression");
    return false;
  }

  const printContent = generatePrintContent(articles, searchTerm);
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  return true;
};