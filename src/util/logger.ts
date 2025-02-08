export default class Logger {
    private static VERBOSE: boolean = false;

    public static setVerbose(verbose: boolean):void {
        Logger.VERBOSE = verbose;
    }
    public static info(message?: any, ...optionalParams: any[]): void {
       Logger.VERBOSE && console.log(message,...optionalParams);
    }
}