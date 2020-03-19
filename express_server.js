const {getUserByEmail} = require("./helpers");
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: "session",
  keys: ["user_id"],

  maxAge: 60 * 60 * 1000 // 1 hour
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const generateRandomString = () => {
  const array = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  let ans = "";
  let i = 0;
  while (i < 6) {
    ans += array[Math.floor(Math.random() * array.length)];
    i ++;
  }
  return ans;
};


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


const urlsForUser = id => {
  const urlObject = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlObject[key] = urlDatabase[key];
    }
  }
  return urlObject;
};

//POSTS
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

  // // if (!getUserByEmail(users, req.body.email)) {
  //   users[randomID] = {
  //     id: randomID,
  //     email: req.body.email,
  //     password: bcrypt.hashSync(req.body.password, 10)
  //   };
  // } else {
  //   // res.statusCode = 400;
  //   // res.send("Error: The e-mail address you entered is already taken. Please enter another e-mail!");
  // }
  // // if (users[randomID]) {
  // //   if (users[randomID].email === "" || users[randomID].password === "") {
  //     // res.statusCode = 400;
  //     // res.send("Error: Please provide a valid username/password");
  //   } else {
  //     req.session.user_id = randomID;
  //     res.redirect("/urls");
  //   }
  // }
});

app.post("/urls", (req, res) => {
  const currentUser = users[req.session.user_id];
  const testURL = generateRandomString();
  urlDatabase[testURL] = {
    longURL: req.body.longURL,
    userID: currentUser.id
  };
  res.redirect(`/urls/${testURL}`);
});


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
    res.redirect("/login");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



//GETS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>World<b>Hello</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});


app.get("/login", (req, res) => {
  const currentUser = users[req.session.user_id];
  let templateVars = {user: currentUser};
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {
  const currentUser = users[req.session.user_id];
  let templateVars = {user: currentUser};
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  const userObject = users[currentUser];
  const URLsObject = urlsForUser(currentUser);
  const templateVars = {urls: URLsObject, user: userObject};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    let templateVars = {user: currentUser};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user:currentUser};
    res.render("urls_show", templateVars);
  } else {
    res.send("Please login or register");
  }
});

 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});