import defaultExport from "DefaultImport";
import * as name from "NamespaceImport";
import { export1 } from "NamedImportSingle";
import { export1 as alias1 } from "NamedImportAlias";
import { default as alias } from "DefaultImportAlias";
import { export1, export2 } from "NamedImportMultiple";
import { export1, export2 as alias2 } from "NamedImportMultipleWithAlias";
import defaultExport, { export1 } from "NamedAndDefaultImport";
import defaultExport, * as name from "DefaultAndNamespaceImport";
import "WholeModuleImport";

var dummyVar

function dummyFunction() {

}
