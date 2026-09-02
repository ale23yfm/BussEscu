<?php

namespace Ale\Bussescu\Services;

use Ale\Bussescu\Repositories\linesRepository;

class linesService
{
    private linesRepository $repository;

    public function __construct(linesRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAll() : array
    {
        return $this->repository->getAll();
    }
}

?>