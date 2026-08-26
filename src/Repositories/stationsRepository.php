<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Database;
use MongoDB\Collection;

class stationsRepository
{
    private Collection $collection;

    public function __construct(Database $db)
    {
        $this->collection = $db->selectCollection('stations'); 
    }

    public function getAll() : array
    {
        $stations = [];
        $found = $this->collection->find();

        foreach($found as $doc)
            {
                $stations[] = [
                    'id' => (string) $doc['_id'],
                    'name' => $doc['name']
                ];
            }

        return $stations;
    }
}

?>