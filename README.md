# trans-noty

Notify the latest transactions being made to/from a blockchain address.

## Supported Networks(In Progress)

Here you will find the list of supported networks and tokens.

### Tron

Currently supports tron network using "TronScan". Visit https://docs.tronscan.org/.

List of supported tokens:

**1. TRX(Official Token for TRON network)**

## Usage

Create a watcher

```js
import { Watcher, TrxWatcherOption, TrxTransaction } from "trans-not";

// verbose mode enable
const watcher = new Watcher();

// verbose mode disable
const watcher = new Watcher(false);

const options: TrxWatcherOption = {
  apiKey: "API_KEY",
  addressToWatch: "ADDRESS",
  transactionLimit: 50, // default 1
  intervalCronSyntax: "*/3 * * * *", // each 3 seconds. default is 5.
};
const trxWatcher = watcher.getTrxWatcher(options);
```

Monitor transactions

```js
// for only confirmed transactions
trxWatcher.notifyLastConfirmedTransaction((transactions: TrxTransaction[]) => {
  console.log(transactions);
});

// for all transactions
trxWatcher.notifyLastTransaction((transactions: TrxTransaction[]) => {
  console.log(transactions);
});
```
