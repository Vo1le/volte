const REPO_FILE = "data.json";
let currentFilter = null;
let allArticles = [];
let adminArticles = [];
let tempBadges = [];
let editingId = null;

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('articles-container')) initPublic();
    if (document.getElementById('admin-page')) initAdmin();
});

function checkAdmin() {
    const p = prompt("Accès Admin :");
    if (p === "mpi2024") window.location.href = "admin.html";
}

// --- LOGIQUE PUBLIQUE ---
async function initPublic() {
    try {
        const res = await fetch(REPO_FILE + '?v=' + Date.now());
        allArticles = await res.json();
        renderArticles();
    } catch (e) { console.error("Erreur chargement JSON"); }
}

function renderArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    
    let filtered = currentFilter ? allArticles.filter(a => a.badges.some(b => b.text === currentFilter)) : allArticles;

    filtered.forEach(art => {
        const badgesHtml = art.badges.map(b => `<span class="custom-badge" style="background:${b.color}">${b.text}</span>`).join('');
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
                </div>
            </details>`;
        container.appendChild(div);
    });
    renderFilters();
}

function renderFilters() {
    const chipBox = document.getElementById('filter-chips');
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

function clearFilter() { currentFilter = null; renderArticles(); }

function sortArticles() {
    const mode = document.getElementById('sort-select').value;
    allArticles.sort((a, b) => mode === 'date-desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    renderArticles();
}

// --- LOGIQUE ADMIN ---
async function initAdmin() {
    const p = prompt("Confirmer Mot de Passe :");
    if (p !== "mpi2024") return window.location.href = "index.html";
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
        content: document.getElementById('inp-content').value
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
    l.innerHTML = adminArticles.map(a => `<div class="tag-chip" style="display:block;margin-bottom:5px" onclick="loadEdit(${a.id})">${a.title}</div>`).join('');
}

function loadEdit(id) {
    const a = adminArticles.find(x => x.id === id);
    editingId = id;
    document.getElementById('inp-title').value = a.title;
    document.getElementById('inp-date').value = a.date;
    document.getElementById('inp-summary').value = a.summary;
    document.getElementById('inp-content').value = a.content;
    tempBadges = [...a.badges];
    renderTempBadges();
    document.getElementById('form-title').innerText = "Modifier : " + a.title;
}

function resetForm() {
    editingId = null; tempBadges = [];
    document.getElementById('editor-form').reset();
    renderTempBadges();
}

// --- GITHUB API ---
async function pushToGitHub() {
    const u = document.getElementById('gh-u').value;
    const r = document.getElementById('gh-r').value;
    const t = document.getElementById('gh-t').value;
    const msg = document.getElementById('status-msg');
    
    ['gh-u', 'gh-r', 'gh-t'].forEach(id => localStorage.setItem(id, document.getElementById(id).value));

    msg.innerText = "⏳ Connexion GitHub...";
    const url = `https://api.github.com/repos/${u}/${r}/contents/${REPO_FILE}`;
    
    try {
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

        if(putRes.ok) msg.innerText = "✅ Publié avec succès !";
        else msg.innerText = "❌ Erreur API GitHub.";
    } catch(e) { msg.innerText = "❌ Erreur réseau/Token."; }
}
