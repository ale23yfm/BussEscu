<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Database;
use MongoDB\Collection;

class terminusesRepository extends baseRepository
{
    private Collection $linesCollection;

    public function __construct(Database $db)
    {
        $this->linesCollection = $db->selectCollection('lines');
        $this->stationsCollection = $db->selectCollection('stations');
    }

    public function getTerminuses(string $line) : array
    {
        $response = [];
        $found = $this->linesCollection->find(['number' => $line])->toArray();

        // foreach ($found as $doc)
        //     $response[] = [
        //     'number' => $doc['number'],
        //     'start' => $this->resolveStationNames((array)$doc['stations'])[0],
        //     'stop' => $this->resolveStationNames((array)$doc['stations'])[-1]
        // ];
        //return $response;

        return [
        'number' => $found['number'],
        'start' => $this->resolveStationNames((array)$found['stations'])[0],
        'stop' => $this->resolveStationNames((array)$found['stations'])[-1]
        // ];
        ];
    }
}

?>