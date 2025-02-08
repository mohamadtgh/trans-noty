import cron from "node-cron";
import Logger from "../../../util/logger";
import {DEFAULT_INTERVAL_CRONSYNTAX, TRONSCAN_API_TOKEN_KEY,tronScanApiEndpoint} from './constants';

export type TrxTransaction = {
  id: string | number;
  timestamp: number;
  transactionHash: string;
  block: number;
  confirmed: boolean;
  amount: number;
  transferFromAddress: string;
  transferToAddress: string;
}

export type TrxWatcherOption = {
  transactionLimit:number;
  addressToWatch: string;
  apiKey: string;
  intervalCronSyntax?: string;
}

type TronScanTransfer = {
  total: number;
  data: TrxTransaction[];
}

export default class TrxWatcher {
  private recentTransaction: TrxTransaction[];
  private lastTaskTimestamp: number;

  public constructor(private options: TrxWatcherOption){
    this.resetRecentTransaction();
  }

  public notifyLastTransaction(notifyCallback: (transactions: TrxTransaction[]) => void): void {
    Logger.info("Monitoring all transactions ...");
    this.resetRecentTransaction();
    cron.schedule(this.options.intervalCronSyntax?? DEFAULT_INTERVAL_CRONSYNTAX , async () => {
      const taskTimestamp = this.registerTaskTimestamp();
      Logger.info("checking for transactions ", taskTimestamp);
      const newTransactions = await this.getNewTransactions(this.options.transactionLimit);

      if (newTransactions.length > 0 && this.lastTaskTimestamp === taskTimestamp) {
        if (typeof notifyCallback === "function") {
          notifyCallback(newTransactions);
        }
      }
    });
  }
  public notifyLastConfirmedTransaction(notifyCallback: (transactions: TrxTransaction[]) => void): void {
    Logger.info("Monitoring confirmed transactions ...");
    this.resetRecentTransaction();
    cron.schedule("*/5 * * * * *", async () => {
      const taskTimestamp = this.registerTaskTimestamp();
      Logger.info("checking for transactions ", taskTimestamp);
      const newTransactions = await this.getNewConfirmedTransactions(this.options.transactionLimit);

      if (newTransactions.length > 0 && this.lastTaskTimestamp === taskTimestamp) {
        if (typeof notifyCallback === "function") {
          notifyCallback(newTransactions);
        }
      }
    });
  }

  private async getTransactions(limit: number = 1): Promise<TrxTransaction[]> {
    const response = await fetch(
      tronScanApiEndpoint(limit,this.options.addressToWatch),
      {
        headers: {
          [TRONSCAN_API_TOKEN_KEY] : this.options.addressToWatch,
        },
      }
    );
    const resJson = await response.json();

    return this.mapTronScanTransferToTrxTransaction(resJson);
  }

  private async getNewTransactions(limit: number = 1): Promise<TrxTransaction[]> {
    const transactions = await this.getTransactions(limit);
    const newTransactions = this.filterRecentTransactions(transactions);

    if (newTransactions.length > 0) {
      this.recentTransaction = newTransactions;
    }

    return newTransactions;
  }

  private async getNewConfirmedTransactions(limit: number = 1): Promise<TrxTransaction[]> {
    const transactions = await this.getTransactions(limit);
    const newConfirmedTransactions = this.filterRecentConfirmedTransactions(transactions);
    if (newConfirmedTransactions.length > 0) {
      this.recentTransaction = newConfirmedTransactions;
    }

    return newConfirmedTransactions;
  }

  private registerTaskTimestamp(): number {
    this.lastTaskTimestamp = new Date().getTime();
    return this.lastTaskTimestamp;
  }

  private mapTronScanTransferToTrxTransaction(transfers: TronScanTransfer): TrxTransaction[] {
    const { data: transferData } = transfers;

    return transferData.map((transfer) => {
      const {
        amount,
        block,
        confirmed,
        id,
        timestamp,
        transactionHash,
        transferFromAddress,
        transferToAddress,
      } = transfer;
      return {
        amount,
        block,
        confirmed,
        id,
        timestamp,
        transactionHash,
        transferFromAddress,
        transferToAddress,
      };
    });
  }

  private resetRecentTransaction(): void {
    this.recentTransaction = [
      {
        amount: 0,
        block: 0,
        confirmed: false,
        id: "",
        timestamp: new Date().getTime(),
        transactionHash: "",
        transferFromAddress: "",
        transferToAddress: "",
      },
    ];
  }

  private filterRecentTransactions(transactionsToFilter: TrxTransaction[]): TrxTransaction[] {
    return transactionsToFilter.filter((transaction: TrxTransaction) => {
      return this.recentTransaction.findIndex((recentTransaction: TrxTransaction) => {
        return (
          recentTransaction.transactionHash !== transaction.transactionHash &&
          transaction.timestamp >= recentTransaction.timestamp &&
          transaction.block >= recentTransaction.block
        );
      });
    });
  }

  private filterRecentConfirmedTransactions(transactionsToFilter: TrxTransaction[]): TrxTransaction[] {
    return transactionsToFilter.filter((transaction: TrxTransaction) => {
      return (
        transaction.confirmed &&
        transaction.timestamp >= this.recentTransaction[0].timestamp &&
        transaction.block >= this.recentTransaction[0].block &&
        this.recentTransaction.findIndex((recentTransaction: TrxTransaction) => {
          return recentTransaction.transactionHash === transaction.transactionHash;
        }) === -1
      );
    });
  }
}
