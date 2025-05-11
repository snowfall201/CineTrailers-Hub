document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); 

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); 
        if (data.userId) {
            sessionStorage.setItem("user_id", data.userId);
            sessionStorage.setItem("user_name", data.userName);

            document.getElementById("message-container").innerHTML = `<div class="alert alert-success">Bienvenido, ${data.userName}!</div>`;
            
            document.getElementById("login-form").style.display = "none";

            setTimeout(function() {
                window.location.href = "index.html"; 
            }, 2000);  
        } else {
            document.getElementById("message-container").innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        }
    })
    .catch(error => {
        console.error("Error en el login:", error);
    });
});
