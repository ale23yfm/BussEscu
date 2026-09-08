<?php
 
namespace Ale\Bussescu\Services;

use Ale\Bussescu\Repositories\terminusesRepository;

class terminusesService
{
    private terminusesRepository $repository;

    public function __construct(terminusesRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getTerminuses(string $line) : array
    {
        return $this->repository->getTerminuses($line);
    }
}

?>