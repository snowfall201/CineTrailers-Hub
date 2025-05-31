document.addEventListener("DOMContentLoaded", function () {
    const baseUrl = 'https://image.tmdb.org/t/p/';
    const tamaño = 'w200';
    const container = document.getElementById('peliculas-container');
    const buscador = document.getElementById('buscador');

    let peliculasData = [];

    // Función para mostrar las películas en el DOM
    function renderPeliculas(peliculas) {
        container.innerHTML = '';

        peliculas.forEach(pelicula => {
            const col = document.createElement('div');
            col.classList.add('col-md-3', 'movie-card');

            const imagenUrl = pelicula.poster_path
                ? `${baseUrl}${tamaño}/${pelicula.poster_path}?v=${new Date().getTime()}`
                : 'https://via.placeholder.com/300x450?text=Sin+Imagen';

            col.innerHTML = `
                <img src="${imagenUrl}" alt="${pelicula.titulo}" class="img-fluid" data-size="${tamaño}">
                <h5>${pelicula.titulo}</h5>
                <p><small>${pelicula.fecha_lanzamiento}</small></p>
            `;

            col.addEventListener('click', () => {
                window.location.href = `detalleshtml.php?id=${pelicula.id}`;
            });

            container.appendChild(col);
        });
    }

    
    fetch('api/peliculas.php')  //este fetch obtiene las películas desde la API de peliculas
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            return response.json();
        })
        .then(data => {
            peliculasData = data;  //guardamos los datos en data
            renderPeliculas(peliculasData); //con renderPeliculas mostramos los datos
        })
        .catch(error => console.error('Error al cargar las películas:', error));

    // Funcion de filtrado cuando se escribe algo en el Input
    buscador.addEventListener('input', function () {
        const texto = buscador.value.toLowerCase();
        const filtradas = peliculasData.filter(p =>
            p.titulo.toLowerCase().includes(texto)  //aquí busca dentro de las peliculas que contenga el texto que buscamos den el título
        );
        renderPeliculas(filtradas); //muestra solo las peliculas filtradas
    });
});
