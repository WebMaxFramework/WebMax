module.exports = {
    name: "Code",
    render(element) {
        return `<div component-root contenteditable>
            ${element.getAttribute("code")}
        </div>`
    }
}