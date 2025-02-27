const mongoose = require('mongoose')

const invalidArgs = () => {
    console.log('Invalid args.')
    console.log('Args to list all phonebook entries: <mongo user password>');
    console.log('Args to add new phonebook entry: <mongo user password> <name> <number>');
    process.exit(1)
}

if (process.argv.length < 3) invalidArgs()

const password = process.argv[2]
const url = `mongodb+srv://emma99kem:${password}@testing.ti66i.mongodb.net/?retryWrites=true&w=majority&appName=Testing`

mongoose.set('strictQuery', false)
mongoose.connect(url).catch(error => {
    console.log(error)
    process.exit(1)
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
const Person = mongoose.model('Person', personSchema)

switch (process.argv.length) {
    case 3:
        Person.find({}).then(result => {
            result.forEach(p => {
                console.log(p)
            })
            mongoose.connection.close()
        })
        break;
    case 5:
        new Person({
            name: process.argv[3],
            number: process.argv[4],
        })
            .save()
            .then(result => {
                console.log(`Added ${result.name} number ${result.number} to the phonebook.`)
                mongoose.connection.close()
            })
        break;
    default:
        mongoose.connection.close()
        invalidArgs()
        break;
}