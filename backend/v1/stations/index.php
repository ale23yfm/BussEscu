<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Repositories\stationsRepository;
use Ale\Bussescu\Constrollers\stationsController;
use Ale\Bussescu\Services\stationsService;

$db = getDatabase();

$repository = new stationsRepository($db);
$service = new stationsService($repository);
$controller = new stationsController($service);

$controller->index();
?>