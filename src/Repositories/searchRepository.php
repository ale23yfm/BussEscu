<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Database;
use MongoDB\Collection;

class searchRepository
{
    private Collection $linesCollection;
    private Collection $stationsCollection;

    public function __construct(Database $db)
    {
        $this->linesCollection = $db->selectCollection('lines');
        $this->stationsCollection = $db->selectCollection('stations');
    }

    public function findRoute(string $fromName, string $toName) : array
    {
        $fromStation = $this->stationsCollection->findOne(['name' => $fromName]);
        $toStation = $this->stationsCollection->findOne(['name' => $toName]);

        if (!$fromStation) {
            throw new \InvalidArgumentException("Station not found: \"$fromName\"");
        }
        if (!$toStation) {
            throw new \InvalidArgumentException("Station not found: \"$toName\"");
        }
        
        $fromId = $fromStation['_id'];
        $toId = $toStation['_id'];

        $matches = $this->linesCollection->find([
            'stations' => ['$all' => [$fromId, $toId]]
        ])->toArray();

        $result = [];

        foreach($matches as $line)
        {  
            $number = $line['number'];
            $numbers = array_column($result, 'number');
            
            if (in_array($number, $numbers, true)) continue;

            $result[] = [
                'number' => $line['number']
            ];
        }
        return $result;
    }
}

?>