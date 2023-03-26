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
    //     // result == true
    // });
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            } else{
                res.status(400).json('wrong credentials')
            }
        }).catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body
    const hashPassword = bcrypt.hashSync(password, 10);
    db.transaction(trx => {
        trx.insert({
            hash: hashPassword,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                console.log(loginEmail[0].email, name);
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        entries:0,
                        joined: new Date()
                    })
                    .then(
                        user => res.json(user[0])
                    )
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params
    db.select('*')
        .from('users')
        .where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not found')
            }
        }
        )
})

app.put('/image', (req, res) => {
    const { id } = req.body
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => res.json(entries[0].entries))
        .catch(err => res.status(400).json("Unable to get entries"))
})

app.listen(3000, () => {
    console.log('running on port 3000');
})