# All Talk Backend

This README provides an overview of the All Talk site's backend structure, setup and usage. All Talk allows visitors to chat with others and create new chats. 

## Table of Contents

- [Setup] (#setup)
- [Usage] (#usage)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Technologies] (#technologies)
- [Contributors] (#contributors)
- [License] (#license)

## Setup

Ensure node (v16.1.0 or higher) is installed.

1. Clone this repository to your local machine. 
`git clone https://github.com/bluluke/all-talk-project`
2. Install dependencies using the command: 'npm install'.
3. Set up your environment variables (see [Environment Variables](#environment-variables)).

## Usage
The endpoints available allow the following functionality:
-POST chat/message
-GET chat/chat-names/chats(filterable by date)
-PATCH message
DELETE chat/message

## Database

The backend uses MongoDB Atlas to store chat documents in a collection called chat-list in a database called all-talk-project. To populate your Atlas database with data of the same structure , first declare an ENV variable which points to your database (see [Environment Variables](#environment-variables)). Modify line 2 of connection.js like so
`const ENV = 'production'`
Run `npm run-seed`
Now your database will be populated with data.

## Environment Variables

Create the following environment variable files in the root directory:

- `.env.production`: Environment variables for production.
- `.env.test`: Environment variables for testing.

Example of `.env.production`:

DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-url>/all-talk-project?retryWrites=true&w=majority

Note: Replace <username>, <password>, and <cluster-url> with your MongoDB Atlas credentials.

## Technologies

Dependencies: dotenv, express, mongodb, mongoose
Dev Dependencies:  jest, mongodb-memory-server, nodemon, supertest

## Contributors

Luke Ford

## License

This project is licensed under the [MIT License]