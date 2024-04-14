import { parseCli } from "./cli";
import * as fs from "node:fs"
import * as path from "node:path"
import * as os from "node:os"
import {downloadPackage} from "./registry"
import {parsePackageName} from "./package"
import {getMissingModulesOfPackage} from "./modules_analysis"


async function main() {
let packageDir = ""
let isTmpDir = false
try {
    const args = parseCli()

    if (args.isDirectory) {
        packageDir = args.package
    } else if (args.isInRegistry) {
        packageDir = fs.mkdtempSync(path.join(os.tmpdir(), "js-deps-analizer"));
        const npmPackage = parsePackageName(args.package)
        console.log(`Downloading ${npmPackage.name}@${npmPackage.version}`)
        await downloadPackage(npmPackage, packageDir)
        packageDir = path.join(packageDir, "package")
        console.log(`Downloaded in ${packageDir}`)
        isTmpDir = true
    } else {
        throw new Error("checkin local node_modules is not implemented yet")
    }

    const missingModules = getMissingModulesOfPackage(packageDir)
    console.log(missingModules)
} 
finally {
    if (isTmpDir && packageDir) {
        //fs.rmSync(packageDir, {recursive: true})
    }
}
}

main()
