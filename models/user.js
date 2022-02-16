// require works in here just like in server.js
const bcrypt = require('bcryptjs');

// making a class to hold all our user logic
// in web development, this is called a "model"
class User {

  // constructor gets called when a new object is made, just like C++, java, etc.
  // taking in an assoc array of parameters ("properties") is nice here because
  //  it means we can pass in a row that we get from a database query
  constructor(props) {
    // store the props in the new object
    // (explicit "this" is a good practice)
    this.id = props.id;
    this.username = props.username;
    this.password_hash = props.password_hash;
    this.admin = props.admin;
  }

  // static method to get a user from the database and store that user's
  //  values in a new User object
  static async findByUsername(username, db) {
    const result = await db.get('SELECT * FROM user WHERE username = ?',
                                username);
    if (!result) {
      return null;
    }
    return new User(result);

    // fancier syntax (short-circuit returns undefined if no result)
    // return result && new User(result);
  }

  // static method to validate the user-supplied data, save the new
  //  user to the database, and return a User object representing that user
  static async signup(username, password, db) {
    // "business logic" (the rules)    
    // get all the errors before responding, not one at a time
    const errors = [];

    if (username == '') {
      errors.push("Username cannot be blank");
    } else if (await this.findByUsername(username, db)) {
      errors.push("Username already in use");
    }
    if (password.length < 4) {
      errors.push("Password must be at least four characters");
    }

    if (errors.length > 0) {
      // something went wrong, do not save the user (return the errors)
      return [false, null, errors];
    }

    // the data is good, save user to database
    const hash = await bcrypt.hash(password, 10);
    const insert_result = await db.run('INSERT INTO user (username, password_hash) VALUES (?, ?)',
                                       [username, hash]);

    console.log(insert_result);

    const user = new User({
      id: insert_result.lastID,
      username: username,
      password_hash: hash, // could omit, not really needed except during login/signup
      admin: 0});

    // and return
    return [true, user, errors];
  }

  // static method to see if the username/password combination is valid
  //  and return a User object representing that user if it is
  static async login(username, password, db) {

    // simple cases, don't bother the database
    if (username == '' || password.length < 4) {
      return null;
    }

    // get user from database
    const user = await this.findByUsername(username, db);
    if (!user) {
      return null;
    }

    // got user, check password
    if (await bcrypt.compare(password, user.password_hash)) {
      return user;
    }

    // failed the password check
    return null;
  }
}

// this allows us to do the "require" statement from another file (module)
module.exports = User;
