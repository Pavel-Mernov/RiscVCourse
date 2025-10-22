import { mkdtemp } from "fs";
import path from "path";

type ResultType = {
    error : string
} | {
    directory : string
}

export async function makeTempDir(dirname : string, suffix : string, relpath ?: string,) : Promise<string> {
    const baseDir = (!relpath) ? dirname : path.resolve(dirname, relpath)

    const tempDirName = path.join(baseDir, suffix)

    return new Promise((resolve, reject) => {
        mkdtemp(tempDirName, (err, directory) => {
            if (err) return reject(err);
            resolve(directory);
        });
    });
}