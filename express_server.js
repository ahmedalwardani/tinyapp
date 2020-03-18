const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

const PORT = 8080;

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

const isAvailable = (object, string) => {
  let isAvailable = true;
  for (const obj in object) {
    if (object.hasOwnProperty(obj)) {
      if (object[obj].email === string) {
        isAvailable = false;
      }
    }
  }
  return isAvailable;
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


//POSTS
app.post("/register", (req,res) => {
  const randomID = generateRandomString();
  if (isAvailable(users, req.body.email)) {
    users[randomID] = {
      id: randomID,
      email:req.body.email,
      password:req.body.password
    };
  } else {
    res.statusCode = 400;
    res.send("Error: The e-mail address you entered is already taken. Please enter another e-mail!");
  }

  if (users[randomID]) {
    if (users[randomID].email === "" || users[randomID].password === "") {
      res.statusCode = 400;
      res.send("Error: Please provide a valid username/password");
    } else {
      res.cookie("user_id", randomID);
      res.redirect("/urls");
    }
  }
});

app.post("/urls", (req, res) => {
  const testURL = generateRandomString();
  urlDatabase[testURL] = req.body.longURL;
  res.redirect(`/urls/${testURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});



//GETS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>World<b>Hello</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});


app.get("/login", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  let templateVars = {user: currentUser};
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  let templateVars = {user: currentUser};
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  let templateVars = {user: currentUser};
  res.render("urls_new", templateVars);
});


app.get("/urls", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = {urls: urlDatabase, user: currentUser};
  res.render("urls_index", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user:currentUser};
  res.render("urls_show", templateVars);
});

 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});