const express = require("express")
const db = require("better-sqlite3")("myApp.db")
db.pragma("journal_mode = WAL")

//database set up here
const createTables = db.transaction(() => {
    db.prepare(
        `
        CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uName STRING NOT NULL UNIQUE,
        message STRING NOT NULL
        )
        `
    ).run()
})

createTables()

//database setup ends here

const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))

app.use(function (req, res, next) {
    res.locals.errors = []
    next()
})

app.get("/", (req, res) => {
    res.render("homepage")
})

app.get("/submit", (req, res) => {
    res.render("submit")
})

app.post("/register", (req, res) => {
    const errors = []

    if (typeof req.body.uName !== "string") req.body.uName = ""
    if (typeof req.body.message !== "string") req.body.message = ""

    req.body.uName = req.body.uName.trim()

    if (!req.body.uName) errors.push("Enter a name.")
    if (req.body.uName && req.body.uName.length < 2) errors.push("Name must be at least 2 characters.")
    if (req.body.uName && req.body.uName.length > 20) errors.push("Name cannot exceed 10 characters.")
    if (req.body.uName && !req.body.uName.match(/^[a-zA-Z0-9]+$/)) errors.push("Name can only contain letters.")
    
    if (req.body.message && req.body.message.length < 2) errors.push("Please enter at least 2 characters.")
    
    if (errors.length){
        return res.render("homepage", { errors})
    }
    // save the new user into a database
    const ourStatement = db.prepare("INSERT INTO user (uName, message) VALUES (?, ?)")
    ourStatement.run(req.body.uName, req.body.message)

    //log the user in by giving them a cookie
    res.send("Thank you!!")
})
app.listen(3000)    