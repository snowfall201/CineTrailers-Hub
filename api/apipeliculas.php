<?php
include 'config.php'; // Conexión a la base de datos

$apiKey = '7b3d37177f94c63f9692cf1e2f9fe209';
$language = 'es';  
$page = 1; 

function obtenerPeliculasDesdeAPI($apiKey, $language, $page) {
    $url = "https://api.themoviedb.org/3/discover/movie?api_key={$apiKey}&language={$language}&page={$page}";
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    
    return $data['results'] ?? []; 
}

function obtenerImdbID($tmdbId, $apiKey) {
    $url = "https://api.themoviedb.org/3/movie/{$tmdbId}?api_key={$apiKey}";
    $response = file_get_contents($url);
    $data = json_decode($response, true);

    return $data['imdb_id'] ?? null; 
}

function obtenerTrailer($peliculaId, $apiKey) {
    $urlEs = "https://api.themoviedb.org/3/movie/{$peliculaId}/videos?api_key={$apiKey}&language=es";
    $responseEs = file_get_contents($urlEs);
    $dataEs = json_decode($responseEs, true);

    if (isset($dataEs['results']) && count($dataEs['results']) > 0) {
        return $dataEs['results'][0]['key']; 
    }

    $urlEn = "https://api.themoviedb.org/3/movie/{$peliculaId}/videos?api_key={$apiKey}&language=en";
    $responseEn = file_get_contents($urlEn);
    $dataEn = json_decode($responseEn, true);

    if (isset($dataEn['results']) && count($dataEn['results']) > 0) {
        return $dataEn['results'][0]['key']; 
    }

    return null; 
}

$peliculas = obtenerPeliculasDesdeAPI($apiKey, $language, $page);

foreach ($peliculas as $pelicula) {
    $tmdbId = $pelicula['id'];  
    $imdbId = obtenerImdbID($tmdbId, $apiKey); 
    $trailerUrl = obtenerTrailer($tmdbId, $apiKey);  

    $titulo = $pelicula['title'];
    $sinopsis = $pelicula['overview'];
    $fecha_lanzamiento = $pelicula['release_date'];
    $calificacion_promedio = $pelicula['vote_average'];
    $poster_path = "https://image.tmdb.org/t/p/w500" . $pelicula['poster_path'];

    // **INSERT en la base de datos**
    $sql = "INSERT INTO pelicula (titulo, sinopsis, fecha_lanzamiento, calificacion_promedio, poster_path, trailer_url, imdb_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$titulo, $sinopsis, $fecha_lanzamiento, $calificacion_promedio, $poster_path, $trailerUrl, $imdbId]);
}

echo "Películas insertadas correctamente.";
?>
