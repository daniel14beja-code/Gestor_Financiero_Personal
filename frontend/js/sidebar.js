async function cargarSidebar() {
    const res = await fetch('/auth/sesion', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) { window.location.href = 'login.html'; return; }

    const u = data.usuario;
    const esAdmin = u.idPerfil === 1;

    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <div class="sidebar-header">
        <div class="brand">Gestor<span>F</span></div>
        <button class="toggle-btn" onclick="toggleSidebar()" title="Ocultar menú">
            <svg id="iconoSidebar" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <rect x="3" y="3" width="18" height="18" rx="2"/>
                 <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
        </button>
        </div>
        <div class="sidebar-user">
            <div class="user-info">
                <span class="user-name">${u.nombre}</span>
                <span class="badge ${esAdmin ? 'badge-admin' : 'badge-user'}">${u.perfil}</span>
            </div>
        </div>
        <div class="sidebar-menu">
            <div class="sidebar-label">Menú</div>
            <a href="dashboard.html"        class="sidebar-link">🏠 Inicio</a>
            <a href="registros.html"        class="sidebar-link">📋 Ver registros</a>
            <a href="regIngreso.html"       class="sidebar-link">➕ Registrar ingreso</a>
            <a href="regGasto.html"         class="sidebar-link">➖ Registrar gasto</a>
            <a href="balance.html"          class="sidebar-link">📊 Ver balance</a>
            <a href="auditoria.html"        class="sidebar-link">🔍 Auditoría</a>
            ${esAdmin ? `
            <div class="sidebar-label" style="margin-top:20px;">Administración</div>
            <a href="gestionPerfiles.html"  class="sidebar-link admin-link">👤 Gestión de perfiles</a>
            <a href="listaUsuarios.html"    class="sidebar-link admin-link">👥 Lista de usuarios</a>
            ` : ''}
        </div>
        <div class="sidebar-footer">
            <button onclick="logout()" class="sidebar-link" style="width:100%;text-align:left;background:none;border:none;cursor:pointer;">
                🚪 Cerrar sesión
            </button>
        </div>
    `;

    const links = sidebar.querySelectorAll('.sidebar-link');
    links.forEach(link => {
        if (link.href && link.href.includes(window.location.pathname.split('/').pop())) {
            link.classList.add('active');
        }
    });

    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
        const icono = document.getElementById('iconoSidebar');
        if (icono) {
            icono.innerHTML = `
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <polyline points="15 9 9 12 15 15"/>`;
        }
    }

    return u;
}

function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const collapsed = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', collapsed);

    const icono = document.getElementById('iconoSidebar');
    if (collapsed) {
        icono.innerHTML = `
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <polyline points="15 9 9 12 15 15"/>`;
    } else {
        icono.innerHTML = `
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>`;
    }
}

async function logout() {
    await fetch('/auth/logout', { credentials: 'include' });
    window.location.href = 'login.html';
}