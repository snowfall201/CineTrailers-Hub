<?php
use Google\Service\Oauth2;
require __DIR__ . '/../vendor/autoload.php'; // Ajusta el path si es necesario

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

session_start();
require 'config.php';

$client = new Google_Client();
$client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
$client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
$client->setRedirectUri($_ENV['GOOGLE_REDIRECT']);

if (isset($_GET['code'])) {
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    $client->setAccessToken($token['access_token']);

    $oauth = new Oauth2($client);
    $userInfo = $oauth->userinfo->get();

    $googleId = $userInfo->id;
    $name = $userInfo->name;
    $email = $userInfo->email;

    // Buscar o insertar
    $stmt = $pdo->prepare("SELECT * FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        $insert = $pdo->prepare("INSERT INTO usuario (name, email, password) VALUES (?, ?, '')");
        $insert->execute([$name, $email]);
        $userId = $pdo->lastInsertId();
    } else {
        $userId = $user['id'];
    }

    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $name;

    header("Location: ../index.html");
    exit;
} else {
    echo "Error: No autorizado.";
}