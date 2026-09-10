<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Collection;
use MongoDB\Database;

class accessibleRepository extends baseRepository
{
    private Collection $linesCollection;

    public function __construct(Database $db)
    {
        $this->linesCollection = $db->selectCollection('lines');
        $this->stationsCollection = $db->selectCollection('stations');
    }

    public function getAccessible(string $name): array
    {

        $station = $this->stationsCollection->findOne(['name' => $name]);

        $found = $this->linesCollection->find([
            'stations' => ['$all' => [$station['_id']]]
        ]);

        $stations = [];
        foreach ($found as $doc)
            $stations[] = $this->resolveStationNames((array)$doc['stations']);

        $all = [];
        foreach ($stations as $doc) {
            $sliced = array_slice($doc, array_search($name, $doc) + 1);
            array_push($all, ...$sliced);
        }
        $result = [];
        for ($i = 0; $i < count($all); $i++)
            {
                if (in_array($all[$i], $result, true) || !$all[$i]) continue;
                $result[] = $all[$i];
            }
        return $result;
    }
}
