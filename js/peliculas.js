document.addEventListener("DOMContentLoaded", function() {
    const baseUrl = 'https://image.tmdb.org/t/p/';
    const tamaño = 'w200';

    fetch('api/peliculas.php')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        return response.json();
    })
    .then(data => {
        const container = document.getElementById('peliculas-container');
        container.innerHTML = '';
        
        data.forEach(pelicula => {
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
    })
    .catch(error => console.error('Error al cargar las películas:', error));
});
