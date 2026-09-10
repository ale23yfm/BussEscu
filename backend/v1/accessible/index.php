<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Controllers\accessibleController;
use Ale\Bussescu\Repositories\accessibleRepository;
use Ale\Bussescu\Services\accessibleService;

$db = getDatabase();

$repository = new accessibleRepository($db);
$service = new accessibleService($repository);
$controller = new accessibleController($service);

$controller->index();
?>