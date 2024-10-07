import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import db from './db.json';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(fileUpload());
const staticPath = path.join(__dirname); // = /Users/student/Documents/aa
app.use(express.static(staticPath));

app.get('/contacts', (req, res) => {

    const obj = fs.readFileSync('./db.json', 'utf8');
    const parsedObj = JSON.parse(obj);
    const contacts = parsedObj.contacts;

    console.log(contacts);
    res.send(contacts);
});

app.post('/contacts', (req, res) => {

    let uploadPath;
    const UIID = new Date();

    db.contacts = db.contacts || [];
    db.idTracker = db.idTracker + 1 || 0;

    const image = req.files.image;
    const imageURL = `http://localhost:3000/images/${image.name}`;
    const newUser = { ...req.body, image: imageURL };

    uploadPath = __dirname + '/images/' + UIID;

    db.contacts.push({ ...newUser, id: db.idTracker });

    image.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send('Error ', err);
        };
    });

    res.send(newUser);
    console.log(imageURL);

    fs.writeFile('./db.json', JSON.stringify(db, null, 2), (err) => {

        if (err) {
            console.error('ERROR!123 ', err);
            return;
        };

        console.log('req recieved');
    });
});

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

app.delete('/contacts/:id', (req, res) => {

    console.log(__dirname);

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