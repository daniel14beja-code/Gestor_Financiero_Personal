async function verificarSesion() {
    const res  = await fetch('/auth/sesion', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) { window.location.href = 'login.html'; return; }
    if (data.usuario.idPerfil !== 1) { window.location.href = 'dashboard.html'; return; }
    cargarUsuarios();
}

async function cargarUsuarios() {
    const res  = await fetch('/usuarios', { credentials: 'include' });
    const data = await res.json();
    const tbody = document.getElementById('tablaUsuarios');

    if (!data.ok || data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);">No hay usuarios.</td></tr>';
        return;
    }

    tbody.innerHTML = data.data.map(u => {
        const badgeClass = u.perfil === 'admin' ? 'badge-admin' : 'badge-user';
        const fecha = new Date(u.fecha_creacion).toLocaleDateString('es-CO');
        return `
        <tr>
            <td>${u.nombre}</td>
            <td>${u.apellido}</td>
            <td>${u.username}</td>
            <td><span class="badge ${badgeClass}">${u.perfil}</span></td>
            <td>${u.estado}</td>
            <td>${fecha}</td>
        </tr>`;
    }).join('');
}

verificarSesion();