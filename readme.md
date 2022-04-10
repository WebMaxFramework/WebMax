# Another Static Site Generator
Webmax is another static site generator.
The only one framework where you can synchronise your backend & frontend code

# Is this a framework?
- Yes of course

# Advantagements:
- FRONTEND & BACKEND CODE SYNCRONISED
- Flexibility
- Lightweight
- Fast
- Easy routing
- Easy API Creating
- Easy Models/Controllers
- MySQL Databases
- 0 Clear SQL, Everything using built-in methods
- Easier table creating
- Static webpages
- Static components
- Easy syntax
- TailwindCSS & PostCSS integration

# How does FRONTEND & BACKEND CODE SYNC WORKS
You can execute code at backend from your frontend and your website clients cannot do that, because only code (callback) declared by you could be EXECUTED AT BACKEND! 

# Documentation

1. Folders
cached/
components/
controllers/
less/
models/
modules/
pages/
public/
router/
scss/
vue/
postcss/

2. SCSS/SASS/LESS Compiling
Every style inside folders:
 + scss/
 + less/

Will be compiled into &lt;STYLE_NAME.LANG_NAME.css&gt; and placed in public/css

3. CSS Mixing
Every style inside public/css folder will be compressed to style.all.min.css

4. Vue Folder
File vue/app.js will be compiled using webpack (laravel-mix) via vue.
The "dist" file is public/js/app.js

5. Components
Components in webmax is defined like this:
``` js
module.exports = {
    name: "Code",
    render(element) {
        return `<div component-root>
            YOUR COMPONENT CONTENT
        </div>`
    }
}
```

6. Pages
WebMax Page file should have <strong>.webmax</strong> extension. It has HTML Syntax extended with these changes: 
+ Including Components inside webmax Page
```
#include "components/YOUR_COMPONENT_FILE" as "Component";
```

+ Staticly serving data inside .webmax file
``` js
Your name is @webmax((webmax, session, request) => {
    return request.params.page || "No name"
});
```

7. Routing
Inside router/router.js inside array pages add Object like this:
```js
{
    path: "/YOUR_PAGE_PATH",
    file: "/pages/YOUR_PAGE_FILE.webmax",
    name: "YOUR_PAGE_NAME"
}
```

8. Creating API
Inside router/router.js inside api array every object will be an API Page.
Object should be like:
```js
{
    path: "/YOUR/API/PATH",
    method: "METHOD",
    name: "SOME_UNIQUE_NAME",
    callback: require("../controllers/SomeController").someMethod // Callback
}
```

This will bring your api route to [YOUR_METHOD] /api/YOUR/API/PATH

9. Controllers
To create controller create some file inside controllers folder, for example: SomeController.js
Which content will be like this:
```js
const controller = {
    index(req, webmax) {
        return webmax.models.YOUR_MODEL.MODEL_METHOD //.UserModel.all()
    }
}

module.exports = controller
```

10. Models
To create model create file inside models folder, for example: UserController.js
Which content will be like this:
```js
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
```

And it's all. webmaxDatabase.Model provides all methods.
All these methods are:
+ all()
+ find(id)
+ getWhere(x, y)
+ getWhereLike(x, y)
+ add(array)
+ deleteById(id) 
+ deleteWhere(x, y)

11. FrontEnd & BackEnd code synchronising
So basiclly this code will do that:
``` js
@webmax((webmax, session, request) => {
    const syncId = require("uuid").v4()

    const serverCallback = () => console.log("Hello")

    const sync = session.createServerSync(syncId, serverCallback, (syncId) => {
        const btn = window.webmax.getElementByClassNameExtended("btn:sayHello")
        btn?.addEventListener("click", () => {
            window.webmax.sync(syncId).exec()
        })
    })
    return sync
});
```

So, you need to generate some unique id to create sync.
Then you create server callback, the code which would be executed in backend. Only this code will be executed in backend, other callbacks/code will generate errors (this is for security reasons)

Then we create sync using session.createServerSync(syndId, serverCallback, frontendCallback)
and we returning the sync.

The frontend will run "frontendCallback" and push this sync to client webmax runtime.
When you'll call .exec() method on sync instance in your webmax runtime, server will run the serverCallback.
Easy!

12. That's all now