<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Collection;
use MongoDB\Database;

class linesRepository
{
    private Collection $collection;

    public function __construct(Database $db)
    {
        $this->collection = $db->selectCollection('lines');
    }

    public function getAll() : array
    {
        $lines = [];
        $found = $this->collection->find();

        foreach($found as $doc)
            {
                $number = $doc['number'];
                $numbers = array_column($lines, 'number');
                
                if (in_array($number, $numbers, true)) continue;

                $lines[] = [
                    //'id' => (string) $doc['_id'],  
                    'number' => $number
                ];
            }
        return [
            'total' => count($lines),
            'lines' => $lines
        ];
    }
}

?>