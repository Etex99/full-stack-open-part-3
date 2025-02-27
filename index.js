require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
}))

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        response.send(`<p>Phonebook has info for ${people.length} people.</p><p>${Date().toString()}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(p => {
            if (p) {
                response.json(p)
            } else {
                response.status(404).send({ error: `Could not find person by the id: ${request.params.id}` })
            }
        })
        .catch(error => {
            console.log(error.message);
            response.status(500).end()
        })
})

/*
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})
*/

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body);

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number of person is missing'
        })
    }

    /*
    TODO: disallow duplicate names
    return response.status(400).json({
            error: 'name of person must be unique'
    })
    */

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save()
        .then(savedPerson => {
            console.log(savedPerson);
            response.json(savedPerson)
        })
        .catch(error => {
            console.log(error.message);
            response.status(500).end()
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})