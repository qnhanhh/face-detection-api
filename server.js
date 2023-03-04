import express from 'express'
import bcrypt from 'bcrypt'
import cors from 'cors'
import knex from 'knex'

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: '123',
        database: 'smart-brain'
    }
});

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
    const { email, name, password } = req.body
    // bcrypt.hash(password, 10, function (err, hash) {
    //     // password = hash
    // });
    db('users')
        .returning('*')
        .insert({
            email: email,
            name: name,
            joined: new Date()
        }).then(
            user => res.json(user[0])
        ).catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params
    db.select('*')
        .from('users')
        .where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            }else{
                res.status(400).json('Not found')
            }
        }
        )
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