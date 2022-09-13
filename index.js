const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const {
    createUser,
    addExercise,
    getLog,
    getUsers
} = require("./api.js")

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Get all users
app.get("/api/users", async(req, res) => {
    const u = await getUsers()

    res.json(u)
})

// Create a new user 
app.post("/api/users", async (req, res) => {
    const userData = req.body
    const {id, username} = await createUser(userData.username) 

    res.json({username: username, _id: id})
})

// Add exercise
app.post("/api/users/:id/exercises", async(req, res) => {
    const id = req.params.id
    const {description, duration, date} = req.body

    const u = await addExercise(id, description, duration, date)
    const {username, date: d} = u
 
    res.json({
        _id: id,
        username: username,
        date: d,
        duration: +duration,
        description: description
    })
})

// Get user log
app.get("/api/users/:id/logs", async(req, res, next) => {
    let u = await getLog(req.params.id, req.query)

    // Convert u from mongoose object to json
    let json_u = JSON.parse(JSON.stringify(u))
    
    // Convert dates to the right format
    json_u.log = await json_u.log.map((log) => {
        let d = new Date(log.date)
        log.date = d.toDateString()
        return log
    })
    await console.log(json_u)
    res.json(json_u)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
