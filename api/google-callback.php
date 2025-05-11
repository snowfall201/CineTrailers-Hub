<?php
require 'vendor\autoload.php';
session_start();

$client = new Google_Client();
$client->setClientId('TU_CLIENT_ID');
$client->setClientSecret('TU_CLIENT_SECRET');
$client->setRedirectUri('http://localhost/proyecto/api/google-callback.php');
$client->addScope("email");
$client->addScope("profile");

if (isset($_GET['code'])) {
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    $client->setAccessToken($token['access_token']);

    $oauth2 = new Google_Service_Oauth2($client);
    $userInfo = $oauth2->userinfo->get();

    $_SESSION['user_id'] = $userInfo->id;
    $_SESSION['user_name'] = $userInfo->name;

    header('Location: index.html'); // o donde quieras redirigir
    exit;
} else {
    echo "No autorizado.";
}
