const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose")
const { ObjectId } = require('mongodb')
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
        let chatListData;
        let lastIndex;
        await request(app)
        .post('/api/chats')
        .send({chatName: 'Exceptionalism', chatCreator: 'Rishi', notNeed: 'notneeded' })
        .expect(201)
        try {
            await connectToDatabase();
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatListCollection = await database.collection('chat-list');
            chatListData = await chatListCollection.find({}).toArray(); ;
            lastIndex = chatListData.length - 1;
        } catch (err) {
            console.error(err)    
        }
        expect(chatListData.length).toBe(10);
        expect(chatListData[lastIndex].chatName).toBe('Exceptionalism')
        expect(chatListData[lastIndex].chatCreator).toBe('Rishi')
        expect(chatListData[lastIndex].messages).toEqual([]);
        expect(typeof chatListData[lastIndex].timeOfCreation === 'object').toBe(true)
        expect(ObjectId.isValid(chatListData[lastIndex]._id)).toBe(true);
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
        let chatListData;
        let lastIndex;
        await request(app)
        .post('/api/chats')
        .send({chatName: 'Nepotism', chatCreator: 'Boris', unnecessary: 'This property is not needed' })
        .expect(201)
        try {
            await connectToDatabase();
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatListCollection = await database.collection('chat-list');
            chatListData = await chatListCollection.find({}).toArray(); 
            lastIndex = chatListData.length - 1;
        } catch (err) {
            console.error(err)    
        }
        expect(chatListData.length).toBe(10);
        expect(chatListData[lastIndex].chatName).toBe('Nepotism')
        expect(chatListData[lastIndex].chatCreator).toBe('Boris')
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
    test('400: Responds with error message when chatName does not have at least one non whitespace character', () => { 
        return request(app)
        .post('/api/chats')
        .send({ chatName: '    ', chatCreator: 'Trevor'})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request');
        })
    });
    test('400: Responds with error message when chatCreator does not have at least one non whitespace character', () => { 
        return request(app)
        .post('/api/chats')
        .send({ chatName: 'dairy', chatCreator: '        '})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request');
        })
    });
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
        let databaseQueryResult;
        await request(app)
        .post('/api/chats/6509914e64a1827eedbf6f63/messages')
        .send({senderName: 'Dracula', messageContent: 'I prefer to spend less time in daylight.'})
        .expect(201)
        try {
            await connectToDatabase();
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatlistCollection = await database.collection('chat-list')
            
            const query = { _id: '6509914e64a1827eedbf6f63' };
            const chatDocument = await chatlistCollection.findOne(query);
            databaseQueryResult = chatDocument;
        } catch (err) {
        }
        expect(databaseQueryResult.messages.length).toBe(4);
        expect(databaseQueryResult.messages[3].senderName).toBe('Dracula')
        expect(databaseQueryResult.messages[3].messageContent).toBe('I prefer to spend less time in daylight.')
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
       test('201: Adds message to chat document when post request body has unnecessary property', async () => {
        let databaseQueryResult;
        await request(app)
        .post('/api/chats/6509914e64a1827eedbf6f63/messages')
        .send({senderName: 'Dracula', messageContent: 'I prefer to spend less time in daylight.', unnecessary: 'This property is unnecessary'})
        .expect(201)
        try {
            await connectToDatabase();
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatlistCollection = await database.collection('chat-list')
            const query = { _id: '6509914e64a1827eedbf6f63'}
            const chatDocument = await chatlistCollection.findOne(query);
            databaseQueryResult = chatDocument;
        } catch (err) {
        }
        expect(databaseQueryResult.messages.length).toBe(4)
        expect(databaseQueryResult.messages[3].senderName).toBe('Dracula')
        expect(databaseQueryResult.messages[3].messageContent).toBe('I prefer to spend less time in daylight.')
    })
    test('400: Returns error message when id has non alphanumeric characters', () => {
        return request(app)
        .post('/api/chats/6509914e64a1827eedbf@@@@@/messages')
        .send({senderName: 'Kevin Smith', messageContent: 'This message will not reach the chat document.'})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Returns error message when id does not have length of 24', () => {
        return request(app)
        .post('/api/chats/6509914e64a1827eedbf/messages')
        .send({senderName: 'David Jones', messageContent: 'This message will not reach the chat document.'})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Returns error message when senderName value does not have a least 1 non whitespace character', () => {
        return request(app)
        .post('/api/chats/650a7f8c1f1e6c8b49e9e832/messages')
        .send({senderName: '     ', messageContent: 'This message will not reach the chat document.'})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Returns error message when messageContent value does not have a least 1 non whitespace character', () => {
        return request(app)
        .post('/api/chats/650a7f8c1f1e6c8b49e9e832/messages')
        .send({senderName: 'Alan McCarthy', messageContent: '     '})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
  });

  describe('GET /api/chats/names', () => {
    test('200: Returns array of objects with chatName, timeOfCreation and_id properties', () => {
        return request(app)
        .get('/api/chats/names')
        .expect(200)
        .then(({ body }) => {
            expect(body.names.length).toBe(9)
            body.names.forEach((nameObj) => {
                expect(typeof nameObj.chatName).toBe('string')
                expect(typeof nameObj.timeOfCreation).toBe('object')
                expect(typeof nameObj._id).toBe('string');
            })
        })
    })
    test('200: Returns names in reverse chronological order as default', () => {
        return request(app)
        .get("/api/chats/names")
        .expect(200)
        .then(({ body }) => {
            let isReverseChronological = true;
            let previousTime = body.names[0].timeOfCreation.$timestamp.t; 
            body.names.forEach((nameObj) => {
                const currentTime = nameObj.timeOfCreation.$timestamp.t; 
                if(currentTime > previousTime) {
                    isReverseChronological = false;
                } else {
                    previousTime = currentTime;
                }
            })
            expect(isReverseChronological).toBe(true);
        })
    })
  });

  describe('GET /api/chats/:chatid', () => { 
    test('200: Returns chat document specified in parameter', () => { 
        return request(app)
        .get('/api/chats/650a7f8c1f1e6c8b49e9e832')
        .expect(200)
        .then(({ body }) => {
            expect(body.chat._id).toBe('650a7f8c1f1e6c8b49e9e832')
            expect(body.chat.chatName).toBe('Favorite Recipes')
            expect(body.chat.chatCreator).toBe('Olivia Chef')
            expect(Array.isArray(body.chat.messages)).toBe(true)
            expect(typeof body.chat.timeOfCreation === 'object').toBe(true)
        })
    }); 
    test('404: Returns error message if parameter id does not exist', () => { 
        return request(app)
        .get('/api/chats/650a7f8c1f1e6c8b49e9a111')
        .expect(404)
        .then(( { body }) => {
            expect(body.msg).toBe('Not Found')
        })
    });
    test('400: Retoru error message if parameter id is invalid type', () => {
        return request(app)
        .get('/api/chats/650a7f8c1f1e6c8b49e9')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
  });

  describe('DELETE /api/chats/:chatid', () => {
    test('200: returns message to confirm deletion', () => {
        return request(app)
        .delete('/api/chats/65086dc0de189d61e4f9c1c4')
        .expect(200)
        .then(({ body }) => {
            expect(body.result.acknowledged).toBe(true)
            expect(body.result.deletedCount).toBe(1);
        })
    })
    test('200: removes chat document from chat-list collection', async () => {
        let databaseQueryResult;
        await request(app)
        .delete('/api/chats/650a7f8c1f1e6c8b49e9e836')
        .expect(200)
        try {
            await connectToDatabase()
            const client = mongoose.connection.client
            const database = await client.db('all-talk-project')
            const chatListCollection = await database.collection('chat-list')
            const chatListData = await chatListCollection.find({}).toArray();
            databaseQueryResult = chatListData;
        } catch (err) {

        }
        let containsDocument = false;
        databaseQueryResult.forEach((chat) => {
            if(chat._id === '650a7f8c1f1e6c8b49e9e836') {
                containsDocument = true;
            }
        })
        expect(containsDocument).toBe(false); 
        expect(databaseQueryResult.length).toBe(8)
    })
    test('404: Returns error message if id does not exist', () => {
        return request(app)
        .delete('/api/chats/6509914e64a1827eedbf6f65')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not Found')
        })
    })
    test('400: Returns error message if id not valid type', () => {
        return request(app)
        .delete('/api/chats/65086dc0de189d61e4f9')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
})

describe('DELETE /api/chats/:chatid/messages/:messageid', () => {
    test('200: Acknowledges deletion of target message', () => {
        return request(app)
        .delete('/api/chats/65086dc0de189d61e4f9c1c4/messages/65086dc0de189d61e4f9c1c5')
        .expect(200)
        .then(({ body }) => {
            expect(body.result.acknowledged).toBe(true)
            expect(body.result.modifiedCount).toBe(1)
            expect(body.result.matchedCount).toBe(1)
        })
    })
    test('200: Removes specified message object from specified chat document', async () => {
        let messageExists = true;
        await request(app)
        .delete('/api/chats/6509914e64a1827eedbf6f63/messages/65086dc0de189d61e4f9c1c7')
        .expect(200)
        try {
            await connectToDatabase()
            const client = mongoose.connection.client;
            const database = await client.db('all-talk-project')
            const chatListCollection = await database.collection('chat-list')
            
            const updatedChat = await chatListCollection.findOne({ _id: '6509914e64a1827eedbf6f63', })
            messageExists = updatedChat.messages.some(message => message._id === '65086dc0de189d61e4f9c1c7')
        } catch(err) {

        }
        expect(messageExists).toBe(false);
    })
    test('400: Responds with error message if chatid not a valid id', () => {
        return request(app)
        .delete('/api/chats/6509914e64a1827eedbf6f6!/messages/65086dc0de189d61e4f9c1c7')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Responds with error message if messageid not a valid id', () => {
        return request(app)
        .delete('/api/chats/6509914e64a1827eedbf6f63/messages/65086dc0de189d61e4f9c1c!')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('404: Responds with error message if chatid does not exist', () => {
        return request(app)
        .delete('/api/chats/6509914e64a1827eedbf6f99/messages/65086dc0de189d61e4f9c1c7')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not Found')
        })
    })
    test('404: Responds with error message if messageid does not exist', () => {
        return request(app)
        .delete('/api/chats/65086dc0de189d61e4f9c1c4/messages/65086dc0de189d61e4f9c1f9')
        .expect(404)
        .then(({ body}) => {
            expect(body.msg).toBe('Not Found')
        })
    })
})
describe('PATCH /api/chats:chatid/messages/:messageid', () => {
    test("200: Acknowledges successful patch", () => {
        return request(app)
        .patch('/api/chats/650a7f8c1f1e6c8b49e9e830/messages/65086dc0de189d61e4f9c1ca')
        .send({ messageContent: 'abcde'})
        .expect(200)
        .then(({ body }) => {
            expect(body.result.acknowledged).toBe(true)
            expect(body.result.modifiedCount).toBe(1)
            expect(body.result.matchedCount).toBe(1)
        })
    })
    test("200: Updates target message object", async () => {
        let aggregationResult;
        await request(app)
        .patch('/api/chats/650a7f8c1f1e6c8b49e9e830/messages/65086dc0de189d61e4f9c1ca')
        .send({ messageContent: 'fghij'})
        .expect(200)
        try {
            await connectToDatabase()
            const client = mongoose.connection.client
            const database = await client.db('all-talk-project');
            const chatListColleciton = await database.collection('chat-list')
            
            aggregationResult = await chatListColleciton.aggregate([
                { $match: { _id: '650a7f8c1f1e6c8b49e9e830'} },
                { $unwind: '$messages' },
                { $match: { 'messages._id': '65086dc0de189d61e4f9c1ca' }},
                { $replaceRoot: { newRoot: '$messages' } }
            ]).toArray();
                
        } catch (err) {

        }
        expect(aggregationResult[0]._id).toBe('65086dc0de189d61e4f9c1ca')
        expect(aggregationResult[0].messageContent).toBe('fghij')
    })
    test('404: Returns error message when chatid does not exist', () => {
        return request(app)
        .patch('/api/chats/650a7f8c1f1e6c8b49e9e925/messages/65086dc0de189d61e4f9c1ca')
        .send({ messageContent: 'klmno'})
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not Found')
        })
    })
    test('404: Returns error message when messageid does not exist', () => {
        return request(app)
        .patch('/api/chats/650a7f8c1f1e6c8b49e9e830/messages/65086dc0de189d61e4f9c1db')
        .send({ messageContent: 'pqrst'})
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not Found')
        })
    })
    test('400: Returns error message when chatid is not a valid id', () => {
        return request(app)
        .patch('/api/chats/650a7f8c1f1e6c8b49e9e9^f/messages/65086dc0de189d61e4f9c1ca')
        .send({ messageContent: 'uvwxyz'})
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
    test('400: Returns error message when messageid is not a valid id', () => {
        return request(app)
        .patch('/api/chats/650a7f8c1f1e6c8b49e9e830/messages/65086dc0de189d61e&fbc1ca')
        .send({ messageContent: 'zyxwv'})
        .expect(400)
        .then(({ body}) => {
            expect(body.msg).toBe('Bad Request')
        })
    })
})




