import express from 'express';
import cors from 'cors';
import db from './db.json';
import fs from 'fs';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

//RECIEVE
app.get('/contacts', (req, res) => {

    const obj = fs.readFileSync('./db.json', 'utf8');
    const parsedObj = JSON.parse(obj);
    const contacts = parsedObj.contacts; //array of contacts;

    res.send(contacts);

});

// app.get('/contacts', (req, res) => {
//     res.send(db.contacts);
// });

// CREATE
app.post('/contacts', (req, res) => {
    db.contacts = db.contacts || [];
    db.idTracker = db.idTracker + 1 || 0;

    const newUser = req.body;
    db.contacts.push({ ...newUser, id: db.idTracker });

    fs.writeFile('./db.json', JSON.stringify(db, null, 2), (err) => {

        if (err) {
            console.error(err);
            return;
        };

        res.send(db.contacts);
        console.log('req recieved');

    });

});

//UPDATE
app.put('/contacts/:id', (req, res) => {

    const userId = req.params.id;

    const mappedContacts = db.contacts.map(user => {
        
        if (user.id === parseInt(userId)) {
            const updatedUser = { ...user, ...req.body};
            return updatedUser;
        };

        return user;

    });

    db.contacts = mappedContacts;

    fs.writeFile('./db.json', JSON.stringify(db, null, 2), (err) => {
        res.send(db.contacts);
    });



});

//DELETE
app.delete('/contacts/:id', (req, res) => {

    const contactId = req.params.id;

    const deleteContact = db.contacts.filter(contact => contact.id !== parseInt(contactId));
    db.contacts = deleteContact;

    fs.writeFile('./db.json', JSON.stringify(db, null, 2), (err) => {
        res.send(db.contacts);
    });

});

app.listen(port, () => {
    console.log(`Listening at localhost:${port}`);
});