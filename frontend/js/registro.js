async function registrar() {
    const nombre   = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirm').value;
    const errorDiv = document.getElementById('error');

    if (password !== confirm) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Las contraseñas no coinciden';
        return;
    }

    const res = await fetch('/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, apellido, username, password })
    });

    const data = await res.json();

    if (data.ok) {
        window.location.href = 'login.html?exito=1';
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = data.mensaje;
    }
}