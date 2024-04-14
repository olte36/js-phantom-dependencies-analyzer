import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"

export interface CliOptions {
    package: string,
    isDirectory: boolean,
    isInRegistry: boolean
}

export function parseCli(): CliOptions {
    const argv = yargs(hideBin(process.argv))
        .options({
            "d": {
                default: false,
                type: "boolean"
            },
            "r": {
                default: false,
                type: "boolean"
            }
        })
        .demandCommand(1, "package is not specified")
        .parseSync()
        
    return {
        package: argv._[0].toString(),
        isDirectory: argv.d,
        isInRegistry: argv.r
    }
}