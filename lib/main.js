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
     * Activate plugin
     */
    activate: function() {
        // User configuration
        this.userConf = atom.config.getAll("pug-autocompile")[0].value
        // View
        this.view = new View()
        // Toolip
        this.viewTooltip = atom.tooltips.add(this.view.getElement(), {
            title: "Pug Autocompile plugin"
        })
        // Emit custom events
        this.emitter = new Emitter()
        // Events
        this.subscriptions = new CompositeDisposable()

        this.subscriptions.add(atom.workspace.observeActiveTextEditor((editor) => {
            if (editor) editor.onDidSave(() => this.handleSave(editor))
        }))
        this.subscriptions.add(atom.config.onDidChange("pug-autocompile", () => {
            this.userConf = atom.config.getAll("pug-autocompile")[0].value
        }))
        this.subscriptions.add(atom.commands.add("atom-text-editor", {
            "pug-autocompile:compile-file": () => this.compileFile(),
            "pug-autocompile:compile-direct": () => this.compileDirect()
        }))
    },

    /**
     * Run callback when file is compiled
     */
    onDidCompiledFile: function(callback) {
        this.emitter.on("did-compiled-file", callback)
    },

    /**
     * Run callback when selection is compiled
     */
    onDidCompiledDirect: function(callback) {
        this.emitter.on("did-compiled-direct", callback)
    },

    /**
     * Kill all objects
     */
    deactivate: function() {
        // Remove them all
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
     * Use statusBar element
     */
    consumeStatusBar: function(statusBar) {
        // https://atom.io/docs/api/v1.30.0/Panel
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

                const options = parsePugOptions(firstLine)

                if (options.has("main")) {
                    // This should be the path to the "main" file
                    filePath = resolvePath(filePath, options.get("main"))
                    this.createHTML(filePath)
                } else if (options.has("out")) {
                    // Let's try to render HTML and save to "out"
                    const code = getFileContent(filePath).replace(firstLine, "")
                    const compiled = options.has("pretty") && options.get("pretty") === "true"
                        ? compilePugPretty(code, filePath, this.userConf)
                        : compilePug(code, filePath)
                    // Prepare new path
                    const destFilePath = resolvePath(filePath, options.get("out"))
                    // Save HTML-file
                    forceWriteFile(destFilePath, compiled).then((msg) => {
                        // Emit event
                        this.emitter.emit("did-compiled-file", filePath)
                        // Inform
                        this.showSuccess(msg)
                    }).catch((err) => {
                        // Inform
                        this.showError(err.message)
                    })
                }
            }).catch((err) => {
                // Inform
                this.showError(err.message)
            })
        } catch (err) {
            // Inform
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
        // Show in the view (status bar)
        this.view.showSuccess(this.userConf.statusTimeout)
        // Notification
        if (this.userConf.displayNotifications)
            atom.notifications.addSuccess("Pug Autocompile", { detail: message })
    },

    /**
     * Show message with Error status
     */
    showError: function(message) {
        // Show in the view (status bar)
        this.view.showError(this.userConf.statusTimeout)
        // Notification
        if (this.userConf.displayNotifications)
            atom.notifications.addError("Pug Autocompile", { detail: message })
    }
}
