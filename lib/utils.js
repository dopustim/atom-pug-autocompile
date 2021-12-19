"use babel"

import fs from "fs"
import path from "path"
import readline from "readline"

import pug from "pug"
import { html as pretty } from "js-beautify"

/**
 * Utils Object
 */
export default {

    // Main action
    createHTML: function(filePath, config) {

        return new Promise((resolve, reject) => {

            if (!this.isExists(filePath))
                throw new Error("File is not found: " + filePath)

            if (!this.isPugFile(filePath))
                throw new Error("This is not a Pug-file: " + filePath)

            this.getFirstLine(filePath)
                .then((firstLine) => {
                    // Parse options from the first line
                    const options = this.parsePugOptions(firstLine)

                    if (options.size === 0)
                        reject(new Error("Parsing options failed. First line has no options"))

                    if (options.has("main")) {
                        // This should be the path to the "main" file
                        filePath = this.resolvePath(filePath, options.get("main"))
                        this.createHTML(filePath, config)
                            .then((message) => resolve(message))
                            .catch((err) => reject(err))

                    } else if (options.has("out")) {
                        // Compile this file and write the result to the "out" file
                        const code = this.getFileContent(filePath).replace(firstLine, "")
                        const compiled = options.has("pretty") && options.get("pretty") === "true"
                            ? this.compilePugPretty(code, filePath, config)
                            : this.compilePug(code, filePath)

                        const destFilePath = this.resolvePath(filePath, options.get("out"))

                        this.forceWriteFile(destFilePath, compiled)
                            .then((message) => resolve(message))
                            .catch((err) => reject(err))
                    }
                })
                .catch((err) => reject(err))
        })
    },
    // Compile Pug to HTML
    compilePug: function(code, filePath) {
        const compiled = pug.render(code, {
            filename: filePath
        })
        return compiled
    },
    // Compile Pug to HTML in pretty mode
    compilePugPretty: function(code, filePath, options) {
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
    },
    // Check if file is Pug
    isPugFile: function(filePath) {
        return filePath.endsWith(".pug")
    },
    // Parse options
    parsePugOptions: function(optionsLine) {
        const options = new Map()
        optionsLine.replace(/^\/\/-/, "").split(",").forEach((item) => {
            const index = item.indexOf(":")
            if (index !== -1) {
                const key = item.substr(0, index).trim()
                const value = item.substr(index + 1).trim()
                options.set(key, value)
            }
        })
        return options
    },
    // Resolve path relative to another file
    resolvePath: function(baseFilePath, filePath) {
        return path.resolve(path.dirname(baseFilePath), filePath)
    },
    // Check if file is exists
    isExists: function(filePath) {
        return fs.existsSync(filePath)
    },
    // Open file and get the first line
    getFirstLine: function(filePath) {
        return new Promise((resolve, reject) => {
            const ri = readline.createInterface({ input: fs.createReadStream(filePath) })
            ri.on("line", (line) => {
                ri.close()
                if (line)
                    resolve(line)
                else
                    reject(new Error("Getting first line failed"))
            })
        })
    },
    // Read file content
    getFileContent: function(filePath) {
        return fs.readFileSync(filePath, "utf8")
    },
    // Write content to file
    forceWriteFile: function(filePath, fileContent) {
        return new Promise((resolve, reject) => {
            const fileDir = path.dirname(filePath)
            try {
                if (!fs.existsSync(fileDir))
                    fs.mkdirSync(fileDir, { recursive: true })
                fs.writeFileSync(filePath, fileContent)
                resolve("File created: " + filePath)
            } catch (err) {
                reject(err)
            }
        })
    }
}
