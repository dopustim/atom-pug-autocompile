"use babel"

import fs from "fs"
import path from "path"

import PugAutocompile from "../lib/pug-autocompile"

const atom = global.atom

const path2Pug = path.resolve(__dirname, "../test/index.pug")
const path2Html = path.resolve(__dirname, "../test/build/index.html")
const path2HtmlEx = path.resolve(__dirname, "../test/build_ex/index.html")

const compileFileCommand = "pug-autocompile:compile-file"
const compileDirectCommand = "pug-autocompile:compile-direct"

// eslint-disable-next-line max-lines-per-function
describe("Package \"pug-autocompile\"", () => {

    beforeEach(() => {
        waitsForPromise(() => {
            return atom.packages.activatePackage("pug-autocompile")
        })
    })

    it("should be activated", () => {
        expect(atom.packages.isPackageActive("pug-autocompile")).toBe(true)
    })

    // eslint-disable-next-line max-lines-per-function
    describe("File \"index.pug\"", () => {

        let editor, editorElement, compiled, expected

        beforeEach(() => {
            waitsForPromise(() => {
                return atom.workspace.open(path2Pug).then((ed) => {
                    editor = ed
                    editorElement = atom.views.getView(editor)
                })
            })
        })

        it("should be opened", () => {
            expect(PugAutocompile.isPugFile(editor.getPath())).toBe(true)
        })

        it("should be properly compiled to \"index.html\" via command \"compile-file\"", () => {

            spyOn(PugAutocompile, "showSuccess")

            runs(() => {
                atom.commands.dispatch(editorElement, compileFileCommand)
            })

            waitsFor(() => {
                return PugAutocompile.showSuccess.callCount > 0
            })

            runs(() => {
                compiled = fs.readFileSync(path2Html, "utf8")
                expected = fs.readFileSync(path2HtmlEx, "utf8")
                expect(compiled).toBe(expected)
            })
        })

        describe("All selected content\"", () => {

            it("should be properly replaced with HTML via command \"compile-direct\"", () => {

                spyOn(PugAutocompile, "showSuccess")

                runs(() => {
                    editor.selectAll()
                    atom.commands.dispatch(editorElement, compileDirectCommand)
                })

                waitsFor(() => {
                    return PugAutocompile.showSuccess.callCount > 0
                })

                runs(() => {
                    editor.selectAll()
                    compiled = editor.getText()
                    expected = fs.readFileSync(path2HtmlEx, "utf8")
                    expect(compiled).toBe(expected)
                })
            })
        })
    })
})
