import fs from "fs";
import path from "path";

const machinesPath = path.join(__dirname, "../machines/");

// get every json file in every folder of machinesPath, and return it's path relative to machinesPath
const machines = fs.readdirSync(machinesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .flatMap(folder => fs.readdirSync(machinesPath + folder, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith(".json"))
        .map(dirent => folder + "/" + dirent.name)
    );

const allMachines: any[] = [];
// get every json file and append it to the machines list
machines.forEach(machine => {
    const machineData = JSON.parse(fs.readFileSync(machinesPath + machine).toString());
    allMachines.push(machineData);
});

// write the new machines list to the file
fs.writeFileSync(path.join(__dirname, "../public/machines.json"), JSON.stringify(allMachines, null, 4));
