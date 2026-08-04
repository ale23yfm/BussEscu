use('bus_tracker');

// Delete what was created previously to avoid duplicates
db.stations.drop();
db.lines.drop();
db.connections.drop();

// Create the stations collection with a geospatial index
db.createCollection('stations');

// Insert a couple of sample stations
db.stations.insertMany([
  {
    name: 'Aurel Vlaicu'
  },
  {
    name: 'Memorandumului Nord'
  },
  {
    name: 'Arte Plastice'
  }
]);

// Look up your existing station _ids by name
const aurelVlaicu = db.stations.findOne({ name: 'Aurel Vlaicu' });
const memorandumuluiNord = db.stations.findOne({ name: 'Memorandumului Nord' });
const artePlastice = db.stations.findOne({ name: 'Arte Plastice' }); // fixed typo from "PLastice"

db.connections.insertMany([
  {
    from: aurelVlaicu._id,
    to: memorandumuluiNord._id,
    lines: ['6', '30']
  },
  {
    from: artePlastice._id,
    to: memorandumuluiNord._id,
    lines: ['24b', '6', '30']
  },
  {
    from: aurelVlaicu._id,
    to: artePlastice._id,
    lines: ['4', '5', '6', '30', '46b']
  }
]);

console.log('Connections:', 
  db.connections.aggregate([
  {
    $lookup: {
      from: 'stations',
      localField: 'from',
      foreignField: '_id',
      as: 'fromStation'
    }
  },
  {
    $lookup: {
      from: 'stations',
      localField: 'to',
      foreignField: '_id',
      as: 'toStation'
    }
  },
  {
    $project: {
      _id: 0,
      from: { $arrayElemAt: ['$fromStation.name', 0] },
      to: { $arrayElemAt: ['$toStation.name', 0] },
      lines: 1
    }
  }
]).toArray());