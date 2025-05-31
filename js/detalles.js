document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return mostrarError("No se encontró la película.");

    cargarDetalles(id); 

    const form = document.getElementById("comentario-form");
    if (form) {
        form.removeEventListener("submit", manejarEnvioComentario); 
        form.addEventListener("submit", manejarEnvioComentario);
    }

    configurarEstrellas();
});

        function mostrarError(mensaje) {
            document.getElementById('detalle-pelicula').innerHTML = `<p class="text-white">${mensaje}</p>`;
        }

        //aqui cargamos los datos de las peliculas y creamos el html donde mostraremos esos datos
        function cargarDetalles(id) {
            fetch(`api/detalles.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) return mostrarError(data.error);

                    const imagenUrl = data.poster_path
                        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                        : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

                    document.getElementById('detalle-pelicula').innerHTML = `
                        <div class="row movie-detail">
                            <div class="col-md-4"><img src="${imagenUrl}" class="img-fluid rounded" alt="${data.titulo}"></div>
                            <div class="col-md-8">
                                <h2 class="text-white">${data.titulo}</h2>
                                <p class="text-white">${data.sinopsis}</p>
                                <p class="text-white"><strong>Fecha de lanzamiento:</strong> ${data.fecha_lanzamiento}</p>
                                <p class="text-white">
                                <strong>Calificación:</strong>
                                <span id="calificacion-estrellas" class="me-2 stars-rtl"></span>
                                <span id="calificacion-promedio"></span>
                                </p>
                            </div>
                        </div>`;
                    
                        //comprobamos si el trailer esta disponible en youtube
                    if (data.trailer_url) {
                        document.getElementById('trailer-container').innerHTML = `
                            <iframe src="https://www.youtube.com/embed/${data.trailer_url}" 
                                    title="YouTube video player" frameborder="0" allowfullscreen></iframe>`;
                    } else {
                        document.getElementById('trailer-container').innerHTML = '<p class="text-white">Tráiler no disponible.</p>';
                    }

                    cargarComentarios(id);
                })
                .catch(error => console.error('Error al cargar los detalles:', error));
        }

        
        //optemos los datos de los comentarios por un json y los cargamos a la pagina
        function cargarComentarios(id) {
            fetch(`api/comentarios.php?id=${id}`)
                .then(response => response.text())
                .then(text => {
                    console.log("Respuesta del servidor:", text); 

                    let comentarios;
                    try {
                        comentarios = JSON.parse(text);
                    } catch (error) {
                        throw new Error("La respuesta no es JSON válido");
                    }

                    if (comentarios.error) {
                        throw new Error(comentarios.error); 
                    }

                    const container = document.getElementById('comentarios-container');
                    container.innerHTML = '';

                    if (comentarios.length === 0) {
                        container.innerHTML = "<p class='text-warning'>No hay comentarios aún.</p>";
                        return;
                    }

                    let totalPuntos = comentarios.reduce((sum, c) => sum + parseInt(c.puntuacion), 0);
                    let promedio = (totalPuntos / comentarios.length).toFixed(1);
                    document.getElementById("calificacion-promedio").textContent = `(${promedio})`;

                    const promedioContainer = document.getElementById("calificacion-estrellas");
                    promedioContainer.innerHTML = "";
                    for (let i = 1; i <= 5; i++) {
                        const star = document.createElement("i");
                        star.className = i <= Math.round(promedio) ? "bi bi-star-fill text-warning" : "bi bi-star text-secondary";
                        star.style.fontSize = "1.2rem";
                        promedioContainer.appendChild(star);
                    }

                    fetch(`api/auth.php`)
                        .then(response => response.json())
                        .then(userData => {
                            const userName = userData.name;

                            comentarios.forEach(comentario => {
                                let estrellasHTML = "";
                                for (let i = 1; i <= 5; i++) {
                                    estrellasHTML += `<i class="${i <= comentario.puntuacion ? 'bi bi-star-fill text-warning' : 'bi bi-star text-secondary'} me-1"></i>`;
                                }

                                let botones = "";
                                if (userName === comentario.usuario) { 
                                    botones = `
                                        <button class="btn btn-sm btn-primary" onclick="editarComentario(${comentario.id}, '${comentario.comentario}', ${comentario.puntuacion})">✏️ Editar</button>
                                        <button class="btn btn-sm btn-danger" onclick="eliminarComentario(${comentario.id}, ${id})">🗑 Eliminar</button>
                                    `;
                                }

                                container.innerHTML += `
                                    <div class="card comment-card">
                                        <div class="card-body">
                                            <h6 class="text-info">${comentario.usuario}</h6>
                                            <p id="comentario-texto-${comentario.id}">${comentario.comentario}</p>
                                            <div class="mb-2 stars-rtl" id="comentario-estrellas-${comentario.id}">${estrellasHTML}</div>
                                            <small class="text-muted">Publicado el ${new Date(comentario.fecha).toLocaleDateString()}</small>
                                            <div>${botones}</div>
                                        </div>
                                    </div>`;
                            });
                        })
                        .catch(error => console.error("Error al obtener el usuario:", error));
                })
                .catch(error => console.error("Error al cargar los comentarios:", error));
        }


        function enviarComentario(id) {
            const comentario = document.getElementById("comentario").value.trim();
            const seleccion = document.querySelector('input[name="rating"]:checked');
            const puntuacion = seleccion ? seleccion.value : 0;

            const botonEnviar = document.getElementById("btn-enviar");
        
            if (!comentario || puntuacion < 1 || puntuacion > 5) {
                return alert("Comentario y calificación obligatorios (1–5).");
            }
        
            botonEnviar.disabled = true; 
        
            fetch("api/comentarios.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, comentario, puntuacion })
            })
            .then(response => response.json())
            .then(() => {
                document.getElementById("comentario").value = "";
                document.getElementById("puntuacion").value = "0";
                cargarComentarios(id);
            })
            .catch(error => console.error("Error al enviar el comentario:", error))
            .finally(() => {
                botonEnviar.disabled = false; 
            });
        }   

        document.addEventListener("DOMContentLoaded", function () {
            const form = document.getElementById("comentario-form");
        
            if (form) {
                form.removeEventListener("submit", manejarEnvioComentario); 
                form.addEventListener("submit", manejarEnvioComentario);
            }
        });
        
        function manejarEnvioComentario(event) {
            event.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            enviarComentario(id);
        }
        
       function editarComentario(comentarioId, comentarioTexto, puntuacion) {
        document.getElementById(`comentario-texto-${comentarioId}`).innerHTML = `
            <textarea id="nuevo-comentario-${comentarioId}" class="form-control mb-2">${comentarioTexto}</textarea>`;

        let estrellasHTML = `<div class="star-edit stars-rtl mb-2" id="edit-stars-${comentarioId}">`;
        for (let i = 5; i >= 1; i--) {
            estrellasHTML += `
                <input type="radio" id="edit-star-${i}-${comentarioId}" name="edit-rating-${comentarioId}" value="${i}" ${puntuacion == i ? "checked" : ""} hidden>
                <label for="edit-star-${i}-${comentarioId}" class="bi bi-star-fill" style="font-size: 1.2rem; color: ${i <= puntuacion ? '#ffc107' : '#ccc'}; cursor: pointer;"></label>
            `;
        }
        estrellasHTML += `</div>`;

        document.getElementById(`comentario-estrellas-${comentarioId}`).innerHTML = estrellasHTML;

        document.getElementById(`comentario-texto-${comentarioId}`).insertAdjacentHTML(
            'afterend',
            `<button class="btn btn-sm btn-success" onclick="guardarEdicion(${comentarioId})">💾 Guardar</button>`
        );

        const labels = document.querySelectorAll(`#edit-stars-${comentarioId} label`);
        labels.forEach(label => {
            label.addEventListener("click", () => {
                const val = parseInt(label.getAttribute("for").split("-")[2]);
                labels.forEach(l => {
                    const i = parseInt(l.getAttribute("for").split("-")[2]);
                    l.style.color = i <= val ? "#ffc107" : "#ccc";
                });
            });
        });
    }


       function guardarEdicion(comentarioId) {
        const nuevoComentario = document.getElementById(`nuevo-comentario-${comentarioId}`).value.trim();
        const seleccion = document.querySelector(`input[name="edit-rating-${comentarioId}"]:checked`);
        const nuevaPuntuacion = seleccion ? seleccion.value : 0;

        fetch("api/comentarios.php", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comentario_id: comentarioId, comentario: nuevoComentario, puntuacion: nuevaPuntuacion })
        })
        .then(response => response.json())
        .then(() => {
            const urlParams = new URLSearchParams(window.location.search);
            cargarComentarios(urlParams.get('id'));
        })
        .catch(error => console.error("Error al editar comentario:", error));
    }

         
        function eliminarComentario(comentarioId, movieId) {
            if (!confirm("¿Seguro que deseas eliminar este comentario?")) return;
        
            fetch("api/comentarios.php", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comentario_id: comentarioId })  
            })
            .then(response => response.json())
            .then(() => {
                console.log(`Comentario ${comentarioId} eliminado.`);
                cargarComentarios(movieId); 
            })
            .catch(error => console.error("Error al eliminar comentario:", error));
        }

function configurarEstrellas() {
  const estrellas = document.querySelectorAll('#rating label');
  estrellas.forEach(label => {
    label.addEventListener('click', () => {
      label.style.transform = 'scale(1.2)';
      setTimeout(() => label.style.transform = 'scale(1)', 200);
    });
  });
}
