<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/database.php';

use Ale\Bussescu\Repositories\searchRepository;
use Ale\Bussescu\Services\searchService;
use Ale\Bussescu\Controllers\searchController;

$db = getDatabase();

$repository = new searchRepository($db);
$service = new searchService($repository);
$controller = new searchController($service);

$controller->search();
?>