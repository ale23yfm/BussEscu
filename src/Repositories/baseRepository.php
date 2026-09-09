<?php

namespace Ale\Bussescu\Repositories;

use MongoDB\Collection;

class baseRepository
{
    protected Collection $stationsCollection;
    protected function resolveStationNames(array $stationIds): array
    {
        $docs = $this->stationsCollection->find([
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
