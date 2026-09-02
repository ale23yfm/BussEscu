<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Database;
use MongoDB\Collection;

class routeRepository
{
    private Collection $lineCollection;
    private Collection $stationCollection;

    public function __construct(Database $db)
    {
        $this->lineCollection = $db->selectCollection('lines');
        $this->stationCollection = $db->selectCollection('stations');
    }

    public function getLineByNumber(string $number) : array
    {
        $found = $this->lineCollection->find(['number' => $number])->toArray();

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

    public function resolveStationNames(iterable $stationIds) : array
    {
    $docs = $this->stationCollection->find([
        '_id' => ['$in' => $stationIds]
    ])->toArray();
    
    error_log("stationIds count: " . count($stationIds));
    error_log("docs found: " . count($docs));
    error_log("first stationId: " . (string) $stationIds[0]);

    $byId = [];
    foreach ($docs as $doc) {
        $byId[(string) $doc['_id']] = $doc['name'];
    }

    $names = [];
    foreach ($stationIds as $id) {
        $names[] = $byId[(string) $id] ?? null; 
    }

    return $names;
}
}
?>