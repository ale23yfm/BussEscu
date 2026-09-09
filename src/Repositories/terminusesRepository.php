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

    public function getTerminuses(array $numbers): array
    {
        $lines = $this->linesCollection->find([
            'number' => ['$in' => $numbers]
        ])->toArray();

        $found = [];
        foreach ($lines as $doc) {
            $stations = (array) $doc['stations'];
            $found[] = $stations[0];
            $found[] = end($stations);
        }

        $found = $this->resolveStationNames($found);
        $i = 0;
        $grouped = [];

        foreach ($lines as $doc) {
            $number = $doc['number'];
            $grouped[$number][] = [
                'direction' => $doc['direction'],
                'start' => $found[$i],
                'stop' => $found[$i + 1]
            ];
            $i += 2;
        }

        $result = [];
        foreach ($grouped as $number => $directions) {
            $result[] = [
                'number' => $number,
                'directions' => $directions,
            ];
        }

        return $result;
    }
}
