"use babel"

import fs from "fs"
import path from "path"
import readline from "readline"

import pug from "pug"
import { html as pretty } from "js-beautify"

/**
 * Compile Pug to HTML
 */
export function compilePug(code, filePath) {

    const compiled = pug.render(code, {
        filename: filePath
    })
    return compiled
}

/**
 * Compile Pug to HTML in pretty mode
 */
export function compilePugPretty(code, filePath, options) {

    const compiled = pug.render(code, {
        filename: filePath
    })
    return pretty(compiled, {
        html: {
            indent_size: options.indentSize,
            end_with_newline: true,
            extra_liners: []
        }
    })
}

/**
 * Check if file is Pug
 */
export function isPugFile(filePath) {
    return filePath.endsWith(".pug")
}

/**
 * Parse options
 */
export function parsePugOptions(optionsLine) {

    const options = new Map()
    optionsLine.replace(/^\/\/-/, "").split(",").forEach((item) => {
        const index = item.indexOf(":")
        if (index !== -1) {
            const key = item.substr(0, index).trim()
            const value = item.substr(index + 1).trim()
            options.set(key, value)
        }
    })
    if (options.size === 0)
        throw new Error("Parsing options failed. First line has no options")
    return options
}

/**
 * Resolve path relative to another file
 */
export function resolvePath(baseFilePath, filePath) {
    return path.resolve(path.dirname(baseFilePath), filePath)
}

/**
 * Check if file is exists
 */
export function isExists(filePath) {
    return fs.existsSync(filePath)
}

/**
 * Open file and get the first line
 */
export function getFirstLine(filePath) {

    return new Promise((resolve, reject) => {

        let firstLine = ""
        const ri = readline.createInterface({
            input: fs.createReadStream(filePath)
        })
        ri.on("line", (line) => {
            firstLine = line
            ri.close()
        }).on("close", () => {
            if (firstLine)
                resolve(firstLine)
            else
                reject(new Error("Getting first line failed"))
        })
    })
}

/**
 * Read file content
 */
export function getFileContent(filePath) {

    return fs.readFileSync(filePath, "utf8")
}

/**
 * Write content to file
 */
export function forceWriteFile(filePath, fileContent) {

    return new Promise((resolve, reject) => {

        const fileDir = path.dirname(filePath)
        try {
            if (!fs.existsSync(fileDir))
                fs.mkdirSync(fileDir, { recursive: true })
            fs.writeFileSync(filePath, fileContent)
            resolve("File created: " + filePath)
        } catch (err) {
            reject(err.message)
        }
    })
}
