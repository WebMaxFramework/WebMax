/**
 * This file is to configure the application.
 * We don't use plain JSON files for configuration,
 * because via JavaScript you can use other dependencies/liblaries to configure the application.
 * 
 */

module.exports = function (path /* The path is path for source code of webmax */) {
    return {
        "name": "Your-Application-Name",
        "version": "1.0.0",
        "port": "3000",
        "path": path,
        "allowWebMaxMessages": true,
        "lang": "en",
        "textDir": "ltr",
        "joinAllCSSFiles": true,
        "mysql": {
            "host": "localhost",
            "user": "root",
            "password": "",
            "databaseName": "webmax-test-app"
        }
    }
}