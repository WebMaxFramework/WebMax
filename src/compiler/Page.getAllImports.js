module.exports = function(content) {
    let imports = []

    content.match(/\#include \"[ !"#$%&\'()*+,-./0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~]+\" as \"[ !"#$%&\'()*+,-./0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~]+\"(;)/g).forEach(include => {
        const module = include.replace("#include ", "").replace(";", "").split("as")[0].replace(/ /g, "").replace(/"/g, "")
        imports.push({
            name: module,
            type: include.split("as")[1].replace(";", "").replace(/ /g, '').replace(/"/g, '')
        })
    })

    return imports
}