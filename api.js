const mongoose = require("mongoose")
const { Schema, model } = mongoose

mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

// Log Schema
const logSchema = new Schema({
    username: String,
    count: {
        type: Number,
        default: 0
    },
    log: [{
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: () => {
                let d = new Date()
                return d.toDateString()
            }
        }
    }]
})


const Log = model("Log", logSchema)


async function createUser(username) {
    const u = new Log()
    u.username = username
    await u.save()
    return {id: u._id, username: username}
}

async function addExercise(id, description, duration, date) {
    const u = await Log.findOne({_id: id})
    let d
    if (!date) {
        d =  new Date()
        d = d.toDateString()
    } else {
        d = new Date(date)
        d = d.toDateString()
    }
    
    // Add data to the log
    u.log.push({
        description: description,
        duration: duration,
        date: d
    })
    
    // Increment the count
    u.count += 1

    // Save changes
    await u.save()

    return {username: u.username, date: d}
    
}

async function getUsers() {
    const u = await Log.find({}, {username: 1, _id: 1})
    return u
}
                    
async function getLog(id, url_query) {
    const { from, to, limit } = url_query
    let query = {
        _id: id
    }

    if (from || to) {
        query.log = {
            $elemMatch: {
                date: {
                    
                }
            }
        }
        let date =  query.log.$elemMatch.date;
        (from) ? (date.$gte = new Date(from).toISOString()) : "";
        (to) ? (date.$lte = new Date(to).toISOString()) : "";
    }
    
    let u = await Log.findOne(query, {__v: 0, "log._id": 0})

    if (limit) {
        u = await Log.findOne(query, {__v: 0, log: { $slice: +limit}})
    }
    
    return u
}



module.exports =  {
    createUser,
    addExercise,
    getLog,
    getUsers
}
