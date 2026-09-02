<?php

namespace Ale\Bussescu\Constrollers;

use Ale\Bussescu\Services\routeService;

class routeController
{
    private routeService $service;

    public function __construct(routeService $service)
    {
        $this->service = $service;
    }

    public function route() : void
    {
        header('Content-Type: application/json');

        $number = $_GET['line'] ?? null;

        if (!$number)
        {
            http_response_code(400);
            echo json_encode(['error' => 'The "line" query parameter is required.']);
            return;
        }

        try 
        {
            $lines = $this->service->getLineByNumber($number);
            http_response_code(200);
            echo json_encode($lines);
        } catch(\InvalidArgumentException $e) 
            {
                http_response_code(404);
                echo json_encode(['error' => $e->getMessage()]);
                } catch (\Throwable $e) {
                    http_response_code(500);
                    echo json_encode(['error' => $e->getMessage()]);
                }
            }
}
?>