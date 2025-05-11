<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];

    include 'config.php';
    $stmt = $pdo->prepare("SELECT name FROM usuario WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode([
            "loggedIn" => true,
            "userId" => $userId,
            "name" => $user['name'] 
        ]);
    } else {
        echo json_encode(["loggedIn" => false]);
    }
} else {
    echo json_encode(["loggedIn" => false]);
}
?>
