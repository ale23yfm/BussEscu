<?php

namespace Ale\Bussescu\Constrollers;

use Ale\Bussescu\Services\searchService;

class searchController
{
    private searchService $service;

    public function __construct(searchService $service)
    {
        $this->service = $service;
    }

    public function search() : void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Content-Type: application/json');

        $from = $_GET['from'] ?? null;
        $to = $_GET['to'] ?? null;

        if(!$from || !$to)
        {
            http_response_code(400);
            echo json_encode(['error' => 'Both "from" and "to" query parameters are required.']);
            return;
        }

        try {
        $results = $this->service->findRoute($from, $to);
        http_response_code(200);
        echo json_encode($results);
        } catch (\InvalidArgumentException $e) {
            http_response_code(404);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to search routes.']);
        }
    } 
}

?>