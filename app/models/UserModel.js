/**
 * Default User Model
 * returns a UserModel class which is a extended webmaxDatabase.Model class
 * Provides easy way to access database
 * 
 */

const path = require("path")

module.exports = function createModel(config) {
    const webmaxDatabase = require(path.resolve(`${config.path}/index.js`)).databaseUtils

    class UserModel extends webmaxDatabase.Model {
        constructor() {
            super()
        }

        createTableIfNotExists() {
            return new webmaxDatabase.Table("users", {
                id: (new webmaxDatabase.Int()).primary().autoIncrement(),
                name: new webmaxDatabase.String(),
                email: new webmaxDatabase.String(),
                password: new webmaxDatabase.String(),
            })
        }
    }

    return UserModel
}