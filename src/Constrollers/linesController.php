<?php

namespace Ale\Bussescu\Constrollers;

use Ale\Bussescu\Services\linesService;

class linesController
{
    private linesService $service;

    public function __construct(linesService $service)
    {
        $this->service = $service;
    }

    public function index() : void
    {
        header('Content-Type: application/json');
        $lines = $this->service->getAll();
        echo json_encode($lines);
    }
}
?>