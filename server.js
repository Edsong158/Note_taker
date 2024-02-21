const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const PORT = 3330;
const app = express();

app.use(express.static('./public'));
app.use(express.json());

async function getNotes() {
    try {
        const notesData = await fs.readFile('./db/db.json', 'utf8');
        return JSON.parse(notesData) || [];
    } catch (error) {
        console.error('Error reading notes:', error);
        throw error;
    }
}

async function saveNotes(notesArr) {
    try {
        await fs.writeFile('./db/db.json', JSON.stringify(notesArr, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving notes:', error);
        throw error;
    }
}

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/api/notes', async (req, res) => {
    try {
        const notesArr = await getNotes();
        res.send(notesArr);
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve notes' });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const newNote = req.body;
        if (!newNote || typeof newNote !== 'object') {
            return res.status(400).send({ error: 'Invalid note data' });
        }
        newNote.id = uuidv4();
        const notesArr = await getNotes();
        notesArr.push(newNote);
        await saveNotes(notesArr);
        res.status(201).send(newNote);
    } catch (error) {
        res.status(500).send({ error: 'Failed to add note' });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const notesArr = await getNotes();
        const noteID = req.params.id;
        const newNotesArr = notesArr.filter((noteEl) => noteEl.id !== noteID);
        await saveNotes(newNotesArr);
        res.send({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete note' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
