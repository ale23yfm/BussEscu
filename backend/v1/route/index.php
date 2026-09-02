<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Constrollers\routeController;
use Ale\Bussescu\Repositories\routeRepository;
use Ale\Bussescu\Services\routeService;

$db = getDatabase();

$repository = new routeRepository($db);
$service = new routeService($repository);
$controller = new routeController($service);

$controller->route();

?>