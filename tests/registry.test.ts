import {downloadPackage} from "../src/registry"
import { tmpdir } from 'node:os'
import { mkdtempSync, rmSync } from "node:fs"
import * as path from "node:path"

let testTmpDir: string

beforeAll(() => {
    testTmpDir = path.join(process.cwd(), "registry-test")
    console.log(testTmpDir)
})

afterAll(() => {
    //rmSync(testTmpDir, {force: true, recursive: true})
})

test("Download package", async () => {
    const pkgDir = await downloadPackage({name: "pretty-bytes", version: "6.1.1"}, testTmpDir)
    console.log("pkgDir", pkgDir)
}, 50000)