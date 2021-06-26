const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const app = express();

// Middleware

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static('views'));

// Route
const homeRoute = require('./routes/Homepage');
const taskRoute = require('./routes/TasksRoute');
const scheduleRoute = require('./routes/Schedule');

// Mongo URI
const mongoURI =
    'mongodb+srv://Hz:Hzawn@cluster.3q15y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true });

// Init grfs
let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                };
                resolve(fileInfo);
            });
        });
    },
});
const upload = multer({ storage });

// Use Route
app.use(homeRoute);
app.use(taskRoute);
app.use(scheduleRoute);

// @route GET /
// @desc Loads form
app.get('/Project', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            res.render('Project/project', { files: false });
        } else {
            files.map((file) => {
                if (
                    file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png' ||
                    file.contentType === 'img/png'
                ) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });

            res.render('Project/project', { files: files });
        }
    });
});

// @route POST /upload
// @desc Uploads file to DB
app.post('/Project/upload', upload.single('file'), (req, res) => {
    // res.json({ file: req.file });
    res.redirect('/Project');
});

// @route GET /files
// @desc Display all files in JSON
app.get('/Project/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist',
            });
        }

        // Files exist
        return res.json(files);
    });
});

// @route GET /files/:filename
// @desc Display all files in JSON
app.get('/Project/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exist',
            });
        }

        // File exists
        return res.json(file);
    });
});

// @route GET /image/:filename
// @desc Display single file Object
app.get('/Project/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exist',
            });
        }

        // Check if image
        if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png' ||
            file.contentType === 'img/png'
        ) {
            //Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image',
            });
        }
    });
});

// @route DELETE /files/:id
// @desc Delete file
app.delete('/Project/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }

        res.redirect('/Project');
    });
});

const port = 5000;

app.listen(5000, () => {
    console.log(`Sever running on port ${port}`);
});
