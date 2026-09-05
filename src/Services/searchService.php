<?php

namespace Ale\Bussescu\Services;

use Ale\Bussescu\Repositories\searchRepository;

class searchService
{
    private searchRepository $repository;

    public function __construct(searchRepository $repository)
    {
        $this->repository = $repository;
    }

    public function findRoute(string $fromName, string $toName) : array
    {
        return $this->repository->findRoute($fromName, $toName);
    }
}

?>