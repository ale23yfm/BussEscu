<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

function getDatabase(): MongoDB\Database
{
    $client = new MongoDB\Client($_ENV['MONGODB_URI']);
    return $client->selectDatabase($_ENV['MONGODB_DB']);
}

?>