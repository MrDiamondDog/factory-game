import fs from "fs";
import path from "path";

const factoryType = process.argv[2];
const factoryName = process.argv[3];

if (!factoryType || !factoryName) {
    console.error("Missing arguments");
    process.exit(1);
}

const factoryPath = path.join(__dirname, `../public/machines/${factoryType}/${factoryName}.json`);
if (fs.existsSync(factoryPath)) {
    console.error(`Factory ${factoryName} already exists`);
    process.exit(1);
}

if (!fs.existsSync(path.dirname(factoryPath))) {
    fs.mkdirSync(path.dirname(factoryPath), { recursive: true });
}

fs.writeFileSync(factoryPath, JSON.stringify({
    "name": "!",
    "description": "!",
    "type": factoryType,
    "inputs": ["!"],
    "outputs": ["!"],
    "specs": ["!"],
    "cost": 0,
    "produces": [
        {
            "materials": [
                {
                    "material": "!",
                    "amount": 0,
                    "limit": 0
                }
            ],
            "time": {
                "seconds": 0,
                "ticks": 0
            },
            "requires": [
                {
                    "material": "!",
                    "amount": 0
                }
            ]
        }
    ]
}, null, 4));
