import { getImportedModules } from "../src/modules_analysis"
import { ImportStyle } from "../src/modules_analysis"
import * as fs from "fs"
import * as path from "path"


const table = [
    {
        name: "Test ES modules detection",
        file: "modules/es_modules.js",
        expectedModules: [
            "DefaultImport",
            "NamespaceImport",
            "NamedImportSingle",
            "NamedImportAlias",
            "DefaultImportAlias",
            "NamedImportMultiple",
            "NamedImportMultipleWithAlias",
            "NamedAndDefaultImport",
            "DefaultAndNamespaceImport",
            "WholeModuleImport"
        ],
        style: ImportStyle.ES
    },
    {
        name: "Test commonJS modules detection",
        file: "modules/common_js.js",
        expectedModules: [
            "requireModule",
            "requireModuleInsideFunction",
            "requireModuleInObject"
        ],
        style: ImportStyle.COMMON_JS
    }
]

test.each(table)('$name', ({file, expectedModules, style}) => {
    const content = fs.readFileSync(path.resolve(__dirname, file), "utf8")
    const actualModules = getImportedModules(content)
    
    //expect(actualModules.length).toBe(expectedModules.length)
    for (const module of expectedModules) {
        const foundModule = actualModules.find(im => im.name == module)
        expect(foundModule?.name).toBe(module)
        expect(foundModule?.style).toBe(style)
    }
})