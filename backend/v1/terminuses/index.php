<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Repositories\terminusesRepository;
use Ale\Bussescu\Services\terminusesService;
use Ale\Bussescu\Controllers\terminusesController;

$db = getDatabase();

$repository = new terminusesRepository($db);
$service = new terminusesService($repository);
$controller = new terminusesController($service);

$controller->terminuses();

?>