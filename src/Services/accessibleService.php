<?php

namespace Ale\Bussescu\Services;

use Ale\Bussescu\Repositories\accessibleRepository;

class accessibleService
{
    private accessibleRepository $repository;

    public function __construct(accessibleRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAccessible(string $station) : array
    {
        return $this->repository->getAccessible($station);
    }
}
?>