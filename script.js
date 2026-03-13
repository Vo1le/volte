const REPO_FILE = "data.json";
const FILES_REPO = "files.json";
let currentFilter = null;
let currentFileFilter = 'all';
let allArticles = [];
let adminArticles = [];
let allFiles = [];
let adminFiles = [];
let tempBadges = [];
let tempAttachedFiles = [];
let editingId = null;
let editingFileId = null;

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('articles-container')) initPublic();
    if (document.getElementById('admin-page')) initAdmin();
    const mode = "date-desc";
    allArticles.sort((a, b) => mode === 'date-desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    renderArticles();
});

function checkAdmin() {
    const p = prompt("Accès Admin :");
    if (p === "mpi2025") window.location.href = "admin.html";
}

// --- LOGIQUE PUBLIQUE ---
async function initPublic() {
    try {
        const res = await fetch(REPO_FILE + '?v=' + Date.now());
        allArticles = await res.json();
        
        // Charger les fichiers
        try {
            const filesRes = await fetch(FILES_REPO + '?v=' + Date.now());
            allFiles = await filesRes.json();
        } catch (e) {
            console.log("Pas de fichiers disponibles");
            allFiles = [];
        }
        
        renderArticles();
    } catch (e) { 
        console.error("Erreur chargement JSON"); 
    }
}

function renderArticles() {
    const container = document.getElementById('articles-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    let filtered = currentFilter ? allArticles.filter(a => a.badges.some(b => b.text === currentFilter)) : allArticles;

    filtered.forEach(art => {
        const badgesHtml = art.badges.map(b => `<span class="custom-badge" style="background:${b.color}">${b.text}</span>`).join('');
        
        // Récupérer les fichiers attachés
        let filesHtml = '';
        if (art.attachedFiles && art.attachedFiles.length > 0) {
            const attachedFilesList = art.attachedFiles
                .map(fileId => {
                    const file = allFiles.find(f => f.id === fileId);
                    if (!file) return '';
                    return `
                        <div class="article-file-item">
                            <div class="file-info">
                                <span class="file-name" onclick="viewFile(${file.id})">${getFileIcon(file.type)} ${file.name}</span>
                                <span class="file-type">${file.type}</span>
                            </div>
                        </div>
                    `;
                })
                .filter(Boolean)
                .join('');
            
            if (attachedFilesList) {
                filesHtml = `
                    <div class="article-files">
                        <h4>📎 Fichiers joints</h4>
                        ${attachedFilesList}
                    </div>
                `;
            }
        }
        
        const div = document.createElement('div');
        div.className = 'article-card';
        div.innerHTML = `
            <details open>
                <summary>
                    <span>${art.title}</span>
                    <span class="meta-info">${art.date}</span>
                </summary>
                <div class="article-content">
                    <div class="badge-container">${badgesHtml}</div>
                    <div class="article-summary">${art.summary}</div>
                    <div class="full-content">${art.content}</div>
                    ${filesHtml}
                </div>
            </details>`;
        container.appendChild(div);
    });
    renderFilters();
}

function renderFilters() {
    const chipBox = document.getElementById('filter-chips');
    if (!chipBox) return;
    
    const tags = new Set();
    allArticles.forEach(a => a.badges.forEach(b => tags.add(b.text)));
    
    chipBox.innerHTML = '';
    tags.forEach(t => {
        const s = document.createElement('span');
        s.className = `tag-chip ${currentFilter === t ? 'active' : ''}`;
        s.innerText = t;
        s.onclick = () => { currentFilter = (currentFilter === t) ? null : t; renderArticles(); };
        chipBox.appendChild(s);
    });
}

function clearFilter() { 
    currentFilter = null; 
    renderArticles(); 
}

function sortArticles() {
    const mode = document.getElementById('sort-select').value;
    allArticles.sort((a, b) => mode === 'date-desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    renderArticles();
}

window.onload = function() {
    const mode = "date-desc";
    allArticles.sort((a, b) => mode === 'date-desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    renderArticles();
};

// --- LOGIQUE ADMIN ---
async function initAdmin() {
    const p = prompt("Confirmer Mot de Passe :");
    if (p !== "mpi2025") return window.location.href = "index.html";
    document.getElementById('admin-page').style.display = "block";

    // Load credentials
    ['gh-u', 'gh-r', 'gh-t'].forEach(id => {
        if(localStorage.getItem(id)) document.getElementById(id).value = localStorage.getItem(id);
    });

    try {
        const res = await fetch(REPO_FILE);
        adminArticles = await res.json();
        renderAdminList();
    } catch (e) { adminArticles = []; }
    
    try {
        const filesRes = await fetch(FILES_REPO);
        adminFiles = await filesRes.json();
        renderAdminFilesList();
    } catch (e) { adminFiles = []; }
}

function addBadge() {
    const t = document.getElementById('tag-text').value;
    const c = document.getElementById('tag-color').value;
    if(!t) return;
    tempBadges.push({ text: t, color: c });
    document.getElementById('tag-text').value = '';
    renderTempBadges();
}

function renderTempBadges() {
    const list = document.getElementById('current-badges-list');
    list.innerHTML = tempBadges.map((b, i) => `
        <span class="badge-item" style="border-bottom: 2px solid ${b.color}">${b.text} 
        <b onclick="tempBadges.splice(${i},1);renderTempBadges()" style="cursor:pointer;color:red">×</b></span>
    `).join('');
}

function saveArticle() {
    const art = {
        id: editingId || Date.now(),
        title: document.getElementById('inp-title').value,
        date: document.getElementById('inp-date').value,
        badges: [...tempBadges],
        summary: document.getElementById('inp-summary').value,
        content: document.getElementById('inp-content').value,
        attachedFiles: [...tempAttachedFiles]
    };

    if(editingId) {
        const idx = adminArticles.findIndex(a => a.id === editingId);
        adminArticles[idx] = art;
    } else {
        adminArticles.unshift(art);
    }
    resetForm();
    renderAdminList();
    alert("Enregistré localement. N'oublie pas de Pousser sur GitHub.");
}

function renderAdminList() {
    const l = document.getElementById('existing-articles');
    if (!l) return;
    l.innerHTML = '';

    if (adminArticles.length === 0) {
        l.innerHTML = '<p style="font-size:0.8em; color:gray;">Aucun article.</p>';
        return;
    }

    adminArticles.forEach(a => {
        const div = document.createElement('div');
        div.className = 'tag-chip';
        div.style.display = 'block';
        div.style.marginBottom = '5px';
        div.style.cursor = 'pointer';
        div.innerText = (a.date || '') + " - " + (a.title || 'Sans titre');
        div.onclick = () => loadEdit(a.id);
        l.appendChild(div);
    });
}

function loadEdit(id) {
    const a = adminArticles.find(x => x.id === id);
    if (!a) return;

    editingId = id;
    document.getElementById('inp-title').value = a.title || '';
    document.getElementById('inp-date').value = a.date || '';
    document.getElementById('inp-summary').value = a.summary || '';
    document.getElementById('inp-content').value = a.content || '';
    
    tempBadges = Array.isArray(a.badges) ? [...a.badges] : [];
    tempAttachedFiles = Array.isArray(a.attachedFiles) ? [...a.attachedFiles] : [];
    
    renderTempBadges();
    renderAttachedFilesList();
    document.getElementById('form-title').innerText = "Modifier : " + (a.title || 'Sans titre');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    editingId = null; 
    tempBadges = [];
    tempAttachedFiles = [];
    document.getElementById('editor-form').reset();
    renderTempBadges();
    renderAttachedFilesList();
    document.getElementById('form-title').innerText = "Nouvel Article";
}

// --- FILES MANAGEMENT ---
function switchAdminTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
    
    if (tab === 'files') {
        renderAdminFilesList();
    }
}

function updateFileInput() {
    const type = document.getElementById('file-type').value;
    const area = document.getElementById('file-input-area');
    
    switch(type) {
        case 'pdf':
            area.innerHTML = `
                <label>URL du PDF ou Base64:</label>
                <textarea id="file-content-input" rows="4" placeholder="URL: https://... ou Base64: data:application/pdf;base64,..." required></textarea>
                <small>Collez l'URL du PDF ou le contenu en Base64</small>
            `;
            break;
        case 'code':
            area.innerHTML = `
                <label>Langage:</label>
                <select id="code-language">
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                    <option value="bash">Bash</option>
                    <option value="matlab">MATLAB</option>
                </select>
                <label>Code:</label>
                <textarea id="file-content-input" rows="10" placeholder="Collez votre code ici..." required></textarea>
            `;
            break;
        case 'image':
            area.innerHTML = `
                <label>URL de l'image:</label>
                <input type="url" id="file-content-input" placeholder="https://..." required>
            `;
            break;
        case 'link':
            area.innerHTML = `
                <label>URL:</label>
                <input type="url" id="file-content-input" placeholder="https://..." required>
            `;
            break;
        default:
            area.innerHTML = '';
    }
}

function saveFile() {
    const type = document.getElementById('file-type').value;
    const name = document.getElementById('file-name').value;
    const content = document.getElementById('file-content-input').value;
    const description = document.getElementById('file-description').value;
    
    if (!type || !name || !content) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const file = {
        id: editingFileId || Date.now(),
        name: name,
        type: type,
        content: content,
        description: description,
        createdAt: editingFileId ? adminFiles.find(f => f.id === editingFileId).createdAt : new Date().toISOString()
    };
    
    // Ajouter des métadonnées spécifiques au type
    if (type === 'code') {
        file.language = document.getElementById('code-language').value;
    }
    
    if (editingFileId) {
        const idx = adminFiles.findIndex(f => f.id === editingFileId);
        adminFiles[idx] = file;
    } else {
        adminFiles.unshift(file);
    }
    
    resetFileForm();
    renderAdminFilesList();
    alert("Fichier enregistré localement. N'oubliez pas de pousser sur GitHub.");
}

function renderAdminFilesList() {
    const l = document.getElementById('existing-files');
    if (!l) return;
    l.innerHTML = '';
    
    if (adminFiles.length === 0) {
        l.innerHTML = '<p style="font-size:0.8em; color:gray;">Aucun fichier.</p>';
        return;
    }
    
    adminFiles.forEach(f => {
        const div = document.createElement('div');
        div.className = 'tag-chip';
        div.style.display = 'block';
        div.style.marginBottom = '5px';
        div.style.cursor = 'pointer';
        div.innerHTML = `${getFileIcon(f.type)} ${f.name}`;
        div.onclick = () => loadFileEdit(f.id);
        l.appendChild(div);
    });
}

function loadFileEdit(id) {
    const f = adminFiles.find(x => x.id === id);
    if (!f) return;
    
    editingFileId = id;
    document.getElementById('file-name').value = f.name;
    document.getElementById('file-type').value = f.type;
    document.getElementById('file-description').value = f.description || '';
    
    updateFileInput();
    
    setTimeout(() => {
        document.getElementById('file-content-input').value = f.content;
        if (f.type === 'code' && f.language) {
            document.getElementById('code-language').value = f.language;
        }
    }, 100);
    
    document.getElementById('file-form-title').innerText = "Modifier : " + f.name;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFileForm() {
    editingFileId = null;
    document.getElementById('file-form').reset();
    document.getElementById('file-input-area').innerHTML = '';
    document.getElementById('file-form-title').innerText = "Ajouter un fichier";
}

function getFileIcon(type) {
    const icons = {
        'pdf': '📄',
        'code': '💻',
        'image': '🖼️',
        'link': '🔗',
        'other': '📎'
    };
    return icons[type] || '📎';
}

// --- ATTACH FILES TO ARTICLES ---
function openFileSelector() {
    const modal = document.getElementById('file-selector-modal');
    const list = document.getElementById('file-selector-list');
    
    list.innerHTML = '';
    
    if (adminFiles.length === 0) {
        list.innerHTML = '<p style="color:#888;">Aucun fichier disponible. Créez-en un dans l\'onglet Fichiers.</p>';
    } else {
        adminFiles.forEach(f => {
            const isChecked = tempAttachedFiles.includes(f.id);
            const div = document.createElement('div');
            div.className = 'file-selector-item';
            div.innerHTML = `
                <input type="checkbox" id="file-check-${f.id}" ${isChecked ? 'checked' : ''}>
                <label for="file-check-${f.id}" style="flex: 1; cursor: pointer;">
                    ${getFileIcon(f.type)} ${f.name}
                    ${f.description ? `<br><small style="color:#888;">${f.description}</small>` : ''}
                </label>
            `;
            list.appendChild(div);
        });
    }
    
    modal.style.display = 'block';
}

function closeFileSelector() {
    document.getElementById('file-selector-modal').style.display = 'none';
}

function attachSelectedFiles() {
    const checkboxes = document.querySelectorAll('#file-selector-list input[type="checkbox"]');
    tempAttachedFiles = [];
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const fileId = parseInt(cb.id.replace('file-check-', ''));
            tempAttachedFiles.push(fileId);
        }
    });
    
    renderAttachedFilesList();
    closeFileSelector();
}

function renderAttachedFilesList() {
    const list = document.getElementById('article-files-list');
    if (!list) return;
    
    if (tempAttachedFiles.length === 0) {
        list.innerHTML = '<p style="color:#888;font-size:0.9em;">Aucun fichier attaché</p>';
        return;
    }
    
    list.innerHTML = tempAttachedFiles.map(fileId => {
        const file = adminFiles.find(f => f.id === fileId);
        if (!file) return '';
        
        return `
            <div class="attached-file-item">
                <div class="file-info">
                    ${getFileIcon(file.type)} ${file.name}
                </div>
                <button class="remove-btn" onclick="removeAttachedFile(${fileId})">×</button>
            </div>
        `;
    }).join('');
}

function removeAttachedFile(fileId) {
    tempAttachedFiles = tempAttachedFiles.filter(id => id !== fileId);
    renderAttachedFilesList();
}

// --- VIEW FILES ---
function viewFile(fileId) {
    const file = allFiles.find(f => f.id === fileId);
    if (!file) return;
    
    const modal = document.getElementById('file-modal');
    const title = document.getElementById('file-title');
    const content = document.getElementById('file-content');
    
    title.textContent = file.name;
    
    switch(file.type) {
        case 'pdf':
            if (file.content.startsWith('http')) {
                content.innerHTML = `<iframe src="${file.content}" class="pdf-viewer"></iframe>`;
            } else {
                content.innerHTML = `<iframe src="${file.content}" class="pdf-viewer"></iframe>`;
            }
            break;
            
        case 'code':
            const language = file.language || 'javascript';
            content.innerHTML = `
                <div class="code-viewer">
                    <pre><code class="language-${language}">${escapeHtml(file.content)}</code></pre>
                </div>
            `;
            // Appliquer la coloration syntaxique
            if (typeof hljs !== 'undefined') {
                hljs.highlightAll();
            }
            break;
            
        case 'image':
            content.innerHTML = `<img src="${file.content}" style="max-width:100%; border-radius:4px;">`;
            break;
            
        case 'link':
            content.innerHTML = `
                <p>Lien externe:</p>
                <a href="${file.content}" target="_blank" style="color:var(--accent); word-break:break-all;">${file.content}</a>
                <br><br>
                <button onclick="window.open('${file.content}', '_blank')" class="btn-primary">Ouvrir dans un nouvel onglet</button>
            `;
            break;
    }
    
    if (file.description) {
        content.innerHTML += `<div class="file-description" style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border);">${file.description}</div>`;
    }
    
    modal.style.display = 'block';
}

function closeFileModal() {
    document.getElementById('file-modal').style.display = 'none';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// --- FILES PAGE ---
function initFilesPage() {
    loadFilesForDisplay();
}

async function loadFilesForDisplay() {
    try {
        const res = await fetch(REPO_FILE + '?v=' + Date.now());
        allArticles = await res.json();
    } catch (e) {
        allArticles = [];
    }
    
    try {
        const filesRes = await fetch(FILES_REPO + '?v=' + Date.now());
        allFiles = await filesRes.json();
        renderFilesPage();
    } catch (e) {
        document.getElementById('files-container').innerHTML = '<div class="loading">Aucun fichier disponible</div>';
    }
}

function filterFiles(type) {
    currentFileFilter = type;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    renderFilesPage();
}

function renderFilesPage() {
    const container = document.getElementById('files-container');
    if (!container) return;
    
    let filtered = allFiles;
    if (currentFileFilter !== 'all') {
        filtered = allFiles.filter(f => f.type === currentFileFilter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading">Aucun fichier à afficher</div>';
        return;
    }
    
    container.innerHTML = filtered.map(file => {
        // Trouver les articles liés
        const linkedArticles = allArticles.filter(a => 
            a.attachedFiles && a.attachedFiles.includes(file.id)
        );
        
        const linkedArticlesHtml = linkedArticles.length > 0 ? `
            <div class="file-linked-articles">
                <h4>📌 Utilisé dans:</h4>
                ${linkedArticles.map(a => `
                    <a href="index.html" class="article-link">${a.title}</a>
                `).join('')}
            </div>
        ` : '';
        
        return `
            <div class="file-card">
                <h3>
                    ${getFileIcon(file.type)} ${file.name}
                    <span class="file-type-badge">${file.type.toUpperCase()}</span>
                </h3>
                ${file.description ? `<div class="file-description">${file.description}</div>` : ''}
                <div class="file-actions">
                    <button class="view-btn" onclick="viewFile(${file.id})">👁️ Visualiser</button>
                </div>
                ${linkedArticlesHtml}
            </div>
        `;
    }).join('');
}

// --- GITHUB API ---
async function pushToGitHub() {
    const u = document.getElementById('gh-u').value;
    const r = document.getElementById('gh-r').value;
    const t = document.getElementById('gh-t').value;
    const msg = document.getElementById('status-msg');
    
    ['gh-u', 'gh-r', 'gh-t'].forEach(id => localStorage.setItem(id, document.getElementById(id).value));

    msg.innerText = "⏳ Connexion GitHub...";
    
    try {
        // Push articles
        const url = `https://api.github.com/repos/${u}/${r}/contents/${REPO_FILE}`;
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${t}` } });
        const getJson = await getRes.json();
        
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${t}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Update TIPE Logbook",
                content: btoa(unescape(encodeURIComponent(JSON.stringify(adminArticles, null, 2)))),
                sha: getJson.sha
            })
        });

        if (!putRes.ok) {
            msg.innerText = "❌ Erreur lors de la mise à jour des articles.";
            return;
        }
        
        // Push files
        const filesUrl = `https://api.github.com/repos/${u}/${r}/contents/${FILES_REPO}`;
        try {
            const filesGetRes = await fetch(filesUrl, { headers: { 'Authorization': `token ${t}` } });
            const filesGetJson = await filesGetRes.json();
            
            const filesPutRes = await fetch(filesUrl, {
                method: 'PUT',
                headers: { 'Authorization': `token ${t}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Update TIPE Files",
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(adminFiles, null, 2)))),
                    sha: filesGetJson.sha
                })
            });
            
            if (filesPutRes.ok) {
                msg.innerText = "✅ Articles et fichiers publiés avec succès !";
            } else {
                msg.innerText = "✅ Articles publiés. ⚠️ Erreur fichiers.";
            }
        } catch (e) {
            // Créer le fichier files.json s'il n'existe pas
            const filesCreateRes = await fetch(filesUrl, {
                method: 'PUT',
                headers: { 'Authorization': `token ${t}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Create TIPE Files",
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(adminFiles, null, 2))))
                })
            });
            
            if (filesCreateRes.ok) {
                msg.innerText = "✅ Articles et fichiers publiés avec succès !";
            } else {
                msg.innerText = "✅ Articles publiés. ⚠️ Impossible de créer files.json.";
            }
        }
        
    } catch(e) { 
        msg.innerText = "❌ Erreur réseau/Token."; 
        console.error(e);
    }
}

// Close modals on click outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
