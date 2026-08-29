use("bus_tracker");

// Delete what was created previously to avoid duplicates
db.stations.drop();
db.lines.drop();

const stationNames = [
  "Disp. Clăbucet",
  "Primăverii",
  "Minerva",
  "Zorilor",
  "Calea Mănăștur",
  "Agronomia",
  "Calea Moților",
  "Memorandumului Sud",
  "Victoria",
  "Regionala CFR",
  "Biserica Sf. Petru",
  "Piața Mărăști",
  "Mareșal C-tin Prezan",
  "Siretului",
  "Pod Someșeni",
  "Disp. IRA",
  "EXPO Transilvania",
  "Aurel Vlaicu",
  "Arte Plastice",
  "Cîmpului",
  "Someș",
  "Constanța",
  "Sora",
  "Memorandumului Nord",
  "Spitalul de Copii",
  "Fabrica de Bere",
  "Grădini Mănăștur",
  "Ion Mester",
  "Izlazului S",
  "Disp. Grigorescu",
  "Radio România Cluj",
  "Petuniei",
  "Iancu de Hunedoara",
  "Giuseppe Garibaldi",
  "Cluj Arena",
  "Hotel Radisson Blu",
  "Disp. Unirii",
  "Colegiul Pedagogic",
  "Iulius Mall Est",
  "Campus Universitar Est",
  "Crinului",
  "Taberei",
  "Calea Florești",
  "Nodul Nord",
  "VIVO! Cluj-Napoca Sos",
];

db.createCollection("stations");

db.stations.insertMany(stationNames.map(name => ({ name })));
console.log(`Inserted ${stationNames.length} stations.`);

const allStations = db.stations.find().toArray();
const stationMap = {};

allStations.forEach(s => {
  stationMap[s.name] = s._id;
});

function toIds(names)
{
  return names.map(name => {
    const id = stationMap[name];
    if (!id) {
      console.log(`  ⚠️ Station not found: "${name}"`); // catches typos immediately
    }
    return id;
  });
}

// Create lines collection with all stations
db.createCollection("lines");

db.lines.insertMany([
  {
    number: "6",
    stations: toIds([
      "Disp. Clăbucet",
      "Primăverii",
      "Minerva",
      "Zorilor",
      "Calea Mănăștur",
      "Agronomia",
      "Calea Moților",
      "Memorandumului Sud",
      "Victoria",
      "Regionala CFR",
      "Biserica Sf. Petru",
      "Piața Mărăști",
      "Mareșal C-tin Prezan",
      "Siretului",
      "Pod Someșeni",
    ]),
  },
  {
    number: "7",
    stations: toIds([
      "Disp. IRA",
      "EXPO Transilvania",
      "Aurel Vlaicu",
      "Arte Plastice",
      "Cîmpului",
      "Someș",
      "Constanța",
      "Sora",
      "Memorandumului Nord",
      "Spitalul de Copii",
      "Fabrica de Bere",
      "Grădini Mănăștur",
      "Ion Mester",
      "Izlazului S",
    ]),
  },
    {
      number: "30",
      stations: toIds([
        "Disp. Grigorescu",
        "Radio România Cluj",
        "Petuniei",
        "Iancu de Hunedoara",
        "Giuseppe Garibaldi",
        "Cluj Arena",
        "Hotel Radisson Blu",
        "Calea Moților",
        "Memorandumului Sud",
        "Victoria",
        "Regionala CFR",
        "Biserica Sf. Petru",
        "Piața Mărăști",
        "Mareșal C-tin Prezan",
        "Siretului",
        "Pod Someșeni",
        "Disp. IRA",
      ]),
    },
    {
      number: "24B",
      stations: toIds([
        "Disp. Unirii",
        "Colegiul Pedagogic",
        "Iulius Mall Est",
        "Campus Universitar Est",
        "Arte Plastice",
        "Crinului",
        "Someș",
        "Constanța",
        "Sora",
        "Memorandumului Nord",
        "Spitalul de Copii",
        "Fabrica de Bere",
        "Grădini Mănăștur",
        "Taberei",
        "Calea Florești",
        "Nodul Nord",
        "VIVO! Cluj-Napoca Sos",
      ]),
    }
]);

console.log("Done. Check above for any '⚠️' warnings before trusting the data.");