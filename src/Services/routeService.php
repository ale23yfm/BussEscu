<?php

namespace Ale\Bussescu\Services;

use Ale\Bussescu\Repositories\routeRepository;

class routeService
{
    private routeRepository $repository;

    public function __construct(routeRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getLineByNumber(string $number) : array
    {
        return $this->repository->getLineByNumber($number); 
    }
}
?>