'use babel';

export default class PugAutocompileView {

    constructor() {
        // Timeout id
        this.timeoutID;
        // Main element
        this.element = document.createElement('a');
        this.element.classList.add('pug-autocompile', 'inline-block');
        // Hide
        this.hide();
    }

    showSuccess(timeout) {
        // Add message
        this.element.innerHTML = '<span class="text-success icon icon-check">Created!</span>';
        // Show
        this.show();
        // Hide
        if (this.timeoutID) clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => {
            this.hide();
        }, 1000 * parseInt(timeout));
    }

    showError(timeout) {
        // Add message
        this.element.innerHTML = '<span class="text-error icon icon-x">Error!</span>';
        // Show
        this.show();
        // Hide
        if (this.timeoutID) clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => {
            this.hide();
        }, 1000 * parseInt(timeout));
    }

    show() {
        this.element.style.display = 'inline-block';
    }

    hide() {
        this.element.style.display = 'none';
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }

}
