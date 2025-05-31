<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['captcha'])) {
    echo json_encode(["error" => "Faltan datos requeridos"]);
    exit;
}

$captcha = $data['captcha'];
$secretKey = "6LfNfj0rAAAAAPLzQNKXxEA943NaK0f9wIC5BedA"; 
$response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$captcha");
$responseKeys = json_decode($response, true);

if (!$responseKeys["success"]) {
    echo json_encode(["error" => "Verificación de reCAPTCHA fallida"]);
    exit;
}

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$sql = "INSERT INTO usuario (name, email, password) VALUES (?, ?, ?)";
$stmt = $pdo->prepare($sql);
try {
    $stmt->execute([$name, $email, $password]);
    echo json_encode(["message" => "Usuario registrado con éxito"]);
} catch (Exception $e) {
    echo json_encode(["error" => "Error al registrar el usuario: " . $e->getMessage()]);
}
?>
