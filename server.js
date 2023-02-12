import express from 'express'
import bcrypt from 'bcrypt'
import cors from 'cors'
import knex from 'knex'

const postgres = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 3000,
        user: 'postgres',
        password: '123',
        database: 'smart-brain'
    }
});

console.log(postgres.select('*').from('users'));

const app = express()

app.use(express.json())
app.use(cors())

const database = {
    users: [
        {
            id: '1',
            username: 'john123',
            password: '123123',
            entries: 0,
            joined: new Date()
        },
        {
            id: '2',
            username: 'sally123',
            password: '123123',
            entries: 0,
            joined: new Date()
        },
        {
            id: '3',
            username: 'beck123',
            password: '123123',
            entries: 0,
            joined: new Date()
        },
    ],
    login: [
        {
            id: '567',
            hash: '',
            username: 'john123'
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users)
})

app.post('/signin', (req, res) => {
    // bcrypt.compare(req.body.password, hash, function (err, result) {
    //     // result == true
    // });
    if (req.body.username === database.users[0].username && req.body.password === database.users[0].password) {
        res.json(database.users[0])
    } else {
        res.status(400).json('error sign in')
    }
})

app.post('/register', (req, res) => {
    const { username, password } = req.body
    // bcrypt.hash(password, 10, function (err, hash) {
    //     // password = hash
    // });
    database.users.push({
        id: '4',
        username,
        entries: 0,
        joined: new Date()
    })
    res.send(database.users[database.users.length - 1])
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params
    let found = false
    database.users.forEach(user => {
        if (user.id === id) {
            found = true
            return res.json(user)
        }
    })
    if (!found) {
        res.status(400).json('no such user')
    }
})

app.put('/image', (req, res) => {
    const { id } = req.body
    let found = false
    database.users.forEach(user => {
        if (user.id === id) {
            found = true
            user.entries++
            return res.json(user.entries)
        }
    })
    if (!found) {
        res.status(400).json('no such user')
    }
})

app.listen(3000, () => {
    console.log('running on port 3000');
})