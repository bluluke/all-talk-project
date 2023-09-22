const mongoose = require('mongoose');
const ENV = process.env.NODE_ENV


require("dotenv").config({
    path: `${__dirname}/.env.${ENV}`,
  });


  if (!process.env.DATABASE_URL && !process.env.LOCAL_MONGODB_URI) {
    console.log(`${__dirname}/.env.${ENV}`);
    throw new Error("DATABASE_URL or LOCAL_MONGODB_URI not set");
  }

module.exports.connectToDatabase = async () => {
    let uri; 
    if(ENV === 'production') {
        uri = process.env.DATABASE_URL; 
    } else {
        uri = process.env.LOCAL_MONGODB_URI;
    }
  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
    });
    console.log('Connected to database');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};

module.exports.closeDatabase = async () => {
    try {
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database')
    }
};

