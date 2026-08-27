<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Repositories\stationsRepository;
use Ale\Bussescu\Constrollers\stationsController;
use Ale\Bussescu\Services\stationsService;

$db = getDatabase();

$repository = new StationsRepository($db);
$service = new StationsService($repository);
$controller = new StationsController($service);

$controller->index();
?>