<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Repositories\linesRepository;
use Ale\Bussescu\Services\linesService;
use Ale\Bussescu\Controllers\linesController;

$db = getDatabase();

$repository = new linesRepository($db);
$service = new linesService($repository);
$controller = new linesController($service);

$controller->index();
?>