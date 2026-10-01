async function verificarSesion() {
    const res = await fetch('/auth/sesion', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) { window.location.href = 'login.html'; return; }
    cargarRegistros();
}

async function cargarRegistros() {
    const res  = await fetch('/transacciones', { credentials: 'include' });
    const data = await res.json();
    const tbody = document.getElementById('tablaRegistros');

    if (!data.ok || data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);">No hay registros aún.</td></tr>';
        return;
    }

    tbody.innerHTML = data.data.map(t => {
        const esIngreso = t.tipo_cat === 'ingreso';
        const badge = esIngreso
            ? '<span class="badge badge-admin">Ingreso</span>'
            : '<span class="badge badge-user">Gasto</span>';
        const monto = (esIngreso ? '+' : '-') + '$' + parseFloat(t.monto).toLocaleString('es-CO', { minimumFractionDigits: 2 });
        const color = esIngreso ? 'var(--success)' : 'var(--danger)';
        return `
        <tr>
            <td>${t.fecha}</td>
            <td>${badge}</td>
            <td>${t.nom_cat}</td>
            <td>${t.descripcion || ''}</td>
            <td style="color:${color};font-weight:600;">${monto}</td>
            <td>
                <div class="td-actions">
                    <a href="editarTransaccion.html?id=${t.id_transaccion}" class="btn btn-edit">Editar</a>
                    <button onclick="eliminar(${t.id_transaccion})" class="btn btn-danger">Eliminar</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

async function eliminar(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    const res  = await fetch(`/transacciones/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.ok) {
        mostrarMensaje('Registro eliminado correctamente.', true);
        cargarRegistros();
    } else {
        mostrarMensaje('Error al eliminar.', false);
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

verificarSesion();