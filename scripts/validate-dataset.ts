import { parseRawDataset } from "./lib/raw-parser.js";
import { validateRawItems } from "./lib/raw-validator.js";

const { items } = await parseRawDataset();
const result = validateRawItems(items);

if (!result.ok) {
  console.error("Raw dataset validation failed");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Raw dataset validation passed");
console.log(JSON.stringify(
  {
    rawItems: items.length,
  },
  null,
  2,
));
