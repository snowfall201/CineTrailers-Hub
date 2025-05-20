<?php
require __DIR__ . '/../vendor/autoload.php'; // Ajusta el path si es necesario

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$client = new Google_Client();
$client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
$client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
$client->setRedirectUri($_ENV['GOOGLE_REDIRECT']);
$client->addScope("email");
$client->addScope("profile");

$auth_url = $client->createAuthUrl();
header('Location: ' . $auth_url);
exit;