const express = require("express");
const app = express();
const Joi = require("joi");
const helmet = require("helmet");
const morgan = require("morgan");
const pug = require("pug");

// Dotenv
require("dotenv").config();

// View engine
app.set("view engine", "pug");

// Middlewares
const authMiddleware = require("./middleware/auth");
const loggerMiddleware = require("./middleware/logger");

app.use(express.json());

// urlencoded request
app.use(express.urlencoded({ extended: true }));

// HTTP headers security middleware
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

const books = [
  { name: "Atomic habits", year: 2000, id: 1 },
  { name: "Harry potter", year: 2008, id: 2 },
  { name: "Rich dad and poor dad", year: 2010, id: 3 },
];

app.use(loggerMiddleware);

// GET method // Read
app.get("/", authMiddleware, (req, res, next) => {
  const text = "Hello from index";
  res.render("index.pug", {
    title: "Home",
    heading: text,
    books,
  });
});

app.get("/contact", authMiddleware, (req, res, next) => {
  res.render("contact.pug", {
    title: "Contact",
    books,
  });
});
app.get("/shorts", authMiddleware, (req, res, next) => {
  res.render("shorts.pug", {
    title: "SHorts",
    books,
  });
});

app.get("/api/books", (req, res) => {
  res.send(books);
});

// Get request with query
app.get("/api/books/sort", (req, res) => {
  const book = books.find((book) => req.query.name === book.name);
  if (book) {
    res.status(200).send(book);
  } else {
    res.status(400).send("Bu ismli kitob mavjud emas...");
  }
});

// Get request with params
app.get("/api/books/:id/:polka", (req, res) => {
  const id = +req.params.id;

  const book = books.find((book) => book.id === id);
  if (book) {
    res.status(200).send(book);
  } else {
    res.status(400).send("Bu parametrli kitob mavjud emas...");
  }
});

// POST request
app.post("/api/books/add", (req, res) => {
  let allBooks = books; // []

  console.log(req.body);

  // Validatsiya
  let bookSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    year: Joi.number().integer().min(1900).max(2022).required(),
  });

  validateBody(req.body, bookSchema, res);

  let book = {
    id: books.length + 1,
    name: req.body.name,
    year: req.body.year,
  };

  allBooks.push(book);
  res.status(201).send(book);
});

// PUT request
app.put("/api/books/update/:id", (req, res) => {
  let allBooks = books;
  const idx = allBooks.findIndex((book) => book.id === +req.params.id);

  // Validatsiya
  let bookSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    year: Joi.number().integer().min(1900).max(2022).required(),
  });

  validateBody(req.body, bookSchema, res);

  let updatedBook = {
    name: req.body.name,
    year: req.body.year,
    id: +req.params.id,
  };

  allBooks[idx] = updatedBook;

  res.status(200).send(updatedBook);
});

// Delete request
app.delete("/api/books/delete/:id", (req, res) => {
  const idx = books.findIndex((book) => book.id === +req.params.id);
  books.splice(idx, 1);
  res.status(200).send(books);
});

try {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log("Server working on port", port);
  });
} catch (error) {
  console.error(error);
}

function validateBody(body, bookSchema, res) {
  const result = bookSchema.validate(body);

  if (result.error) {
    res.status(400).send(result.error.message);
    return;
  }
}
