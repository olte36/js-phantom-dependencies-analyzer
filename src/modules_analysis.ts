import * as acorn from "acorn"
import * as acornWalk from "acorn-walk"
import fs from "node:fs"
import path from "node:path"

const COMMON_JS_REQUIRE = "require"

export enum ImportStyle {
    ES = "ES",
    COMMON_JS = "Common JS",
    UNPROCESSABLE = "Unprocessable"
}

export interface ImportedModule {
    name?: string,
    style: ImportStyle,
    row: number,
    col: number,
    fileName?: string
}

export type Dependencies = {
    [key: string]: string
}

export interface PackageJsonDeps {
    dependencies?: Dependencies,
    devDependencies?: Dependencies,
    peerDependencies?: Dependencies,
    optionalDependencies?: Dependencies,
}

export function getImportedModules(content: string, fileName?: string): ImportedModule[] {
    let result: ImportedModule[] = []
    const program = acorn.parse(content, {
        ecmaVersion: "latest", 
        sourceType: "module",
        locations: true 
    })

    acornWalk.simple(program, {
        ImportDeclaration(node) {
            result.push({
                name: node.source.value as string,
                style: ImportStyle.ES,
                row: node.source.loc?.start.line as number,
                col: node.source.loc?.start.column as number,
                fileName: fileName,
            })
        },
        ImportExpression(node) {
            const module = getEsDynamicImport(node)
            module.fileName = fileName
            result.push(module)
        },
        CallExpression(node) {
            const module = getCommonsJsImportFromLiteral(node)
            if (module != null) {
                module.fileName = fileName
                result.push(module)
            }
        }
    })
    
    //console.log(JSON.stringify(program, undefined, "  "))
    return result
}

export function getMissingModulesOfFile(content: string, packageJson: PackageJsonDeps): ImportedModule[] {
    const declaredDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies,
        ...packageJson.optionalDependencies,
    }
    const importedModules = getImportedModules(content)
    const missingModules = importedModules.filter(module => {
        for (const name in declaredDeps) {
            // TODO: fix module check e.g. react and react-dom
            if (module.name?.startsWith(name)) {
                return false
            }
        }
        return true
    })
    return missingModules
}

export function getMissingModulesOfPackage(
    packageDir: string, 
    fileFilter: RegExp = /(\.js$)|(\.cjs$)|(\.mjs$)|(\.jsx$)|(\.ts$)|(\.tsx$)/
) {
    if (!fs.existsSync(packageDir)) {
        throw new Error(`The path ${packageDir} does not exist`)
    }
    const packageJsonPath = path.join(packageDir, "package.json")
    if (!fs.existsSync(packageJsonPath)) {
        throw new Error("The package must contain package.json")
    }
    const packageJson: PackageJsonDeps = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: "utf8" }))
    return fs.readdirSync(packageDir, { withFileTypes: true, recursive: true })
        .filter(f => f.isFile())
        .filter(f => fileFilter.test(f.name))
        .flatMap(f => {
            const filePath = path.join(f.path, f.name)
            const content = fs.readFileSync(filePath, { encoding: "utf8" })
            return getMissingModulesOfFile(content, packageJson)
                .map(m => {
                    m.fileName = filePath
                    return m
                })
        })
}

function getCommonsJsImportFromLiteral(callExpression: acorn.CallExpression): ImportedModule | null {
    const callee = callExpression.callee
    const args = callExpression.arguments
    if (callee.type == "Identifier"
        && callee.name == COMMON_JS_REQUIRE
        && args.length == 1) {
        const row = args[0].loc?.start.line as number
        const col = args[0].loc?.start.column as number   
        if (args[0].type == "Literal") {
            return {
                name: args[0].value as string,
                style: ImportStyle.COMMON_JS,
                row: row,
                col: col, 
            }
        } else {
            return {
                style: ImportStyle.UNPROCESSABLE,
                row: row,
                col: col, 
            }
        }
    }
    return null
}

function getEsDynamicImport(importExpression: acorn.ImportExpression): ImportedModule {
    const source = importExpression.source
    const row = source.loc!.start.line
    const col = source.loc!.start.column
    if (source.type == "Literal") {
        return {
            name: source.value as string,
            style: ImportStyle.ES,
            row: row,
            col: col
        }
    }
    return {
        style: ImportStyle.UNPROCESSABLE,
        row: row,
        col: col
    }
}