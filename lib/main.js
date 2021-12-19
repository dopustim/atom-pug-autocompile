"use babel"

import { Emitter, CompositeDisposable } from "atom"

import config from "./config"
import View from "./view"
import {
    compilePug, compilePugPretty, isPugFile, parsePugOptions,
    resolvePath, isExists, getFirstLine, getFileContent, forceWriteFile
} from "./utils"

/**
 * Main Object
 */
export default {

    config,
    userConf: null,
    view: null,
    viewTooltip: null,
    emitter: null,
    subscriptions: null,
    statusBarTile: null,

    /**
     * Activate the plugin
     */
    activate: function() {
        // User configuration
        this.userConf = atom.config.getAll("pug-autocompile")[0].value
        // View
        this.view = new View()
        // Tooltip
        this.viewTooltip = atom.tooltips.add(this.view.getElement(), {
            title: "Pug Autocompile plugin"
        })
        // Emitter for custom events
        this.emitter = new Emitter()
        // Subscriptions
        this.subscriptions = new CompositeDisposable()
        // When the file has been saved
        this.subscriptions.add(atom.workspace.observeActiveTextEditor((editor) => {
            if (editor) editor.onDidSave(() => this.handleSave(editor))
        }))
        // When the config has been changed
        this.subscriptions.add(atom.config.onDidChange("pug-autocompile", () => {
            this.userConf = atom.config.getAll("pug-autocompile")[0].value
        }))
        // When the command has been executed
        this.subscriptions.add(atom.commands.add("atom-text-editor", {
            "pug-autocompile:compile-file": () => this.compileFile(),
            "pug-autocompile:compile-direct": () => this.compileDirect()
        }))
    },

    /**
     * Run this callback when the file has been compiled
     */
    onDidCompiledFile: function(callback) {
        this.emitter.on("did-compiled-file", callback)
    },

    /**
     * Run this callback when the selection has been compiled
     */
    onDidCompiledDirect: function(callback) {
        this.emitter.on("did-compiled-direct", callback)
    },

    /**
     * Deactivate the plugin
     */
    deactivate: function() {
        // Release them all
        this.emitter.dispose()
        this.subscriptions.dispose()
        this.viewTooltip.dispose()
        this.view.destroy()
        this.statusBarTile.destroy()
        this.userConf = null
    },

    /**
     * Serialize object state
     */
    serialize: function() {},

    /**
     * Use the status bar
     */
    consumeStatusBar: function(statusBar) {
        // https://github.com/atom/status-bar
        this.statusBarTile = statusBar.addLeftTile({
            item: this.view.getElement(),
            priority: 100
        })
    },

    /**
     * Main action
     */
    createHTML: function(filePath) {
        try {
            if (!isExists(filePath))
                throw new Error("File is not found: " + filePath)

            if (!isPugFile(filePath))
                throw new Error("This is not a Pug-file: " + filePath)

            getFirstLine(filePath).then((firstLine) => {
                // Parse options from the first line
                const options = parsePugOptions(firstLine)

                if (options.has("main")) {
                    // This should be the path to the "main" file
                    filePath = resolvePath(filePath, options.get("main"))
                    this.createHTML(filePath)
                } else if (options.has("out")) {
                    // Compile this file and write the result to the "out" file
                    const code = getFileContent(filePath).replace(firstLine, "")
                    const compiled = options.has("pretty") && options.get("pretty") === "true"
                        ? compilePugPretty(code, filePath, this.userConf)
                        : compilePug(code, filePath)

                    const destFilePath = resolvePath(filePath, options.get("out"))

                    forceWriteFile(destFilePath, compiled).then((msg) => {
                        this.emitter.emit("did-compiled-file", filePath)
                        this.showSuccess(msg)
                    }).catch((err) => {
                        this.showError(err.message)
                    })
                }
            }).catch((err) => {
                this.showError(err.message)
            })
        } catch (err) {
            this.showError(err.message)
        }
    },

    /**
     * Compile from selection and replace selected text
     */
    compileDirect: function() {
        // Try to compile from selection
        const editor = atom.workspace.getActiveTextEditor()
        const filePath = editor.getPath()
        try {
            const code = editor.getSelectedText()
            const compiled = compilePugPretty(code, filePath, this.userConf)
            editor.insertText(compiled)
            // Emit event
            this.emitter.emit("did-compiled-direct", filePath)
            // Inform
            this.showSuccess("Created HTML from Pug")
        } catch (err) {
            // Inform
            this.showError(err.message)
        }
    },

    /**
     * Compile from file content
     */
    compileFile: function() {
        // Try to compile from file
        const editor = atom.workspace.getActiveTextEditor()
        const filePath = editor.getPath()
        this.createHTML(filePath)
    },

    /**
     * Handle Save event
     */
    handleSave: function(editor) {
        // Editor is required
        if (!editor) return
        // User can disable compiling on save
        if (!this.userConf.compileOnSave) return
        // Current file should be a Pug-file to activate createHTML() on save
        if (!isPugFile(editor.getPath())) return
        // Create HTML
        this.createHTML(editor.getPath())
    },

    /**
     * Show message with Success status
     */
    showSuccess: function(message) {
        // Status bar
        this.view.showSuccess(this.userConf.statusTimeout)
        // Notification
        if (this.userConf.displayNotifications)
            atom.notifications.addSuccess("Pug Autocompile", { detail: message })
    },

    /**
     * Show message with Error status
     */
    showError: function(message) {
        // Status bar
        this.view.showError(this.userConf.statusTimeout)
        // Notification
        if (this.userConf.displayNotifications)
            atom.notifications.addError("Pug Autocompile", { detail: message })
    }
}
