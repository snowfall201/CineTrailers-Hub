<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
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
