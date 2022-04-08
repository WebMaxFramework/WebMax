module.exports = {
    name: "HelloWorld",
    render(element) {
        return `<div component-root>
            <h1>Hello, ${element.getAttribute("name") || "world"}!</h1>
        </div>`
    }
}