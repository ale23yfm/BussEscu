<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Constrollers\searchController;
use Ale\Bussescu\Repositories\searchRepository;
use Ale\Bussescu\Services\searchService;

$db = getDatabase();

$repository = new searchRepository($db);
$service = new searchService($repository);
$controller = new searchController($service);

$controller->search();
?>