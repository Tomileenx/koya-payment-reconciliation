// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

let total = 0;
let count = 0;

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);

const latestTxnId = new Map();

for (const line of lines) {
  try {
    const event = JSON.parse(line);

    if (!event.txn_id) {
      continue;
    }

    const previousTxn = latestTxnId.get(event.txn_id);

    if (!previousTxn || Date.parse(event.ts) > Date.parse(previousTxn.ts)) {
      latestTxnId.set(event.txn_id, event)
    }

  } catch (error) {
    continue;
  }
}

for (const event of latestTxnId.values()) {
  if (event.status === "success") {
    total += Number(event.amount);
    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
