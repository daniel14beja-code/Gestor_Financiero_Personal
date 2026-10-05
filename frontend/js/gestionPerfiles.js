async function init() {
    await cargarSidebar();
    cargarTodo();
}

async function cargarTodo() {
    await cargarPerfiles();
    await cargarUsuarios();
}

async function cargarPerfiles() {
    const res  = await fetch('/perfiles', { credentials: 'include' });
    const data = await res.json();
    const tbody = document.getElementById('tablaPerfiles');
    const sel   = document.getElementById('selectPerfil');

    tbody.innerHTML = data.data.map(p => {
        const protegido = p.perfil === 'admin' || p.perfil === 'user';
        const badgeClass = p.perfil === 'admin' ? 'badge-admin' : 'badge-user';
        return `
        <tr>
            <td>${p.id_perfil}</td>
            <td><span class="badge ${badgeClass}">${p.perfil}</span></td>
            <td>${protegido
                ? '<span style="color:var(--muted);font-size:0.8rem;">Protegido</span>'
                : `<button onclick="eliminarPerfil(${p.id_perfil})" class="btn btn-danger">Eliminar</button>`
            }</td>
        </tr>`;
    }).join('');

    sel.innerHTML = data.data.map(p =>
        `<option value="${p.id_perfil}">${p.perfil}</option>`
    ).join('');
}

async function cargarUsuarios() {
    const res  = await fetch('/usuarios', { credentials: 'include' });
    const data = await res.json();
    const sel  = document.getElementById('selectUsuario');
    sel.innerHTML = data.data.map(u =>
        `<option value="${u.id_usuario}">${u.nombre} ${u.apellido} (${u.username})</option>`
    ).join('');
}

async function crearPerfil() {
    const perfil = document.getElementById('nuevoPerfil').value.trim();
    if (!perfil) return;
    const res  = await fetch('/perfiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ perfil })
    });
    const data = await res.json();
    if (data.ok) {
        document.getElementById('nuevoPerfil').value = '';
        mostrarMensaje('Perfil creado correctamente.', true);
        cargarPerfiles();
    } else {
        mostrarMensaje(data.mensaje, false);
    }
}

async function eliminarPerfil(id) {
    if (!confirm('¿Eliminar este perfil?')) return;
    const res  = await fetch(`/perfiles/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.ok) {
        mostrarMensaje('Perfil eliminado.', true);
        cargarPerfiles();
    } else {
        mostrarMensaje('Error al eliminar.', false);
    }
}

async function asignarPerfil() {
    const id_usuario = document.getElementById('selectUsuario').value;
    const id_perfil  = document.getElementById('selectPerfil').value;
    const res  = await fetch('/perfiles/asignar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_usuario, id_perfil })
    });
    const data = await res.json();
    if (data.ok) {
        mostrarMensaje('Perfil asignado correctamente.', true);
    } else {
        mostrarMensaje('Error al asignar.', false);
    }
}

function mostrarMensaje(texto, exito) {
    const div = document.getElementById('mensaje');
    div.textContent = texto;
    div.style.display = 'block';
    div.style.background = exito ? 'rgba(74,222,128,0.1)' : 'rgba(255,92,92,0.1)';
    div.style.borderColor = exito ? 'var(--success)' : 'var(--danger)';
    div.style.color       = exito ? 'var(--success)' : 'var(--danger)';
    setTimeout(() => div.style.display = 'none', 3000);
}

init();