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
- Built-in PARTIAL WEBSITE RENDERING
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

12. Partial website rendering + What it is + Why it's sooo good
So, this is one of biggest advantagements of webmax.
The "Partial rendering" is simple mechanism, basiclly your website is cutted into parts (sections) (you cut your code via wm:section attribute).
Each "section" will be saved in server memory. At start when user enter the website only first section will be shown him. When this section will be "rendered" then webmax will say to server "Hey, I've rendered first section" and server will response him "Okay, here you are" and give him second section etc.

Why this is SOOOOO Good?
Imagine this situation:
You're x years old young human living in some country, and you're checking in wikipedia an article about c++ programming.
You're internet connection is 0.5 KB per second & the wikipedia article weight is 10 MB.
Normally this website will show up you after 2048 * 10 (20480 seconds / 5.6H).
You won't be happy.
But if this website would been cutted into 1000 sections (each describing other syntax or function etc), then this website will render in your browser in 20480 / 1000 = 2.048s, but only 1 section. Probably this section contains 10000000 / 1000 characters so 10k characters, of course most of this would be a HTML tags, and if programmer is shitty also css in style attributes. But for example per this 10k characters there will be 100 words, after you read this webmax will download from server for example 15 more articles. I mean when you enter website the content at the bottom isn't most important for you. You firslly look at topbar & landing page. After that you're scrolling down. So webmax firstlly giving you topbar & lading page, after that other "less important" things. Hope you understood.

You can disable partial rendering in application config.

Partial rendering Mechanism:
+ Client enter website
+ Server gives (him/her other) head with all meta etc & body with all contents without sections (only 1st section).
+ Client gives server information that he got the html and rendered it.
+ Server gives another section
+ Client renders it 
+ ...
+ Server says "Whoaaaa, That's all sections I've got"
+ Website is complete, but before that user could see it.

Of course, biggest advantagements of this are:
+ 1. Your boss when entering lighthouse and checking performance will be cheated, and he will think "I've got amazing developer, who knows how to optimalize website"
+ 2. You'll get respect from teamworkers for best optimalization of website.
+ 3. Other advantagements which aren't included in this description

Syntax:
You need to add some container in which the sections will be placed an attribute "wm:sectionsContainer".
Of course, first section will be rendered there where it's primary was.
Other sections even if were in other containers for example .super-div will be placed inside the element with wm:sectionsContainer attribute.
To declare section add to element attribute "wm:section".

Examples:
```html
<body wm:sectionsContainer>
    <section wm:section>
        <header>
            <h1>Partial website rendering section 1</h1> 
        </header>
        <p>High weight content...</p>
    </section>

    <section wm:section>
        <header>
            <h1>Partial website rendering section 2</h1> 
        </header>
        <p>Random 100MB of informations</p>
    </section>
</body>
```

Warnings:
+ SECTIONS CANNOT BE GENERATED BY FRONTEND
+ SECTIONS CANNOT BE GENERATED VIA @webmax(callback) SYNTAX
+ YOU SHOULDN'T CREATE SECTION INSIDE SECTION (probably this will create somekind of ultimate bug (I don't tested it.))

13. That's all now