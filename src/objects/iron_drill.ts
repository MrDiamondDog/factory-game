import { defineNode } from "@canvas/object";

export default defineNode({
    name: "Iron Drill",
    description: "A crappy drill that mines iron ore. Not very efficient but it works.",
    inputs: ["Power"],
    outputs: ["Iron Ore"]
});