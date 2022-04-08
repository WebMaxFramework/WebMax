const chalk = require("chalk")

const newRegexMatching = /\@(webmax)\([ !"#$%&\'()*+,-./0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~]+(\);)/g
const oldRegexMatching = /\@(webmax)\([\w\W\d\D\s\S]+\);/g

module.exports = function(content, id, self, session, req) {
    return content.split("&gt;").join(">").replace(newRegexMatching, (x, y) => {
        let realContent = x.replace('@webmax', '').replace("&gt;", ">")

        let res = ""

        try {
            res = eval(realContent)(self, session, req)
        } catch(err) {
            self.error("An unexpected error occurred while evaluating the following code: \n" + chalk.gray(realContent) + "\nError: " + chalk.red(err) + '\n')
        }

        return res || ""
    })
}