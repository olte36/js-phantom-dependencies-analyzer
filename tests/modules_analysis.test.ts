import { getImportedModules } from "../src/modules_analysis"
import { ImportStyle } from "../src/modules_analysis"

const table = [
    // ES modules
    {
        testName: "Default import",
        code: 'import defaultExport from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName: "Namespace import",
        code : 'import * as name from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName: "Named import",
        code : 'import { export1 } from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName: "Named aliased import",
        code : 'import { export1 as alias1 } from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName: "Default aliased import",
        code : 'import { default as alias } from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName: "Multiple named imports",
        code : 'import { export1, export2 } from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName: "Named import and named aliad import",
        code : 'import { export1, export2 as alias2 } from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName : "Default and named imports",
        code : 'import defaultExport, { export1 } from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName : "Default and namespace imports",
        code : 'import defaultExport, * as name from "module-name";',
        style: ImportStyle.ES
    },
    {
        testName : "Side effect import",
        code : 'import "module-name";',
        style: ImportStyle.ES
    },
    // Common JS
    {
        testName: "Global var import",
        code : 'const module = require("module-name")',
        style: ImportStyle.COMMON_JS
    },
    {
        testName: "Import inside function",
        code : `
            function dummyFunction() {
                const module = require("module-name")
            }
        `,
        style: ImportStyle.COMMON_JS
    }
]

test.each(table)('$style: $testName', ({testName, code, style}) => {
    const actualModule = getImportedModules(code)[0]
    expect(actualModule?.name).toBe("module-name")
    expect(actualModule?.style).toBe(style)
})