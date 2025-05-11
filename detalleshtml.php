<?php 
session_start(); 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalles de la Película | REPELIS24</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/detalles.css" rel="stylesheet">
</head>
<body>
<div id="navbar-container"></div>

    <div class="container mt-4">
        <div id="detalle-pelicula">Cargando detalles...</div>
    </div>

    <div class="container mt-5">
        <h4 class="text-white">Tráiler</h4>
        <div class="ratio ratio-16x9" id="trailer-container">
            <p class="text-white">Cargando tráiler...</p>
        </div>
    </div>

    <div class="container mt-5">
        <h4 class="text-white">Comentarios</h4>
        <div id="comentarios-container">Cargando comentarios...</div>

        <?php if (isset($_SESSION['user_id'])): ?>
            <form id="comentario-form" class="mt-3">
                <div class="mb-3">
                    <label for="comentario" class="form-label text-white">Añadir un comentario</label>
                    <textarea class="form-control" id="comentario" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                    <label class="text-white">Calificación:</label>
                    <div id="rating" class="stars-container">
                        <span class="star" data-value="1">☆</span>
                        <span class="star" data-value="2">☆</span>
                        <span class="star" data-value="3">☆</span>
                        <span class="star" data-value="4">☆</span>
                        <span class="star" data-value="5">☆</span>
                    </div>
                    <input type="hidden" id="puntuacion" value="0">
                </div>
                <button id="btn-enviar" type="submit" class="btn btn-primary">Enviar comentario</button>
                </form>
        <?php else: ?>
            <div id="comentarios-container" class="mt-4">
    <div class="no-auth-message">
        <p>🔒 Inicia sesión para comentar.</p>
    </div>
</div>        <?php endif; ?>
    </div>

    <script src="js/detalles.js"></script>
    <script src="js/main.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
