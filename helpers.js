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

// const getUserByEmail = (object, string) => {
//   let isAvailable = false;
//   for (const obj in object) {
//     if (object.hasOwnProperty(obj)) {
//       if (object[obj].email === string) {
//         isAvailable = true;
//       }
//     }
//   }
//   return isAvailable;
// };

module.exports = {getUserByEmail};