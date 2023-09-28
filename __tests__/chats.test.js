const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose")
const {app} = require("../app");
const request = require('supertest'); 
const seedDatabase = require("../test-data/run-seed");
const { closeDatabase, connectToDatabase } = require('../connection');  

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
  test('200: Should return all documents from chat-list collection', () => { 
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
  test('200: Should return chats in reverse chronological order as default', () => {
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

describe('GET /api/chats?from_date=', () => { 
  test('200: Returns chat documents dated later than or the same as the date indicated by parametric timestamp value', () => { 
    return request(app)
    .get("/api/chats?from_date=1695126250")
    .expect(200)
    .then(({ body }) => {
        const fromDate = 1695126250;
        let timeStampValueOverFromDate = true;
        body.chats.forEach((chat) => {
            if(chat.timeOfCreation.$timestamp.t < fromDate) {
                timeStampValueOverFromDate = false
            }
        })
        expect(timeStampValueOverFromDate).toBe(true)
        expect(body.chats.length).toBe(7);    
    })
  });
  test('200: Returns empty array when no chat documents dated later than or the same as the date indicated by parametric timestamp value', () => {
    return request(app)
    .get("/api/chats?from_date=1695276255")
    .expect(200)
    .then(({ body}) => {
        expect(body.chats).toEqual([]);
    })
  })
  test('400: Returns error message if non numeric value passed as from_date', () => {
    return request(app)
    .get("/api/chats?from_date=abcde")
    .expect(400)
    .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
    })
  })
});

describe('GET /api/chats?to_date=', () => { 
    test('200: Returns chat documents dated earlier and the same as the date indicated by parametric timestamp value ', () => {
        return request(app)
        .get('/api/chats?to_date=1695126852')
        .expect(200)
        .then(({ body }) => {
            expect(body.chats.length).toBe(7);
            const toDate = 1695126852;
            let timeStampValueBelowToDate = true; 
            body.chats.forEach((chat) => {
                if(chat.timeOfCreation.$timestamp.t > toDate) {
                    timeStampValueBelowToDate = false
                }
            })
            expect(timeStampValueBelowToDate).toBe(true);
        })
      })
      test('200: Returns empty array when no chat documents dated earlier than or the same as the date indicated by parametric timestamp value', () => {
        return request(app)
        .get("/api/chats?to_date=-1")
        .expect(200)
        .then(({ body}) => {
            expect(body.chats).toEqual([]);
        })
      })
      test('400: Returns error message if non numeric value passed as to_date', () => {
        return request(app)
        .get("/api/chats?to_date=abcde")
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request');
        })
      })
});


describe('GET /api/chats?from_date= &&to_date=', () => { 
  test('200: Returns chat documents dated within tiime frame indicated by parametric timestamp values', () => { 
    return request(app)
    .get('/api/chats?from_date=1&&to_date=1695126852')
    .expect(200)
    .then(({ body }) => {
        let withinTimeFrame = true;
        const fromDate = 1;
        const toDate = 1695126853;
        body.chats.forEach((chat) => {
            if(chat.timeOfCreation.$timestamp.t < fromDate || chat.timeOfCreation.$timestamp.t > toDate) {
                withinTimeFrame = false;
            }
        })
        expect(withinTimeFrame).toBe(true);
        expect(body.chats.length).toBe(6);
    })
  }); 
});

describe('POST /api/chats', () => { 
    test('201: Acknowledges the post request', () => { 
      return request(app)
      .post('/api/chats')
      .send({chatName: 'Christmas', chatCreator: 'Nick Claus' })
      .expect(201)
      .then(({ body }) => {
          expect(body.result.acknowledged).toBe(true)
          expect(body.result).toHaveProperty("insertedId")
      })
    }); 
    test('201: Adds document to database', async () => {
        await request(app)
        .post('/api/chats')
        .send({chatName: 'Exceptionalism', chatCreator: 'Rishi', notNeed: 'notneeded' })
        .expect(201)
        try {
            await connectToDatabase();
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatListCollection = await database.collection('chat-list');
            const chatListData = await chatListCollection.find({}).toArray(); 
            expect(chatListData.length).toBe(10);
            expect(chatListData[-1].chatName).toBe('Exceptionalism')
            expect(chatListData[-1].chatCreator).toBe('Rishi')
        } catch (err) {
            console.error(err)    
        }
    })
    test('201: Acknowledges the post request of document with unnecessary properties', () => { 
        return request(app)
        .post('/api/chats')
        .send({chatName: 'Easter', chatCreator: 'Bugs', unnecessary: 'This property is not needed' })
        .expect(201)
        .then(({ body }) => {
            expect(body.result.acknowledged).toBe(true)
            expect(body.result).toHaveProperty("insertedId")
        })
      }); 
    test('201: Adds document with unnecessary properties to database', async () => {
        await request(app)
        .post('/api/chats')
        .send({chatName: 'Nepotism', chatCreator: 'Boris', unnecessary: 'This property is not needed' })
        .expect(201)
        try {
            await connectToDatabase();
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatListCollection = await database.collection('chat-list');
            const chatListData = await chatListCollection.find({}).toArray(); 
            expect(chatListData.length).toBe(10);
            expect(chatListData[-1].chatName).toBe('Nepotism')
            expect(chatListData[-1].chatCreator).toBe('Boris')
        } catch (err) {
            console.error(err)    
        }
    })
    test('400: Responds with error message when property names are malformed', () => {
        return request(app)
        .post('/api/chats')
        .send( { chanam: 'This is a malformed property', chatCreator: 'Mal'})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request');
        })
    })
  });


  describe('POST /api/chats/:chatid/messages', () => { 
    test('201: Acknowledges successful post request ', () => { 
     return request(app)
     .post('/api/chats/650a7f8c1f1e6c8b49e9e833/messages')
     .send({senderName: 'James Bookish', messageContent: 'I really enjoyed Submarine.'})
     .expect(201)
     .then(({body }) => {
        expect(body.result.acknowledged).toBe(true)
        expect(body.result.modifiedCount).toBe(1)
        expect(body.result.matchedCount).toBe(1)
     })
    }); 
    test('201: Adds message to chat document', async () => {
        await request(app)
        .post('/api/chats/6509914e64a1827eedbf6f63/messages')
        .send({senderName: 'Dracula', messageContent: 'I prefer to spend less time in daylight.'})
        .expect(201)
        try {
            await connectToDatabase();
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatlistCollection = await database.collection('chat-list')

            const chatWithSpecificMessage = await chatlistCollection.aggregate([
                { $match: { _id: '6509914e64a1827eedbf6f63'}},
                { $project: 
                    { messages: { $arrayElemAt: ['$messages', 3]}}
                }
            ]).toArray();
            expect(chatWithSpecificMessage.length).toBe(1);
            expect(chatWithSpecificMessage.senderName).toBe('Dracula')
            expect(chatWithSpecificMessage.messageContent).toBe('I prefer to spend less time in daylight.')
        } catch (err) {
        }
    })
    test('201: Acknowledges successful post request when there is an unnecessary property', () => { 
        return request(app)
        .post('/api/chats/650a7f8c1f1e6c8b49e9e833/messages')
        .send({senderName: 'James Bookish', messageContent: 'I really enjoyed Submarine.', unnecessary: 'This property is not needed'})
        .expect(201)
        .then(({body }) => {
           expect(body.result.acknowledged).toBe(true)
           expect(body.result.modifiedCount).toBe(1)
           expect(body.result.matchedCount).toBe(1)
        })
       }); 
  });