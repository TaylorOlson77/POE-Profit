import { readFileSync } from "node:fs";

const log = readFileSync(process.argv[2], "utf8").replace(
  /\u001b\[[0-9;]*m/g,
  "",
);
const match =
  /All files\s*\|\s*([0-9]+(?:\.[0-9]+)?)\s*\|\s*[0-9.]+\s*\|\s*(\d+)\s*\|\s*\d+\s*\|\s*(\d+)\s*\|\s*\d+\s*\|\s*\d+\s*\|/.exec(
    log,
  );
if (!match) process.exit(1);

const score = String(Number(match[1]));
process.stdout.write(
  `score=${score}\nkilled=${match[2]}\nsurvived=${match[3]}\n`,
);
