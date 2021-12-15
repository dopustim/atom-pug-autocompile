"use babel"

/**
 * Configuration Object
 */
export default {

    displayNotifications: {
        title: "Display Notifications",
        description: "Enable this if you want to check rendered file on success.",
        type: "boolean",
        default: true,
        order: 0
    },
    compileOnSave: {
        title: "Enable Compile on Save",
        description: "Disable this if you want to compile manualy from the menu only.",
        type: "boolean",
        default: false,
        order: 1
    },
    statusTimeout: {
        title: "StatusBar Message Timeout",
        description: "Timeout before the status bar message disappears (seconds).",
        type: "integer",
        default: 6,
        enum: [ 2, 4, 6, 8 ],
        order: 2
    },
    indentSize: {
        title: "HTML Indent Size",
        description: "The number of whitespace in Pretty mode.",
        type: "integer",
        default: 4,
        enum: [ 2, 4 ],
        order: 3
    }
}
