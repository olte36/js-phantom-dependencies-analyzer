import * as acorn from "acorn"
import * as acornWalk from "acorn-walk"

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
    col: number
}

export function getImportedModules(content: string): ImportedModule[] {
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
                col: node.source.loc?.start.column as number
            })
        },
        ImportExpression(node) {
            result.push(getEsDynamicImport(node))
        },
        CallExpression(node) {
            const module = getCommonsJsImportFromLiteral(node)
            if (module != null) {
                result.push(module)
            }
        }
    })
    
    //console.log(JSON.stringify(program, undefined, "  "))
    return result
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