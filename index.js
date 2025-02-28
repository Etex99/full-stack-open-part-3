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

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(p => {
            if (p) {
                response.json(p)
            } else {
                response.status(404).send({ error: `could not find person by the id ${request.params.id}` })
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    console.log(body);

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number of person is missing'
        })
    }

    // Person with same name might be submitted if one instance submits and another has not reloaded the page.
    Person.findOne({ name: body.name })
        .then(result => {
            if (result !== null) {
                return response.status(400).json({ error: 'name of person must be unique' })

            } else {
                const newPerson = new Person({
                    name: body.name,
                    number: body.number
                })
            
                newPerson.save()
                    .then(savedPerson => {
                        console.log(savedPerson);
                        response.json(savedPerson)
                    })
                    .catch(error => next(error))
            }
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
}
  
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})