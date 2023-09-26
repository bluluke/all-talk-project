const { MongoMemoryServer } = require("mongodb-memory-server");
const {app} = require("../app");
const request = require('supertest'); 
const seedDatabase = require("../test-data/run-seed");
const { closeDatabase } = require('../connection');  

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.LOCAL_MONGODB_URI =  uri; 

});

beforeEach(() => {
    return seedDatabase();
})

afterAll(async () => {
    await closeDatabase();
    await mongod.stop();
})

describe('GET /api/chats', () => { 
  test('Should return all documents from chat-list collection', () => { 
    return request(app)
    .get("/api/chats/")
    .expect(200)
    .then(({ body }) => {
        expect(body.chats.length).toBe(9);
        body.chats.forEach((document) => {
            expect(document).toHaveProperty('_id')
     expect(document).toHaveProperty('chatName')
     expect(document).toHaveProperty('chatCreator')
     expect(document).toHaveProperty('messages')
     expect(document).toHaveProperty('timeOfCreation')
        })
    })
  });
  test('Should return chats in reverse chronological order', () => {
    return request(app)
    .get("/api/chats")
    .expect(200)
    .then(({ body }) => {
        let isReverseChronological = true;
        let previousTime = body.chats[0].timeOfCreation.$timestamp.t;
        body.chats.forEach((chat) => {
            const currentTime= chat.timeOfCreation.$timestamp.t;
            if(currentTime > previousTime) {
                isReverseChronological = false
            } else {
                previousTime = currentTime;
            }
        })
        expect(isReverseChronological).toBe(true);
    })
  })
});

