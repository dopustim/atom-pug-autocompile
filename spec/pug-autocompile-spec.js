"use babel"

import fs from "fs"
import path from "path"

import main from "../lib/main"

const pugFile = path.resolve(__dirname, "./fixtures/index.pug")
const compiledFile = path.resolve(__dirname, "./fixtures/build/index.html")
const expectedFile = path.resolve(__dirname, "./fixtures/build_ex/index.html")

const compileFileCommand = "pug-autocompile:compile-file"
const compileDirectCommand = "pug-autocompile:compile-direct"

const packageName = "pug-autocompile"

// eslint-disable-next-line max-lines-per-function
describe(`The package "${packageName}"`, () => {

    beforeEach(() => {
        waitsForPromise(() => atom.packages.activatePackage(packageName))
    })

    it("should be activated", () => {
        expect(atom.packages.isPackageActive(packageName)).toBe(true)
    })

    describe(`The Atom editor when the file "${pugFile}" is opened`, () => {

        let editor, editorView, compiled, expected

        beforeEach(() => {
            waitsForPromise(() => {
                return atom.workspace.open(pugFile).then((ed) => {
                    editor = ed
                    editorView = atom.views.getView(editor)
                })
            })
        })

        it(`should properly compile this file to HTML via command
            "${compileFileCommand}"`, () => {

            spyOn(main, "showSuccess")

            runs(() => {
                atom.commands.dispatch(editorView, compileFileCommand)
            })
            waitsFor(() => main.showSuccess.callCount > 0)
            runs(() => {
                compiled = fs.readFileSync(compiledFile, "utf8")
                expected = fs.readFileSync(expectedFile, "utf8")
                expect(compiled).toBe(expected)
            })
        })

        it(`should properly replace selected content with HTML via command
            "${compileDirectCommand}"`, () => {

            spyOn(main, "showSuccess")

            runs(() => {
                editor.selectAll()
                atom.commands.dispatch(editorView, compileDirectCommand)
            })
            waitsFor(() => main.showSuccess.callCount > 0)
            runs(() => {
                editor.selectAll()
                compiled = editor.getText()
                expected = fs.readFileSync(expectedFile, "utf8")
                expect(compiled).toBe(expected)
            })
        })
    })
})
