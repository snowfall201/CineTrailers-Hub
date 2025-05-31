document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const captchaToken = grecaptcha.getResponse();

    if (!captchaToken) {
        alert("Por favor completa el reCAPTCHA.");
        return;
    }

    fetch("api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, captcha: captchaToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("Registro exitoso. Ahora puedes iniciar sesión.");
            window.location.href = "login.html";
        } else {
            alert("Error: " + data.error);
        }
    });
});
