<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Database;
use MongoDB\Collection;

class searchRepository extends baseRepository
{
    private Collection $linesCollection;

    public function __construct(Database $db)
    {
        $this->linesCollection = $db->selectCollection('lines');
        $this->stationsCollection = $db->selectCollection('stations');
    }

    public function findRoute(string $fromName, string $toName): array
    {
        $fromStation = $this->stationsCollection->findOne(['name' => $fromName]);
        $toStation = $this->stationsCollection->findOne(['name' => $toName]);

        if (!$fromStation) {
            throw new \InvalidArgumentException("Station not found: \"$fromName\"");
        }
        if (!$toStation) {
            throw new \InvalidArgumentException("Station not found: \"$toName\"");
        }

        $fromId = (string)$fromStation['_id'];
        $toId = (string)$toStation['_id'];

        $matches = $this->linesCollection->find([
            'stations' => ['$all' => [$fromStation['_id'], $toStation['_id']]]
        ]);

        $result = [];
        $terminuses = [];
        $stations = [];

        $i = 0;
        foreach ($matches as $doc) {
            $rawIds = [];
            foreach ((array) $doc['stations'] as $id) {
                $rawIds[] = (string) $id;
            }

            // Find where 'from' and 'to' sit in this document's own order
            $fromIndex = array_search($fromId, $rawIds, true);
            $toIndex = array_search($toId, $rawIds, true);

            // Skip this document unless 'from' comes before 'to'
            if ($fromIndex === false || $toIndex === false || $fromIndex >= $toIndex)
                continue;

            $stations = (array)$doc['stations'];
            $stations = $this->resolveStationNames($stations);

            $terminuses[] = $stations[0];
            $terminuses[] = end($stations);

            $number = $toIndex - $fromIndex;
            
            $result[] = [
                'number' => $doc['number'],
                'direction' => $doc['direction'],
                'start' => $terminuses[$i],
                'stop' => $terminuses[$i + 1],
                'number' => $number
            ];
            $i += 2;
        }
        return $result;
    }
}
