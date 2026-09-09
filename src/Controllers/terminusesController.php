<?php

namespace Ale\Bussescu\Controllers;

use Ale\Bussescu\Services\terminusesService;

class terminusesController
{
    private terminusesService $service;

    public function __construct(terminusesService $service)
    {
        $this->service = $service;
    }

    public function terminuses() : void
    {
        header('Content-Type: application/json');
        
        $numbers = $_GET['lines'] ?? null;

        if (!$numbers || !is_array($numbers))
        {
            http_response_code(400);
            echo json_encode(['error' => 'The "lines" query parameter is required.']);
            return;
        }

    try 
    {
        $lines = $this->service->getTerminuses($numbers);
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