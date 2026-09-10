<?php

namespace Ale\Bussescu\Controllers;

use Ale\Bussescu\Services\accessibleService;

class accessibleController
{
    private accessibleService $service;

    public function __construct(accessibleService $service)
    {
        $this->service = $service;
    }

    public function index() : void
    {
        header('Content-Type: application/json');
        
        $station = $_GET['station'];

        if (!$station) {
            http_response_code(400);
            echo json_encode(['error' => 'The "station" query parameter is required.']);
            return;
        }

        try {
            $stations = $this->service->getAccessible($station);
            http_response_code(200);
            echo json_encode($stations);
        } catch (\InvalidArgumentException $e) {
            http_response_code(404);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
