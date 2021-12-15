"use babel"

/**
 * View Class
 */
export default class {

    /**
     * Create View element
     */
    constructor() {
        // Timeout id
        this.timeoutID
        // Main element
        this.element = document.createElement("a")
        this.element.classList.add("pug-autocompile", "inline-block")
        // Hide
        this.hide()
    }

    /**
     * Show message with Success status
     */
    showSuccess(timeout) {
        // Add message
        this.element.innerHTML = "<span class=\"text-success icon icon-check\">Created!</span>"
        // Show
        this.show()
        // Hide
        if (this.timeoutID) clearTimeout(this.timeoutID)
        this.timeoutID = setTimeout(() => {
            this.hide()
        }, 1000 * parseInt(timeout))
    }

    /**
     * Show message with Error status
     */
    showError(timeout) {
        // Add message
        this.element.innerHTML = "<span class=\"text-error icon icon-x\">Error!</span>"
        // Show
        this.show()
        // Hide
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
     * Return an object that can be retrieved when package is activated
     */
    serialize() {}

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
