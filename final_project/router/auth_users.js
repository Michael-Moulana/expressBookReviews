const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const userMatches = users.filter((user) => user.username === username)
  return userMatches.length > 0
}

const authenticatedUser = (username, password) => {
  const validUser = users.filter((user) => user.username === username && user.password === password)
  return validUser.length > 0
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to login, try again" })
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 })
    req.session.authorization = { accessToken, username }
    return res.status(200).send("User successfully logged in")
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" })
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const review = req.query.review
  const username = req.session.authorization.username
  if (books[isbn]) {
    books[isbn].reviews[username] = review
    return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated`)
  }
  return res.status(404).json({ message: `ISBN '${isbn}' not found` })
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const username = req.session.authorization.username
  if (books[isbn]) {
    delete books[isbn].reviews[username]
    return res.status(200).send(`The review for the book with ISBN ${isbn} posted by user ${username} deleted`)
  }
  return res.status(404).json({message: `ISBN '${isbn}' not found`})
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
