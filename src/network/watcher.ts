import Logger from "../util/logger";
import TrxWatcher, { TrxWatcherOption } from "./tron/trx/watcher";

export default class Watcher {
    public constructor(verbose = true) {
        Logger.setVerbose(verbose);
    }

    public getTrxWatcher(options: TrxWatcherOption): TrxWatcher {
        return new TrxWatcher(options);
    }
}