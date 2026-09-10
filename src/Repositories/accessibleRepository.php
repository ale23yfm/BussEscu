<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Collection;
use MongoDB\Database;

class accessibleRepository
{
    private Collection $linesCollection;
    private Collection $stationsCollection;

    public function __construct(Database $db)
    {
        $this->linesCollection = $db->selectCollection('lines');
        $this->stationsCollection = $db->selectCollection('stations');
    }

    public function getAccessible(string $name) : array
    {

        $station = $this->stationsCollection->findOne(['name' => $name]);

        $found = $this->linesCollection->find([
            'stations' => ['$all' => [$station['_id']]]
        ]);

        $result = [];
        foreach ($found as $doc)
            {

            }
        return (array)$found;

        return $result;
    }
}
?>