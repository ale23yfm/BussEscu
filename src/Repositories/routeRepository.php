<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Database;
use MongoDB\Collection;

class routeRepository extends baseRepository
{
    private Collection $linesCollection;

    public function __construct(Database $db)
    {
        $this->linesCollection = $db->selectCollection('lines');
        $this->stationsCollection = $db->selectCollection('stations');
    }

    public function getLineByNumber(string $number) : array
    {
        $found = $this->linesCollection->find(['number' => $number])->toArray();

        if (empty($found))
            throw new \InvalidArgumentException("Line not found: \"$number\"");

        $line = [];

        foreach ($found as $doc)
            {
                $line[] = [
                    'direction' => $doc['direction'],
                    'stations' => $this->resolveStationNames((array)$doc['stations'])
                ];
            }

        return [
            'number' => $number,
            'routes' => $line
        ];
    }
}
?>