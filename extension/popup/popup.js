const SUPABASE_URL = "https://rfjsqxntwbyexfbgabzn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jsa4hkOCAFSNBc5mdsxWKQ_soxZ3LV7";

document.addEventListener('DOMContentLoaded', async () => {
    const loginSection = document.getElementById('loginSection');
    const workspaceSection = document.getElementById('workspaceSection');
    
    const emailInput = document.getElementById('emailInput');
    const passInput = document.getElementById('passInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const projectSelect = document.getElementById('projectSelect');
    const columnSelect = document.getElementById('columnSelect');
    const saveWorkspaceBtn = document.getElementById('saveWorkspaceBtn');
    const saveMsg = document.getElementById('saveMsg');
    const openKanbanBtn = document.getElementById('openKanbanBtn');
    const statusText = document.getElementById('statusText');

    let currentSession = null;
    let projectsCache = [];

    // Query status from background
    chrome.runtime.sendMessage({ type: 'VTRACKER_GET_STATUS' }, (response) => {
        if (response) {
            statusText.textContent = `✅ Ativo — ${response.captureCount} captura(s) | ${response.pendingTasks} pendente(s)`;
        }
    });

    openKanbanBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://vtracker-kanban.vercel.app/' });
    });

    // INIT
    chrome.storage.local.get(['supabaseSession', 'vtrackerProjectId', 'vtrackerColumnId'], async (res) => {
        if (res.supabaseSession && res.supabaseSession.access_token) {
            currentSession = res.supabaseSession;
            showWorkspace();
            await loadProjects(res.vtrackerProjectId, res.vtrackerColumnId);
        } else {
            showLogin();
        }
    });

    function showLogin() {
        loginSection.classList.remove('hidden');
        workspaceSection.classList.add('hidden');
    }

    function showWorkspace() {
        loginSection.classList.add('hidden');
        workspaceSection.classList.remove('hidden');
    }

    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email || !password) return;

        loginBtn.textContent = 'Aguarde...';
        loginBtn.disabled = true;
        loginError.classList.add('hidden');

        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error_description || data.msg || 'Erro de autenticação');
            }

            currentSession = data;
            await chrome.storage.local.set({ supabaseSession: currentSession });
            showWorkspace();
            await loadProjects();
        } catch (e) {
            loginError.textContent = e.message;
            loginError.classList.remove('hidden');
        } finally {
            loginBtn.textContent = 'Entrar';
            loginBtn.disabled = false;
        }
    });

    logoutBtn.addEventListener('click', () => {
        chrome.storage.local.remove(['supabaseSession', 'vtrackerProjectId', 'vtrackerColumnId'], () => {
            currentSession = null;
            showLogin();
            projectSelect.innerHTML = '<option value="">Carregando...</option>';
            columnSelect.innerHTML = '<option value="">Escolha um projeto</option>';
        });
    });

    async function loadProjects(savedProjectId, savedColumnId) {
        projectSelect.disabled = true;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=id,name&user_id=eq.${currentSession.user.id}&order=updated_at.desc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${currentSession.access_token}`
                }
            });
            if (!res.ok) throw new Error('Falha ao carregar projetos');
            projectsCache = await res.json();
            
            projectSelect.innerHTML = '<option value="">Selecione o Projeto...</option>';
            projectsCache.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                projectSelect.appendChild(opt);
            });
            
            projectSelect.disabled = false;
            
            if (savedProjectId && projectsCache.find(p => p.id === savedProjectId)) {
                projectSelect.value = savedProjectId;
                await loadColumns(savedProjectId, savedColumnId);
            }
        } catch (e) {
            console.error(e);
            projectSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    projectSelect.addEventListener('change', async (e) => {
        const pId = e.target.value;
        if (pId) {
            await loadColumns(pId);
        } else {
            columnSelect.innerHTML = '<option value="">Escolha um projeto</option>';
            columnSelect.disabled = true;
        }
    });

    async function loadColumns(projectId, savedColumnId) {
        columnSelect.disabled = true;
        columnSelect.innerHTML = '<option value="">Carregando...</option>';
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/columns?select=id,name&project_id=eq.${projectId}&order=position.asc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${currentSession.access_token}`
                }
            });
            if (!res.ok) throw new Error('Falha');
            const cols = await res.json();
            
            columnSelect.innerHTML = '<option value="">Selecione a Coluna...</option>';
            cols.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                columnSelect.appendChild(opt);
            });
            
            columnSelect.disabled = false;
            if (savedColumnId && cols.find(c => c.id === savedColumnId)) {
                columnSelect.value = savedColumnId;
            }
        } catch (e) {
            columnSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    saveWorkspaceBtn.addEventListener('click', () => {
        const vtrackerProjectId = projectSelect.value;
        const vtrackerColumnId = columnSelect.value;
        if (!vtrackerProjectId || !vtrackerColumnId) {
            alert('Por favor, selecione um projeto e uma coluna.');
            return;
        }
        chrome.storage.local.set({ vtrackerProjectId, vtrackerColumnId }, () => {
            saveMsg.classList.remove('hidden');
            setTimeout(() => saveMsg.classList.add('hidden'), 2000);
        });
    });
});
