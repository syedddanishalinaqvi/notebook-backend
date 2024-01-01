const express = require('express');
const Note = require('../models/Note');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

//ROUTE 1: GET all notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    const note = await Note.find({ user: req.user.id });
    res.json(note);
})
//Route 2: Add notes using POST
router.post('/addnote', fetchuser,
    body('title', 'Enter a valid Title').isLength({ min: 5 }),
    body('description', 'Enter a valid Description').isLength({ min: 5 }), async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const notes = new Note({
                title, description, tag, user: req.user.id,
            })
            const savedNote = await notes.save();
            res.json(savedNote);
        } catch (errors) {
            console.error(errors.message);
            res.status(500).send("Internal Server Error");
        }
    })
//ROUTE 3: Update Note using PUT
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const errors = validationResult(req);
    try {
        const { title, description, tag } = req.body;
        //Create new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        //Find the node to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not Allowed")
        }
        note = await Note.findOneAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    }
    catch {
        console.error(errors.message);
        res.status(500).send("Internal Server Error");

    }
})
//ROUTE 4: Deleteing element using POST
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const errors = validationResult(req);
    try {
        let deleteNote = await Note.findById(req.params.id);
        if (!deleteNote) {
            return res.status(404).send("Not Found");
        }
        if (deleteNote.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        deleteNote = await Note.findOneAndDelete(req.params.id);
        res.json("Note has been Deleted");
    }
    catch {
        console.error(errors.message);
        res.status(500).send("Internal Server Error");

    }
})

module.exports = router