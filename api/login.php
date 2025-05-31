<?php
include 'config.php';
session_start();

ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/errors.log');
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

$sql = "SELECT * FROM usuario WHERE email = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];

    echo json_encode([
        'userId' => $user['id'],
        'userName' => $user['name'],
        'message' => 'Inicio de sesión exitoso.'
    ]);
} else {
    echo json_encode(["error" => "Credenciales incorrectas"]);
}
?>
