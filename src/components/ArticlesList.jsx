import { useState, useEffect } from 'react'
import './ArticlesList.css'
import { Trash2 } from 'lucide-react';

export default function ArticlesList() {
    const getPriceColor = (prixReel, prixConseil) => {
        const reel = parseFloat(prixReel) || 0;
        const conseil = parseFloat(prixConseil) || 0;
    
        if (reel < conseil) return "text-red-500";
        if (reel > conseil) return "text-green-500";
        return "text-black-500";
    };

    const [articles, setArticles] = useState([]);
    const [form, setForm] = useState({
        nomFournisseur: '',
        codeArticle: '',
        nomArticle: '',
        dateAchat: '',
        prixAchatHt: '',
        prixVenteTtc: '',
        quantite: '',
        tva: '',
        tvaVente: '' 
    });
    const [search, setSearch] = useState('');
    const [editingPrice, setEditingPrice] = useState(null);
    const [tempPrice, setTempPrice] = useState('');

    useEffect(() => {
        fetch('http://localhost:9090/api/article')
            .then(response => response.json())
            .then(data => setArticles(data));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.codeArticle) {
            alert("Le code article est obligatoire !");
            return;
        }
        const exists = articles.some(a => a.codeArticle === form.codeArticle);
        if (exists) {
            alert("Ce code article existe déjà !");
            return;
        }

        try {
            const response = await fetch('http://localhost:9090/api/article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                alert("Erreur lors de la création de l'article !");
                return;
            }

            const data = await response.json();
            setArticles(prev => [...prev, data]);

            setForm({
                nomFournisseur: '',
                codeArticle: '',
                nomArticle: '',
                dateAchat: '',
                prixAchatHt: '',
                quantite: '',
                prixVenteTtc: '',
                tva: '',
                tvaVente: ''
            });

        } catch (error) {
            console.error("Erreur lors de la requête :", error);
            alert("Impossible de contacter le serveur !");
        }
    };

    const handleDelete = (codeArticle) => {
        fetch(`http://localhost:9090/api/article/${codeArticle}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    setArticles(prev => prev.filter(a => a.codeArticle !== codeArticle));
                }
            });
    };

    const startEditing = (article) => {
        setEditingPrice(article.codeArticle);
        setTempPrice(article.prixVenteReel || '');
    };

    const savePrice = async (codeArticle) => {
        try {
            const articleToUpdate = articles.find(a => a.codeArticle === codeArticle);
            if (!articleToUpdate) return;

            const updatedArticle = {
                ...articleToUpdate,
                prixVenteReel: parseFloat(tempPrice) || 0
            };

            const response = await fetch(`http://localhost:9090/api/article/${codeArticle}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedArticle)
            });

            if (!response.ok) {
                alert("Erreur lors de la mise à jour du prix !");
                return;
            }

            const data = await response.json();
            setArticles(prev => prev.map(a => a.codeArticle === codeArticle ? data : a));
            setEditingPrice(null);
            setTempPrice('');

        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
            alert("Impossible de contacter le serveur !");
        }
    };

    const cancelEditing = () => {
        setEditingPrice(null);
        setTempPrice('');
    };

    const handleKeyPress = (e, codeArticle) => {
        if (e.key === 'Enter') {
            savePrice(codeArticle);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    const filteredArticles = articles.filter(article =>
        article.nomArticle.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container">
            <h1>Liste des articles</h1>

            <button 
                onClick={() => window.print()} 
                className="btn-print no-print"
            >
                🖨️ Imprimer
            </button>
            
            <div className="form-container no-print">
                <form onSubmit={handleCreate}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fournisseur</label>
                            <input name="nomFournisseur" placeholder="Fournisseur" value={form.nomFournisseur} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Code Article</label>
                            <input name="codeArticle" placeholder="Code" value={form.codeArticle} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Nom Article</label>
                            <input name="nomArticle" placeholder="Nom" value={form.nomArticle} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Date Achat</label>
                            <input name="dateAchat" type="date" value={form.dateAchat} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Prix Achat HT</label>
                            <input name="prixAchatHt" type="number" step="0.01" placeholder="Prix HT" value={form.prixAchatHt} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>TVA Achat</label>
                            <select name="tva" value={form.tva} onChange={handleChange}>
                                <option value="">TVA</option>
                                <option value="TVA_5_5">5.5%</option>
                                <option value="TVA_10">10%</option>
                                <option value="TVA_20">20%</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>TVA Vente</label>
                            <select name="tvaVente" value={form.tvaVente} onChange={handleChange}>
                                <option value="">TVA Vente</option>
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
                        <div className="article-cell">Code</div>
                        <div className="article-cell">Désignation</div>
                        <div className="article-cell">Date d'achat</div>
                        <div className="article-cell">Prix d'achat HT</div>
                        <div className="article-cell">Taux de TVA</div>
                        <div className="article-cell">Montant TVA</div>
                        <div className="article-cell">Prix d'achat TTC</div>
                        <div className="article-cell">Prix de vente conseillé HT</div>
                        <div className="article-cell">Prix de vente conseillé TTC</div>
                        <div className="article-cell">Prix de Vente Réel</div>
                        <div className="article-cell">TVA Vente</div>
                        <div className="article-cell no-print">Supprimer</div>
                    </div>
                    
                    {filteredArticles.map(article => (
                        <div key={article.codeArticle} className="article-row">
                            <div className="article-cell">{article.nomFournisseur}</div>
                            <div className="article-cell">{article.codeArticle}</div>
                            <div className="article-cell">{article.nomArticle}</div>
                            <div className="article-cell">
                                {article.dateAchat ? new Date(article.dateAchat).toLocaleDateString() : ''}
                            </div>
                            <div className="article-cell">{article.prixAchatHt}</div>
                            <div className="article-cell">
                                {article.tva === 'TVA_5_5' ? '5.5%' :
                                 article.tva === 'TVA_10' ? '10%' :
                                 article.tva === 'TVA_20' ? '20%' :
                                 article.tva}
                            </div>
                            <div className="article-cell">{article.montantTva}</div>
                            <div className="article-cell">{article.prixAchatTtc}</div>
                            <div className="article-cell">{article.coefficiantMagore}</div>
                            <div className="article-cell">{article.prixVenteTtc}</div>
                            
                            <div className="article-cell">
                                {editingPrice === article.codeArticle ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tempPrice}
                                        onChange={(e) => setTempPrice(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, article.codeArticle)}
                                        onBlur={() => savePrice(article.codeArticle)}
                                        className="price-input"
                                        autoFocus
                                    />
                                ) : (
                                <span 
                                    onClick={() => startEditing(article)}
                                    className={`editable-price ${getPriceColor(article.prixVenteReel, article.prixVenteTtc)}`}
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
                                    onClick={() => handleDelete(article.codeArticle)}
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