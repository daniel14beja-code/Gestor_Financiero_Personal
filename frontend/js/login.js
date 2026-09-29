// Verificar si ya hay sesión activa
async function verificarSesion() {
    const res = await fetch('/auth/sesion', { credentials: 'include' });
    const data = await res.json();
    if (data.ok) window.location.href = 'dashboard.html';
}
verificarSesion();

// Mostrar mensaje de éxito si viene de registro
const params = new URLSearchParams(window.location.search);
if (params.get('exito')) {
    document.getElementById('exito').style.display = 'block';
    document.getElementById('exito').textContent = 'Cuenta creada exitosamente. Inicia sesión.';
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.ok) {
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = data.mensaje;
    }
}

// Login con Enter
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
});