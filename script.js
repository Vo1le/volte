const REPO_FILE = "data.json";

// --- PARTIE PUBLIQUE (INDEX) ---
async function loadArticles() {
    if (!document.getElementById('articles-container')) return;
    try {
        const response = await fetch(REPO_FILE + '?t=' + Date.now()); // Anti-cache
        window.allArticles = await response.json();
        renderArticles(window.allArticles);
    } catch (e) { console.error("Erreur load:", e); }
}

function renderArticles(list) {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    list.forEach(art => {
        const div = document.createElement('div');
        div.className = 'article-card';
        div.innerHTML = `
            <details open>
                <summary>
                    <span>${art.title}</span>
                    <span class="meta-info">[${art.tags.join(', ')}] - ${art.date}</span>
                </summary>
                <div class="article-content">
                    <div class="article-summary">${art.summary}</div>
                    <div>${art.content}</div>
                </div>
            </details>`;
        container.appendChild(div);
    });
}

function sortArticles() {
    const mode = document.getElementById('sort-select').value;
    let sorted = [...window.allArticles];
    if (mode === 'date-desc') sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (mode === 'date-asc') sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (mode === 'tag') sorted.sort((a, b) => a.tags[0].localeCompare(b.tags[0]));
    renderArticles(sorted);
}

function checkAdmin() {
    if (prompt("Mot de passe :") === "mpi2024") window.location.href = "admin.html";
}

// --- PARTIE ADMIN ---
let adminArticles = [];
let editingId = null;

async function initAdmin() {
    if (!document.getElementById('editor-form')) return;
    
    // Auto-fill GitHub creds
    if(localStorage.getItem('gh_u')) document.getElementById('gh-username').value = localStorage.getItem('gh_u');
    if(localStorage.getItem('gh_r')) document.getElementById('gh-repo').value = localStorage.getItem('gh_r');
    if(localStorage.getItem('gh_t')) document.getElementById('gh-token').value = localStorage.getItem('gh_t');

    try {
        const res = await fetch(REPO_FILE);
        adminArticles = await res.json();
        renderAdminList();
    } catch(e) { adminArticles = []; }
}

function renderAdminList() {
    const list = document.getElementById('existing-articles');
    list.innerHTML = '';
    adminArticles.forEach(art => {
        const div = document.createElement('div');
        div.className = 'article-list-item';
        div.innerText = `${art.date} - ${art.title}`;
        div.onclick = () => loadEdit(art.id);
        list.appendChild(div);
    });
}

function loadEdit(id) {
    const art = adminArticles.find(a => a.id === id);
    editingId = id;
    document.getElementById('inp-title').value = art.title;
    document.getElementById('inp-date').value = art.date;
    document.getElementById('inp-tags').value = art.tags.join(', ');
    document.getElementById('inp-summary').value = art.summary;
    document.getElementById('inp-content').value = art.content;
    document.getElementById('form-title').innerText = "Modification : " + art.title;
}

function saveArticle() {
    const data = {
        id: editingId || Date.now(),
        title: document.getElementById('inp-title').value,
        date: document.getElementById('inp-date').value,
        tags: document.getElementById('inp-tags').value.split(',').map(t=>t.trim()),
        summary: document.getElementById('inp-summary').value,
        content: document.getElementById('inp-content').value
    };

    if(editingId) {
        const idx = adminArticles.findIndex(a => a.id === editingId);
        adminArticles[idx] = data;
    } else {
        adminArticles.unshift(data);
    }
    
    renderAdminList();
    resetForm();
    alert("Sauvegardé en mémoire locale. Pense à POUSSER SUR GITHUB !");
}

function resetForm() {
    editingId = null;
    document.getElementById('editor-form').reset();
    document.getElementById('form-title').innerText = "Nouvel Article";
}

// --- GITHUB API ---
function saveConfig() {
    localStorage.setItem('gh_u', document.getElementById('gh-username').value);
    localStorage.setItem('gh_r', document.getElementById('gh-repo').value);
    localStorage.setItem('gh_t', document.getElementById('gh-token').value);
    alert("Config sauvegardée !");
}

function utf8_to_b64(str) { return window.btoa(unescape(encodeURIComponent(str))); }

async function pushToGitHub() {
    const user = document.getElementById('gh-username').value;
    const repo = document.getElementById('gh-repo').value;
    const token = document.getElementById('gh-token').value;
    const msg = document.getElementById('status-msg');
    
    if(!user || !repo || !token) return alert("Infos GitHub manquantes");
    
    msg.style.color = "yellow"; msg.innerText = "⏳ Envoi en cours...";
    
    try {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/${REPO_FILE}`;
        
        // 1. Get SHA
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}` } });
        const getJson = await getRes.json();
        
        // 2. Push Update
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Update TIPE via Admin",
                content: utf8_to_b64(JSON.stringify(adminArticles, null, 2)),
                sha: getJson.sha
            })
        });

        if(putRes.ok) { msg.style.color = "#4caf50"; msg.innerText = "✅ Succès ! Mise à jour dans ~1min."; } 
        else throw new Error("Erreur API");
        
    } catch(e) {
        console.error(e);
        msg.style.color = "red"; msg.innerText = "❌ Erreur (Vérifie Token/Repo)";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    initAdmin();
});