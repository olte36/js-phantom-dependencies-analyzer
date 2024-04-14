import * as npmfetch from "npm-registry-fetch"
import regNpmFetch from "npm-registry-fetch"
import gunzip from "gunzip-maybe"
import fs from "node:fs"
import os from "node:os"
import * as path from "node:path"
import {NpmPackage} from "./package"
import crypto from "node:crypto"
import * as stream from "node:stream"
import tar from "tar-fs"

export type RegistryOptions = npmfetch.Options


interface VersionMetadata {
    dist: {
        shasum: string,
        tarball: string
    }
}

export async function downloadPackage(npmPackage: NpmPackage, directory: string, registryOpt?: RegistryOptions) {    
    fs.accessSync(directory)
    const resp = await npmfetch.json(`/${npmPackage.name}/${npmPackage.version}`, registryOpt)
    const versionMetadata = toVersionMetadata(resp)
    const tarPkgResp = await regNpmFetch(versionMetadata.dist.tarball, registryOpt)    
    //fs.rmSync(pkgDir, {recursive: true, force: true})
    //fs.mkdirSync(pkgDir, {recursive: true})
    await stream.promises.pipeline(tarPkgResp.body, gunzip(), tar.extract(directory))
}

function toVersionMetadata(record: Record<string, unknown>): VersionMetadata {
    if (typeof record["dist"] !== "object" || record["dist"] == null) {
        throw new Error("expected 'dist' to be an object")
    }
    const dist = record["dist"] as Record<string, unknown>
    if (typeof dist["tarball"] !== "string") {
        throw new Error("expected 'tarball' to be a string")
    }
    if (typeof dist["shasum"] !== "string") {
        throw new Error("expected 'shasum' to be a string")
    }
    return {
        dist: {
            tarball: dist["tarball"],
            shasum: dist["shasum"]
        }
    }
}