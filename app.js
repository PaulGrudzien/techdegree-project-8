const db = require('./db.js');
const express = require("express");
const bodyParser = require('body-parser');
const {Op} = require("sequelize");

const app = express();
const {Book} = db.models;

app.set('view engine', 'pug');
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// redirecting / to /books
app.get('/', (req, res) => {
    res.redirect('/books')
});

// route for /books
app.get('/books', (req, res, next) => {
    (async () => {
      try {
        const query = {
            order: [
                ['title', 'ASC'],
                ['author', 'ASC'],
                ['year', 'ASC'],
            ]
        };
        if (req.query.search) {
            query.where = {
                [Op.or]: [
                    { title: { [Op.like]: `%${req.query.search}%` } },
                    { author: { [Op.like]: `%${req.query.search}%` } },
                    { genre: { [Op.like]: `%${req.query.search}%` } },
                    { year: req.query.search }
                ]
            };
        };
        const booksData = await Book.findAll(query);
        const books = booksData.map(book => book.toJSON());
        res.locals = { books, idHighlighted:req.query.idHighlighted };
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
    (async () => {
        let newBook;
        try {
            newBook = await Book.create(req.body);
            res.redirect(`/books?idHighlighted=${newBook.id}`)
        } catch (error) {
            if(error.name === "SequelizeValidationError") {
                newBook = await Book.build(req.body);
                res.locals={newBook, errors: error.errors}
                res.render("new-book")
            } else {
                next(error)
            }
        }
    })();
});

// routes for /books/:id
app.get('/books/:id', (req, res, next) => {
    (async () => {
        const bookData = await Book.findByPk(req.params.id);
        if (bookData) {
            const book = bookData.toJSON();
            res.locals = { book };
            res.render("update-book");
        } else {
            const error = new Error("Server Error");
            error.status = 500
            error.message = `They are no book with the id ${req.params.id}`;
            next(error)
        }
    })();
});

app.post('/books/:id', (req, res, next) => {
    (async () => {
        const book = await Book.findByPk(req.params.id);
        try {
            await book.update(req.body);
            res.redirect(`/books?idHighlighted=${req.params.id}`)
        } catch (error) {
            if(error.name === "SequelizeValidationError") {
                res.locals={book:req.body, errors: error.errors}
                res.render("update-book")
            } else {
                error.status = 500
                next(error)
            }
        }
    })();
});

// route for /books/:id/delete
app.post('/books/:id/delete', (req, res) => {
    (async () => {
        try {
            const book = await Book.findByPk(req.params.id);
            await book.destroy();
            res.redirect('/books')
          } catch(error) {
            error.status = 500
            next(error)
          }
    })();
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
