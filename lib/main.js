"use babel"

import { Emitter, CompositeDisposable } from "atom"

import config from "./config"
import utils from "./utils"
import View from "./view"

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

    // Activate the plugin
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
    // Use the status bar
    consumeStatusBar: function(statusBar) {
        // https://github.com/atom/status-bar
        this.statusBarTile = statusBar.addLeftTile({
            item: this.view.getElement(),
            priority: 100
        })
    },
    // Handle Save event
    handleSave: function(editor) {
        // Editor is required
        if (!editor) return
        // User can disable compiling on save
        if (!this.userConf.compileOnSave) return
        // Create HTML
        const filePath = editor.getPath()
        this.createHTML(filePath)
    },
    // Compile from the file content (writes the result to a file)
    compileFile: function() {
        const editor = atom.workspace.getActiveTextEditor()
        // Create HTML
        const filePath = editor.getPath()
        this.createHTML(filePath)
    },
    // Compile from the current selection (replaces the selected with the result)
    compileDirect: function() {
        const editor = atom.workspace.getActiveTextEditor()
        // Create HTML
        const filePath = editor.getPath()
        try {
            const code = editor.getSelectedText()
            const compiled = utils.compilePugPretty(code, filePath, this.userConf)
            editor.insertText(compiled)
            this.emitter.emit("did-compiled-direct", filePath)
            this.showSuccess("Created HTML from Pug")
        } catch (err) {
            this.showError(err.message)
        }
    },
    // Main action
    createHTML: function(filePath) {
        utils.createHTML(filePath, this.userConf)
            .then((message) => {
                this.emitter.emit("did-compiled-file", filePath)
                this.showSuccess(message)
            })
            .catch((err) => {
                this.showError(err.message)
            })
    },
    // Show message with Success status
    showSuccess: function(message) {
        // Status bar
        this.view.showSuccess(this.userConf.statusTimeout)
        // Notification
        if (this.userConf.displayNotifications)
            atom.notifications.addSuccess("Pug Autocompile", { detail: message })
    },
    // Show message with Error status
    showError: function(message) {
        // Status bar
        this.view.showError(this.userConf.statusTimeout)
        // Notification
        if (this.userConf.displayNotifications)
            atom.notifications.addError("Pug Autocompile", { detail: message })
    },
    // Run this callback when the file has been compiled
    onDidCompiledFile: function(callback) {
        this.emitter.on("did-compiled-file", callback)
    },
    // Run this callback when the selection has been compiled
    onDidCompiledDirect: function(callback) {
        this.emitter.on("did-compiled-direct", callback)
    },
    // Deactivate the plugin
    deactivate: function() {
        // Release them all
        this.emitter.dispose()
        this.subscriptions.dispose()
        this.viewTooltip.dispose()
        this.view.destroy()
        if (typeof this.statusBarTile !== "undefined" && this.statusBarTile !== null)
            this.statusBarTile.destroy()
        this.statusBarTile = null
        this.userConf = null
    }
}
