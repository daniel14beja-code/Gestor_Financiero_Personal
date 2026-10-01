const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function verificarSesion() {
    const res = await fetch('/auth/sesion', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) { window.location.href = 'login.html'; return; }
    await cargarCategorias();
    await cargarTransaccion();
}

async function cargarCategorias() {
    const res  = await fetch('/categorias', { credentials: 'include' });
    const data = await res.json();
    const sel  = document.getElementById('id_categoria');
    sel.innerHTML = data.data.map(c =>
        `<option value="${c.id_categoria}">${c.tipo === 'ingreso' ? '📈' : '📉'} ${c.nombre}</option>`
    ).join('');
}

async function cargarTransaccion() {
    const res  = await fetch(`/transacciones/${id}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) { window.location.href = 'registros.html'; return; }
    const t = data.data;
    document.getElementById('id_categoria').value = t.id_categoria;
    document.getElementById('fecha').value        = t.fecha.split('T')[0];
    document.getElementById('descripcion').value  = t.descripcion || '';
    document.getElementById('monto').value        = t.monto;
}

async function actualizar() {
    const id_categoria = document.getElementById('id_categoria').value;
    const fecha        = document.getElementById('fecha').value;
    const descripcion  = document.getElementById('descripcion').value;
    const monto        = document.getElementById('monto').value;
    const errorDiv     = document.getElementById('error');

    if (!fecha || !monto) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Fecha y monto son obligatorios';
        return;
    }

    const res  = await fetch(`/transacciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_categoria, fecha, descripcion, monto })
    });
    const data = await res.json();

    if (data.ok) {
        window.location.href = 'registros.html';
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = data.mensaje;
    }
}

verificarSesion();