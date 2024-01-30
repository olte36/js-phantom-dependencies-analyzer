import { getMissingModulesOfPackage } from "./modules_analysis";

const packageDir = process.argv[2]
const missingModules = getMissingModulesOfPackage(packageDir)

console.log(missingModules)