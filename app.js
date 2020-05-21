const db = require('./db.js');
const express = require("express")

const app = express()
const {Book} = db.models;

app.set('view engine', 'pug');
app.use('/static', express.static('public'));
express.static.mime.define({'text/css': ['css']});

// redirecting / to /books
app.get('/', (req, res) => {
    res.redirect('/books')
});

// route for /books
app.get('/books', (req, res, next) => {
    (async () => {
      try {
        const booksData = await Book.findAll();
        const books = booksData.map(book => book.toJSON());
        res.locals = { books };
        res.render("index");
      } catch(error) {
        next(error)
      }
    })();
});

// routes for /books/new
app.get('/books/new', (req, res) => {
    res.render("new-book");
});

app.post('/books/new', (req, res) => {
    res.redirect('/books')
});

// routes for /books/:id
app.get('/books/:id', (req, res) => {
    (async () => {
        const bookData = await Book.findByPk(req.params.id);
        if (bookData) {
            const book = bookData.toJSON();
            res.locals = { book };
            res.render("update-book");
        } else {
            console.error(`Page not found (${req.originalUrl})`)
            res.render("page-not-found");
        }
    })();
});

app.post('/books/:id', (req, res) => {
    res.redirect('/books')
});

// route for /books/:id/delete
app.post('/books/:id/delete', (req, res) => {
    res.redirect('/books')
});

// route for inexisting page
app.use((req, res) => {
    console.error(`Page not found (${req.originalUrl})`)
    res.render("page-not-found");
});

// handle errors
app.use((error, req, res, next) => {
    console.error(`Error ${error.status}: ${error.message}`);
    res.locals = { error };
    res.render("error");
});

app.listen(3000, () => {console.log('Server is listening on port 3000')});
