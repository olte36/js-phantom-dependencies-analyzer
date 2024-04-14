// Parsed a scoped package name into name, version, and path.
const RE_SCOPED = /^(@[^\/]+\/[^@\/]+)(?:@([^\/]+))?(\/.*)?$/
// Parsed a non-scoped package name into name, version, path
const RE_NON_SCOPED = /^([^@\/]+)(?:@([^\/]+))?(\/.*)?$/


export interface NpmPackage {
    name: string,
    version: string
}


export function parsePackageName(packageName: string): NpmPackage {
    const m = RE_SCOPED.exec(packageName) || RE_NON_SCOPED.exec(packageName)
    if (!m) {
        throw new Error(`Invalid package name: ${packageName}`)
    }
    return {
        name: m[1],
        version: m[2] || "latest",
    }
}