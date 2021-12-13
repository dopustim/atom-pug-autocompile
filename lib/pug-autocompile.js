'use babel';

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import pretty from 'pretty';
import pug from 'pug';

import PugAutocompileConfig from './pug-autocompile-config';
import PugAutocompileView from './pug-autocompile-view';

import {
    Emitter,
    CompositeDisposable
} from 'atom';

const atom = global.atom;

const parseFirstLine = (srcFilePath, callback) => {
    // Read line and call parser
    let firstLine;
    let firstLineParams = {};
    const rLine = readline.createInterface({
        input: fs.createReadStream(srcFilePath)
    });
    // Get only first line and try to get options
    rLine.on('line', (line) => {
        firstLine = line;
        rLine.close();
    });
    rLine.on('close', () => {
        firstLineParams = parseLine(firstLine);
        if (firstLineParams) {
            callback(null, firstLineParams);
        } else {
            callback('Parsing failed');
        }
    });
}

const parseLine = (line) => {
    // Parser
    const options = {};
    // Pasre options
    line.replace(/^\/\/-/, '').split(',').forEach((item) => {
        const index = item.indexOf(':');
        if (index !== -1) {
            const key = item.substr(0, index).trim();
            const value = item.substr(index + 1).trim();
            options[key] = value;
        }
    });
    return options;
}

export default {

    config: PugAutocompileConfig,
    userConf: null,
    view: null,
    viewTooltip: null,
    emitter: null,
    subscriptions: null,
    statusBarTile: null,

    activate() {
        // User configuration
        this.userConf = atom.config.getAll('pug-autocompile')[0].value;
        // View
        this.view = new PugAutocompileView();
        // Toolip
        this.viewTooltip = atom.tooltips.add(this.view.getElement(), {
            title: 'Pug Autocompile plugin'
        });
        // Emit custom events
        this.emitter = new Emitter();
        // Events
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.workspace.observeActiveTextEditor((editor) => {
            if (editor) editor.onDidSave(() => this.handleSave(editor));
        }));
        this.subscriptions.add(atom.config.onDidChange('pug-autocompile', () => {
            this.userConf = atom.config.getAll('pug-autocompile')[0].value;
        }));
        this.subscriptions.add(atom.commands.add('atom-text-editor', {
            'pug-autocompile:compile-file': () => this.compileFile(),
            'pug-autocompile:compile-direct': () => this.compileDirect()
        }));
    },

    deactivate() {
        // Remove them all
        this.emitter.dispose();
        this.subscriptions.dispose();
        this.viewTooltip.dispose();
        this.view.destroy();
        this.statusBarTile.destroy();
        this.userConf = null;
    },

    serialize() {},

    onDidCompiledFile(callback) {
        this.emitter.on('did-compiled-file', callback);
    },

    onDidCompiledDirect(callback) {
        this.emitter.on('did-compiled-direct', callback);
    },

    consumeStatusBar(statusBar) {
        // https://atom.io/docs/api/v1.30.0/Panel
        this.statusBarTile = statusBar.addLeftTile({
            item: this.view.getElement(),
            priority: 100
        });
    },

    handleSave(editor) {
        // This is required
        if (!editor) return;
        // User can disable compiling on save
        if (!this.userConf.compileOnSave) return;
        // Current file
        const srcFilePath = editor.getPath();
        // It should be Pug-file to activate createHTML() on save
        if (!this.isPugFile(srcFilePath)) return;
        this.createHTML(srcFilePath);
    },

    createHTML(srcFilePath) {
        // If source file not found
        if (!fs.existsSync(srcFilePath)) {
            this.showError(`Cannot find file ${srcFilePath}`);
        }
        // If source file not a Pug-file
        if (!this.isPugFile(srcFilePath)) {
            this.showError(`It must be Pug file ${srcFilePath}`);
        }
        parseFirstLine(srcFilePath, (err, opt) => {

            if (err) return; // don't use this file

            if ('main' in opt) {
                // If the first line has option "main", it should be path to "main" Pug-file
                srcFilePath = path.resolve(path.dirname(srcFilePath), opt.main);
                this.createHTML(srcFilePath); // go over there
            } else if ('out' in opt) {
                // This is the "main" Pug-file. Try to render and save
                try {
                    let rendered = pug.renderFile(srcFilePath, {cache: false});
                    rendered = rendered.replace(/<!--.*?-->/gm, ''); // remove comments
                    // If the first line has options "pretty: true" or "compress: false"...
                    if (opt.pretty && opt.pretty === 'true' ||
                        opt.compress && opt.compress === 'false') {
                        rendered = pretty(rendered, {
                            indent_size: this.userConf.indentSize
                        });
                    }
                    // Check new path
                    const destFilePath = path.resolve(path.dirname(srcFilePath), opt.out);
                    const destFileDir = path.dirname(destFilePath);

                    // If destination dir not found
                    if (!fs.existsSync(destFileDir)) {
                        // Try to create this dir
                        fs.mkdir(destFileDir, { recursive: true }, (error) => {
                            if (error) {
                                throw new Error(`Cannot create dir ${destFileDir}`);
                            }
                        });
                    }
                    // Save HTML-file
                    this.writeFile(destFilePath, rendered);
                } catch (error) {
                    // Smth went wrong
                    this.showError(error.message);
                }
            }
        });

    },

    compileFile() {
        // Try to compile from file
        const editor = atom.workspace.getActiveTextEditor();
        const srcFilePath = editor.getPath();
        this.createHTML(srcFilePath);
    },

    compileDirect() {
        // Try to compile from selection
        const editor = atom.workspace.getActiveTextEditor();
        const srcFilePath = editor.getPath();
        try {
            let rendered = pug.render(editor.getSelectedText(), {
                filename: srcFilePath // required for relative "include" and "extends"
            });
            rendered = rendered.replace(/<!--.*?-->/gm, ''); // remove comments
            // Should be pretty anyway!
            rendered = pretty(rendered, {
                indent_size: this.userConf.indentSize
            });
            editor.insertText(rendered);
            // Emit event
            this.emitter.emit('did-compiled-direct', () => {
                return {
                    file: srcFilePath,
                    rendered: rendered
                }
            });
            // Notifications
            this.showSuccess('Pug > HTML');
        } catch (error) {
            // Smth went wrong
            this.showError(error.message);
        }
    },

    isPugFile(srcFilePath) {
        return srcFilePath.substr(-4) === '.pug';
    },

    writeFile(filePath, fileContent) {
        // Write output
        fs.writeFileSync(filePath, fileContent);
        // Emit event
        this.emitter.emit('did-compiled-file', () => {
            return {
                file: filePath,
                rendered: fileContent
            }
        });
        // Notifications
        this.showSuccess(filePath);
    },

    showSuccess(message) {
        // Status bar & Notifications
        this.view.showSuccess(this.userConf.statusTimeout);

        if (this.userConf.displayNotifications) {
            atom.notifications.addSuccess('Created!', {detail: message});
        }
    },

    showError(message) {
        // Status bar & Notifications
        this.view.showError(this.userConf.statusTimeout);

        if (this.userConf.displayNotifications) {
            return atom.notifications.addError('Error!', {detail: message});
        }
    }

};
