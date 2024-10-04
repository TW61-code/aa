import express from 'express';
import cors from 'cors';
import db from './db.json';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());
app.use(fileUpload());
app.use(cors());
const staticPath = path.join(__dirname);
app.use(express.static(staticPath));

//RECIEVE
app.get('/contacts', (req, res) => {

    const obj = fs.readFileSync('./db.json', 'utf8');
    const parsedObj = JSON.parse(obj);
    const contacts = parsedObj.contacts; //array of contacts;

    res.send(contacts); 

});

// CREATE
app.post('/contacts', (req, res) => {

    db.contacts = db.contacts || [];
    db.idTracker = db.idTracker + 1 || 0;

    const newUser = req.body;
    const image = req.files.image;
    const imageURL = 'http://localhost:3000/images/' + image.name;
    const uploadPath = __dirname + '/images/' + image.name;

    db.contacts.push({ ...newUser, id: db.idTracker, image: imageURL });

    fs.writeFile('./db.json', JSON.stringify(db, null, 2), (err) => {

        if (err) {
            console.error(err);
            return;
        };
    });

    image.mv(uploadPath, (err) => {

        if (err) {
            return res.status(500).send(err);
        };
    });

    res.send(newUser);
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