const mongoose = require('mongoose');
require('dotenv').config()

const db_url = process.env.DB_URL

exports.dbConnect = () => {
    mongoose.connect(db_url, {})
        .then(
            console.log("DB Connection Successfull")
        )
        .catch((error) => {
            console.error(error);
        })
}