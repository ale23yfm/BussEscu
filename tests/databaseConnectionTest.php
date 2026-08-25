<?php
//TO DO: db connection test
namespace Ale\Bussescu\Tests;

use PHPUnit\Framework\TestCase;

class databaseConnectionTest extends TestCase
{
    public function testConnectionReturnsDatabase() : void
    {
        require_once __DIR__ . '/../config/database.php';

        $db = getDatabase();

        $this->assertInstanceOf(\MongoDB\Database::class, $db);
    }

    public function testCanFetchStations() : void
    {
        require_once __DIR__ . '/../config/database.php';

        $db = getDatabase();
        $stations = $db->selectCollection('stations')->find()->toArray();

        $this->assertNotEmpty($stations, 'Expected at least one station in the database.');
        $this->assertArrayHasKey('name', (array)$stations[0]);
    }
}

?>