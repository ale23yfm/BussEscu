<?php

namespace Ale\Bussescu\Constrollers;

use Ale\Bussescu\Services\stationsService;

class StationsController
{
    private stationsService $service;

    public function __construct(stationsService $service)
    {
        $this->service = $service;
    }

    public function index(): void
    {
        header('Content-Type: application/json');
        $stations = $this->service->getAll();
        echo json_encode($stations);
    }
}

?>