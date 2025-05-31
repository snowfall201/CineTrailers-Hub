document.addEventListener("DOMContentLoaded", async function () {
    console.log("Cargando el navbar...");

    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) {
        console.error("No se encontró el contenedor del navbar.");
        return;
    }

    try {
        const response = await fetch("navbar.html");
        const navbarHtml = await response.text();
        navbarContainer.innerHTML = navbarHtml;

        verificarAutenticacion();
    } catch (error) {
        console.error("Error al cargar el navbar:", error);
    }
});

fetch('api/auth.php')
    .then(res => res.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById("user-info").style.display = "block";
            document.getElementById("user-name").textContent = data.name;
            document.getElementById("logout-btn").style.display = "inline-block";
            document.getElementById("login-btn").style.display = "none";
            document.getElementById("register-btn").style.display = "none";
        }
    });

async function verificarAutenticacion() {
    console.log("Verificando autenticación...");

    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const userNameDisplay = document.getElementById("user-name");
    const userInfo = document.getElementById("user-info");

    try {
        const response = await fetch("api/auth.php");
        const data = await response.json();
        console.log("Respuesta del servidor:", data); 

        if (data.loggedIn) {
            loginBtn.style.display = "none";
            registerBtn.style.display = "none";
            logoutBtn.style.display = "block";
            userNameDisplay.textContent = `${data.name}`;
            userInfo.style.display = "block";
        } else {
            loginBtn.style.display = "block";
            registerBtn.style.display = "block";
            logoutBtn.style.display = "none";
            userNameDisplay.textContent = "";
            userInfo.style.display = "none";
        }
    } catch (error) {
        console.error("Error verificando autenticación:", error);
    }

    logoutBtn.addEventListener("click", async function () {
        await fetch("api/logout.php", { method: "POST" });
        localStorage.removeItem("userId");
        window.location.reload(); 
    });
}
