//Returns an object corresponding to a provided string, otherwise returns undefined
const getUserByEmail = (string, object) => {
  for (const obj in object) {
    if (object.hasOwnProperty(obj)) {
      if (object[obj].email === string) {
        return object[obj];
      }
    }
  }
  return undefined;
};

//Generate random alphanumeric string for URLs and user IDs
const generateRandomString = () => {
  const str = "abcdefghijklmnopqrstuvwxyz0123456789";

  let ans = "";
  let i = 0;
  while (i < 6) {
    ans += str[Math.floor(Math.random() * str.length)];
    i ++;
  }
  return ans;
};

//Add a URL for the correct user's object
const urlsForUser = (id, urlDatabase) => {
  const urlObject = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlObject[key] = urlDatabase[key];
    }
  }
  return urlObject;
};


module.exports = {getUserByEmail, generateRandomString, urlsForUser};