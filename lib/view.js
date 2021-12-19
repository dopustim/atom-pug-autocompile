"use babel"

/**
 * View Class
 */
export default class {

    /**
     * Create View element
     */
    constructor() {
        this.timeoutID
        this.element = document.createElement("a")
        this.element.classList.add("pug-autocompile", "inline-block")
        this.hide()
    }

    /**
     * Show message with Success status
     */
    showSuccess(timeout) {
        this.element.innerHTML = "<span class=\"text-success icon icon-check\">Created!</span>"
        this.show()
        if (this.timeoutID) clearTimeout(this.timeoutID)
        this.timeoutID = setTimeout(() => {
            this.hide()
        }, 1000 * parseInt(timeout))
    }

    /**
     * Show message with Error status
     */
    showError(timeout) {
        this.element.innerHTML = "<span class=\"text-error icon icon-x\">Error!</span>"
        this.show()
        if (this.timeoutID) clearTimeout(this.timeoutID)
        this.timeoutID = setTimeout(() => {
            this.hide()
        }, 1000 * parseInt(timeout))
    }

    /**
     * Show View element
     */
    show() {
        this.element.style.display = "inline-block"
    }

    /**
     * Hide View element
     */
    hide() {
        this.element.style.display = "none"
    }

    /**
     * Tear down any state and detach
     */
    destroy() {
        this.element.remove()
    }

    /**
     * Return View element
     */
    getElement() {
        return this.element
    }
}
