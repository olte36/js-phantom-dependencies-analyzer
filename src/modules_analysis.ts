import {parseModule, Syntax} from "esprima"
import {Statement, CallExpression, Expression, BaseNode, Declaration} from "estree"

const COMMON_JS_REQUIRE = "require"
const STATEMENTS: string[] = [
    Syntax.BlockStatement,
    Syntax.BreakStatement,
    Syntax.ContinueStatement,
    Syntax.DebuggerStatement,
    Syntax.DoWhileStatement,
    Syntax.EmptyStatement,
    Syntax.ExpressionStatement,
    Syntax.ForInStatement,
    Syntax.ForOfStatement,
    Syntax.ForStatement,
    Syntax.IfStatement,
    Syntax.LabeledStatement,
    Syntax.ReturnStatement,
    Syntax.SwitchStatement,
    Syntax.ThrowStatement,
    Syntax.TryStatement,
    Syntax.WhileStatement,
    Syntax.WithStatement,
    Syntax.VariableDeclaration,
    Syntax.FunctionDeclaration,
    Syntax.ClassDeclaration,
]

export enum ImportStyle {
    ES,
    COMMON_JS,
    UNPROCESSABLE
}

export interface ImportedModule {
    name?: string,
    style: ImportStyle,
    row: number,
    col: number
}

export function getImportedModules(content: string): ImportedModule[] {
    let result: ImportedModule[] = []
    const program = parseModule(content, { loc: true })

    program.body.forEach(part => {
        if (part.type == Syntax.ImportDeclaration) {
            result.push({
                name: part.source.value as string,
                style: ImportStyle.ES,
                row: part.source.loc?.start.line as number,
                col: part.source.loc?.start.column as number
            })
            
        } else if (isStatement(part)) {
            result = result.concat(processStatement(part as Statement))
        } 
    })
    //programm.body.filter(m => m.type == "ImportDeclaration")
    
    //console.log(JSON.stringify(program, undefined, "  "))
    return result
}

function getCommonsJsImportFromLiteral(callExpression: CallExpression): ImportedModule | null {
    const callee = callExpression.callee
    const args = callExpression.arguments
    if (callee.type == Syntax.Identifier
        && callee.name == COMMON_JS_REQUIRE
        && args.length == 1) {
        const row = args[0].loc?.start.line as number
        const col = args[0].loc?.start.column as number   
        if (args[0].type == Syntax.Literal) {
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

function processStatement(statement: Statement): ImportedModule[] {
    switch (statement.type) {
        case Syntax.VariableDeclaration:
            return statement.declarations
                .filter(vd => vd.init)
                .map(vd => processExpression(vd.init as Expression))
                .filter(m => m !== null)
                .map(m => m as ImportedModule)

        case Syntax.BlockStatement:
            return statement.body.flatMap(s => processStatement(s))
        
        case Syntax.WithStatement:
        case Syntax.WhileStatement:
        case Syntax.DoWhileStatement:
        case Syntax.ForInStatement:
        case Syntax.ForOfStatement:
        case Syntax.ForStatement:
        case Syntax.FunctionDeclaration:
            return processStatement(statement.body)

        case Syntax.ClassDeclaration:
        // TODO    
            return []   
        
        case Syntax.ReturnStatement:
            if (statement.argument) {
                const module = processExpression(statement.argument)
                return module ? [module] : []
            }
            return []
        
        case Syntax.IfStatement:
            const consequentModules = processStatement(statement.consequent)
            const alternateModules = statement.alternate ? processStatement(statement.alternate) : []
            return consequentModules.concat(alternateModules)

        case Syntax.TryStatement:
            const blockModules = processStatement(statement.block)    
            const handlerModules = statement.handler ? processStatement(statement.handler.body) : []
            const finalizerModules = statement.finalizer ? processStatement(statement.finalizer) : []
            return blockModules.concat(handlerModules, finalizerModules)

        default:
            return []
    }
}

function processExpression(expression: Expression): ImportedModule | null {
    if (expression.type === Syntax.CallExpression) {
        return getCommonsJsImportFromLiteral(expression)
    }
    return null
}

function isStatement(node: BaseNode) {
    return STATEMENTS.includes(node.type)
}