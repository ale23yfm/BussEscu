<?php

namespace Ale\Bussescu\Services;

use Ale\Bussescu\Repositories\stationsRepository;

class StationsService
{
    private stationsRepository $repository;

    public function __construct(stationsRepository $repository)
    {
        $this->repository = $repository; 
    }

    public function getAll() : array
    {
        return $this->repository->getAll();
    }
}

?>