const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({         // Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.
    email: {
        type: String,
        required: true,
    }
});

userSchema.plugin(passportLocalMongoose);     // why plugin use? => it implement automaticaly - username, hashing, salting & hashpassword      // as an pluging we pass passportLocalMongoose

module.exports = mongoose.model('User', userSchema);