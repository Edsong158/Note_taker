const express = require('express')
const path = require('path')
const fs = require('fs')
const { v4 } = require('uuid')

const PORT = 3330 // server will run on port 3330

const app = express() // sets name to app
// set the home to public
app.use(express.static('./public'))
// allow the app to get and use json
app.use(express.json())

// function to get the notes
async function getNotes() {
    const notesArr = await fs.promises.readFile('./db/db.json', 'utf8') || "[]"

    // returns the notes array
    return notesArr
}

// function to save the notes to json

async function saveNotes(notesArr) {
    // write the notes to the database json file
    fs.promises.writeFile('./db/db.json', JSON.stringify(notesArr, null, 2), 'utf-8')
}


// GET /notes returns the notes.html file
app.get('/notes', (requestObj, responseObj) => {
    responseObj.sendFile(path.join(__dirname, './public/notes.html'))
})


//GET /api/notes reads the db.json file and returns the saved notes AS JSON
app.get('/api/notes', async (requestObj, responseObj) => {
    //get the  current notes
    const notesArr = await getNotes()

    // return notes array
    responseObj.send(notesArr)
})


// POST /api/notes receives new note from the request body, adds it to db.json, then returns the new note to the client. Gives each note a unique ID
app.post('/api/notes', async (requestObj, responseObj) => {
    // select the new note out of the request object
    const newNote = requestObj.body
    // get current notes
    const notesArr = JSON.parse(await getNotes())

    // add an id to the note
    newNote.id = v4()
    // append notes array with new note
    notesArr.push(newNote)

    // save the notes array
    await saveNotes(notesArr)

    // return new note
    responseObj.send(newNote)
})

// DELETE /api/notes/:id finds a note with the given id, removes it from the notes array, and then saves the new notes array
app.delete('/api/notes/:id', async (requestObj, responseObj) => {
    // get current notes
    const notesArr = JSON.parse(await getNotes())
    // save id from request object
    const noteID = requestObj.params.id
    // find the note that matches the parameter id
    // and filter it out
    const newNotesArr = notesArr.filter((noteEl) => noteEl.id !== noteID)

    // save the new notes array
    await saveNotes(newNotesArr)

    responseObj.send({
        message: "Note deleted successfully"
    })
})

// TODO:: GET * should return the index.html file
app.get('*', (requestObj, responseObj) => {
    responseObj.sendFile(path.join(__dirname, './public/index.html'))
})


// listen on the port for the sounds of the universe
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})