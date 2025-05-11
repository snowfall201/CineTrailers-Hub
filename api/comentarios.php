<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once "config.php";

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        echo json_encode(["error" => "ID de película no válido"]);
        exit;
    }

    $id_pelicula = intval($_GET['id']);

    try {
        $sql = "SELECT c.id, c.comentario, c.puntuacion, c.fecha, u.name AS usuario
                FROM comentario c
                JOIN usuario u ON c.usuario_id = u.id
                WHERE c.pelicula_id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id_pelicula]);
        $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($comentarios);
    } catch (Exception $e) {
        echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'Usuario no autenticado']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $pelicula_id = intval($data['id']);
    $comentario = trim($data['comentario']);
    $puntuacion = intval($data['puntuacion']); 
    $usuario_id = $_SESSION['user_id']; 

    if ($puntuacion < 1 || $puntuacion > 5) {
        echo json_encode(['error' => 'Puntuación inválida']);
        exit;
    }

    try {
        $sql = "INSERT INTO comentario (pelicula_id, usuario_id, comentario, puntuacion, fecha) 
                VALUES (:pelicula_id, :usuario_id, :comentario, :puntuacion, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':pelicula_id' => $pelicula_id,
            ':usuario_id' => $usuario_id,
            ':comentario' => $comentario,
            ':puntuacion' => $puntuacion
        ]);

        $sql_avg = "SELECT AVG(puntuacion) AS promedio FROM comentario WHERE pelicula_id = :pelicula_id";
        $stmt_avg = $pdo->prepare($sql_avg);
        $stmt_avg->execute([':pelicula_id' => $pelicula_id]);
        $promedio = $stmt_avg->fetch(PDO::FETCH_ASSOC)['promedio'];

        $sql_update = "UPDATE pelicula SET calificacion_promedio = :promedio WHERE id = :pelicula_id";
        $stmt_update = $pdo->prepare($sql_update);
        $stmt_update->execute([
            ':promedio' => $promedio,
            ':pelicula_id' => $pelicula_id
        ]);

        echo json_encode(['success' => true, 'new_rating' => $promedio]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }

    
}
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'Usuario no autenticado']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $comentario_id = intval($data['comentario_id']);
    $nuevo_comentario = trim($data['comentario']);
    $nueva_puntuacion = intval($data['puntuacion']);
    $usuario_id = $_SESSION['user_id'];

    if ($nueva_puntuacion < 1 || $nueva_puntuacion > 5) {
        echo json_encode(['error' => 'Puntuación inválida']);
        exit;
    }

    try {
        $sql_check = "SELECT usuario_id FROM comentario WHERE id = ?";
        $stmt_check = $pdo->prepare($sql_check);
        $stmt_check->execute([$comentario_id]);
        $comentario = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if (!$comentario || $comentario['usuario_id'] != $usuario_id) {
            echo json_encode(['error' => 'No tienes permiso para editar este comentario']);
            exit;
        }

        $sql_update = "UPDATE comentario SET comentario = ?, puntuacion = ? WHERE id = ?";
        $stmt_update = $pdo->prepare($sql_update);
        $stmt_update->execute([$nuevo_comentario, $nueva_puntuacion, $comentario_id]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'Usuario no autenticado']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $comentario_id = intval($data['comentario_id']);
    $usuario_id = $_SESSION['user_id'];

    try {
        $sql_check = "SELECT usuario_id FROM comentario WHERE id = ?";
        $stmt_check = $pdo->prepare($sql_check);
        $stmt_check->execute([$comentario_id]);
        $comentario = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if (!$comentario || $comentario['usuario_id'] != $usuario_id) {
            echo json_encode(['error' => 'No tienes permiso para eliminar este comentario']);
            exit;
        }

        $sql_delete = "DELETE FROM comentario WHERE id = ?";
        $stmt_delete = $pdo->prepare($sql_delete);
        $stmt_delete->execute([$comentario_id]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}


?>
