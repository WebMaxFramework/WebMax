class Model {
    setDatabase(db) {
        this.database = db
    }

    all() {
        return this.database.awaitQuery(`SELECT * FROM ${this.tableName}`)
    }

    find(id) {
        return this.database.awaitQuery(`SELECT * FROM ${this.tableName} WHERE id = ${id}`)
    }

    getWhere(x, y) {
        return this.database.awaitQuery(`SELECT * FROM ${this.tableName} WHERE ${x} = '${y}'`)
    }

    getWhereLike(x, y) {
        return this.database.awaitQuery(`SELECT * FROM ${this.tableName} WHERE ${x} LIKE '%${y}%'`)
    }

    add(values) {
        const req = `INSERT INTO ${this.tableName} VALUES (${values.map((x, y) => {
            return `'${x}'`
        })})`

        return this.database.awaitQuery(req)
    }

    deleteById(id) {
        return this.database.awaitQuery(`DELETE FROM ${this.tableName} WHERE id = ${id} `)
    }

    deleteWhere(x, y) {
        return this.database.awaitQuery(`DELETE FROM ${this.tableName} WHERE ${x} = '${y}' `)
    }

    truncate() {
        return this.database.awaitQuery(`TRUNCATE TABLE ${this.tableName}`)
    }

    update(id, values) {
        let request = `UPDATE ${this.tableName} SET `

        for(let [a,b] of Object.entries(values)) {
            request += `${a} = '${b}',`
        }

        request = request.slice(0, -1)
        request += ` WHERE id = ${id}`

        return this.database.awaitQuery(request)
    }

    blocked = []
}

class Table {
    constructor(name, contains) {
        this.name = name
        this.contains = contains
        //this.createTable = createTable
    }

    createTable(db) {
        let query = `CREATE TABLE IF NOT EXISTS ${this.name} (`
        
        for(let [a,b,c ] of Object.entries(this.contains)) {
            query += ` ${a} ${b.type}${b.isPrimary ? " PRIMARY KEY" : ""}${b.isAutoIncrement ? " AUTO_INCREMENT" : ""}${b.isNotNull ? " NOT NULL" : ""},`
        }
    
        query = query.slice(0, query.length - 1)
        query += ");"
    
        db.query(query)
    }
}

class Type {
    primary() {
        this.isPrimary = true
        return this
    }

    autoIncrement() {
        this.isAutoIncrement = true
        return this
    }

    notNull() {
        this.isNotNull = true
        return this
    }
}

class Int extends Type {
    constructor(...args) {
        super()
        this.type = 'int'
    }
}

class String extends Type {
    constructor(...args) {
        super()
        this.type = 'text'
    }
}

class Date extends Type {
    constructor(...args) {
        super()
        this.type = 'date'
    }
}

module.exports = {
    Model,
    Table,
    Int,
    String,
    Date
}