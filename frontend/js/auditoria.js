async function init() {
    await cargarSidebar();
    cargarAuditoria();
}

async function cargarAuditoria(desde = '', hasta = '') {
    let url = '/auditoria';
    if (desde && hasta) url += `?desde=${desde}&hasta=${hasta}`;
    const res  = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    const tbody = document.getElementById('tablaAuditoria');

    if (!data.ok || data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">No hay registros de auditoría.</td></tr>';
        return;
    }

    tbody.innerHTML = data.data.map(a => {
        const badgeClass = a.accion === 'INSERT' ? 'badge-admin' : a.accion === 'DELETE' ? 'badge-user' : '';
        const badgeStyle = a.accion === 'UPDATE' ? 'style="background:rgba(250,200,80,0.15);color:#f5c842;"' : '';
        return `
        <tr>
            <td>${a.id_auditoria}</td>
            <td>${a.id_transaccion || '-'}</td>
            <td><span class="badge ${badgeClass}" ${badgeStyle}>${a.accion}</span></td>
            <td>${new Date(a.fecha).toLocaleString('es-CO')}</td>
            <td>${a.descripcion || ''}</td>
        </tr>`;
    }).join('');
}

function filtrar() {
    const desde = document.getElementById('desde').value;
    const hasta = document.getElementById('hasta').value;
    if (!desde || !hasta) { alert('Selecciona las dos fechas'); return; }
    cargarAuditoria(desde, hasta);
}

function limpiar() {
    document.getElementById('desde').value = '';
    document.getElementById('hasta').value = '';
    cargarAuditoria();
}

init();