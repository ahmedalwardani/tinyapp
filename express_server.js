const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers");
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: "session",
  keys: ["user_id"],

  maxAge: 60 * 60 * 1000
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b2xVn2: {longURL:"http://www.lighthouselabs.ca", userID: "test1"},
  qsm5xK: {longURL:"http://www.google.com", userID: "test2"}
};


//POSTS

//Register a user in the database, if provided email and password are valid
app.post("/register", (req,res) => {
  const randomID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    res.send("Error: Please provide a valid username/password");
  } else if (getUserByEmail(req.body.email, users)) {
    res.statusCode = 400;
    res.send("Error: The e-mail address you entered is already taken. Please enter another e-mail!");
  } else {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});

//Login user after providing valid username and password
app.post("/login", (req, res) => {
  let insuccessful = true;
  for (let key in users) {
    if (users[key].email === req.body.email && bcrypt.compareSync(req.body.password, users[key].password)) {
      req.session.user_id = users[key].id;
      res.redirect("/urls");
      insuccessful = false;
    }
  }

  if (insuccessful) {
    res.statusCode = 403;
    res.send("Error: Please provide a valid username/password");
  }
});

//Add a short URL to a user
app.post("/urls", (req, res) => {
  const currentUser = users[req.session.user_id];
  const testURL = generateRandomString();
  urlDatabase[testURL] = {
    longURL: req.body.longURL,
    userID: currentUser.id
  };
  res.redirect(`/urls/${testURL}`);
});

//Edit a short URL for a user, if authorized
app.post("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.send("error: access forbidden");
  }
});

//Delete a short URL for a user, if authorized
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.send("error: access forbidden");
  }
});

//Clear user's cookie and logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



//GETS

//Redirect user to his/her short URLs if logged in, or to a login page if not logged in
app.get("/", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Render login page depending whether user is logged in or not
app.get("/login", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    res.redirect("/urls");
  } else {
    let templateVars = {user: currentUser};
    res.render("login", templateVars);
  }
});

//Render register page depending whether user is logged in or not
app.get("/register", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    res.redirect("/urls");
  } else {
    let templateVars = {user: currentUser};
    res.render("register", templateVars);
  }
});

//Render user's short URLs page depending whether user is logged in or not
app.get("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  const userObject = users[currentUser];
  const URLsObject = urlsForUser(currentUser, urlDatabase);
  const templateVars = {urls: URLsObject, user: userObject};
  res.render("urls_index", templateVars);
});

//Render "new short URL" form for logged in users, and redirect logged out users to login page
app.get("/urls/new", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    let templateVars = {user: currentUser};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Redirect user to long URL(actual website) if URL exists in database
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("No existing short URL in database...");
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

//Shows long and short URL's for a given entry in the database to user, or asks user to login/register otherwise
app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("No existing short URL in database...");
  } else if (currentUser && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user:currentUser};
    res.render("urls_show", templateVars);
  } else {
    res.send("Please login or register");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});