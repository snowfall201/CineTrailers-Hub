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
                                <p class="text-white"><strong>Calificación:</strong> <span id="calificacion">Cargando...</span></p>
                            </div>
                        </div>`;
                    
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
        
                    let totalPuntos = 0;
                    comentarios.forEach(comentario => totalPuntos += comentario.puntuacion);
                    let promedio = (comentarios.length > 0) ? (totalPuntos / comentarios.length).toFixed(1) : "N/A";
                    let estrellasPromedio = "⭐".repeat(Math.round(promedio)) + "☆".repeat(5 - Math.round(promedio));
                    document.getElementById("calificacion").innerHTML = `${estrellasPromedio} (${promedio})`;
        
                    fetch(`api/auth.php`)
                        .then(response => response.json())
                        .then(userData => {
                            const userId = userData.userId; 
                            const userName = userData.name; 

                            comentarios.forEach(comentario => {
                                let estrellas = "⭐".repeat(comentario.puntuacion) + "☆".repeat(5 - comentario.puntuacion);
                                
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
                                            <p class="text-warning" id="comentario-estrellas-${comentario.id}">${estrellas}</p>
                                            <small class="text-muted">Publicado el ${new Date(comentario.fecha).toLocaleDateString()}</small>
                                            <div>${botones}</div> <!-- Los botones Editar y Eliminar se mostrarán aquí -->
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
            const puntuacion = document.getElementById("puntuacion").value;
            const botonEnviar = document.getElementById("btn-enviar");
        
            if (!comentario || puntuacion < 1 || puntuacion > 5) {
                alert("Escribe un comentario y selecciona una calificación válida.");
                return;
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
            document.getElementById(`comentario-texto-${comentarioId}`).innerHTML = 
                `<textarea id="nuevo-comentario-${comentarioId}" class="form-control">${comentarioTexto}</textarea>`;
        
            document.getElementById(`comentario-estrellas-${comentarioId}`).innerHTML = `
                <select id="nueva-puntuacion-${comentarioId}" class="form-control">
                    <option value="1" ${puntuacion == 1 ? "selected" : ""}>⭐ 1</option>
                    <option value="2" ${puntuacion == 2 ? "selected" : ""}>⭐⭐ 2</option>
                    <option value="3" ${puntuacion == 3 ? "selected" : ""}>⭐⭐⭐ 3</option>
                    <option value="4" ${puntuacion == 4 ? "selected" : ""}>⭐⭐⭐⭐ 4</option>
                    <option value="5" ${puntuacion == 5 ? "selected" : ""}>⭐⭐⭐⭐⭐ 5</option>
                </select>`;
        
            document.getElementById(`comentario-texto-${comentarioId}`).insertAdjacentHTML(
                'afterend', `<button class="btn btn-sm btn-success mt-2" onclick="guardarEdicion(${comentarioId})">💾 Guardar</button>`
            );
        }

        function guardarEdicion(comentarioId) {
            const nuevoComentario = document.getElementById(`nuevo-comentario-${comentarioId}`).value.trim();
            const nuevaPuntuacion = document.getElementById(`nueva-puntuacion-${comentarioId}`).value;
        
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
        const estrellas = document.querySelectorAll("#rating .star");
        const puntuacionInput = document.getElementById("puntuacion");
        let estaSeleccionado = false;

        estrellas.forEach(star => {
            star.addEventListener("mouseover", () => {
                if (!estaSeleccionado) { 
                    actualizarEstrellas(star.dataset.value);
                }
            });
            
            star.addEventListener("mouseout", () => {
                if (!estaSeleccionado) { 
                    actualizarEstrellas(puntuacionInput.value); 
                }
            });
            
            star.addEventListener("click", () => {
                puntuacionInput.value = star.dataset.value;
                actualizarEstrellas(star.dataset.value);
                estaSeleccionado = true; 
            });
        });

        function actualizarEstrellas(valor) {
            estrellas.forEach(star => {
                star.textContent = star.dataset.value <= valor ? "⭐" : "☆";
            });
        }
    }

