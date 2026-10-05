async function init() {
    await cargarSidebar();
    cargarCategorias();
    document.getElementById('fecha').valueAsDate = new Date();
}

async function cargarCategorias() {
    const res  = await fetch('/categorias/ingreso', { credentials: 'include' });
    const data = await res.json();
    const sel  = document.getElementById('id_categoria');
    sel.innerHTML = data.data.map(c =>
        `<option value="${c.id_categoria}">${c.nombre}</option>`
    ).join('');
}

async function registrar() {
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

    const res  = await fetch('/transacciones', {
        method: 'POST',
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

init();