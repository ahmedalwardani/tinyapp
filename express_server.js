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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


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
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


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


app.get("/register", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});


app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});