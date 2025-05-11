<?php
// Conexión a la base de datos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
include 'config.php';

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $query = "SELECT titulo, fecha_lanzamiento, sinopsis, poster_path, trailer_url, calificacion_promedio 
              FROM pelicula WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $pelicula = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($pelicula) {
        echo json_encode($pelicula);
    } else {
        echo json_encode(['error' => 'Película no encontrada']);
    }
} else {
    echo json_encode(['error' => 'ID de película no proporcionado']);
}
?>
