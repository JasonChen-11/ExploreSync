import chai from 'chai';
import chaiHttp from 'chai-http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { stub } from 'sinon';
import { authenticator } from 'otplib';
import { server } from '../app.mjs';

import User from '../models/User.mjs';
import Group from '../models/Group.mjs';
import Message from '../models/Message.mjs';
import Location from '../models/User.mjs';
import Invitation from '../models/Invitation.mjs';

const expect = chai.expect;
chai.use(chaiHttp);

const getUsers = async () => {
  return User.find({});
}

const getGroups = async () => {
  return Group.find({});
}

const getMessages = async () => {
  return Message.find({});
}

const getInvitations = async () => {
  return Invitations.find({});
}

let agent;
let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ==================== AUTH API ====================

describe('Testing Authentication API', () => {
  const user = {
    username: 'testuser',
    password: 'testpassword',
  };

  before(async () => {
    agent = chai.request.agent(server);
  });

  after(async () => {
    agent.close();
    await mongoose.connection.dropDatabase();
  });

  it('it should create a new user', async () => {
    const res = await agent
      .post('/api/auth/register')
      .send(user);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);

    const users = await getUsers();
    expect(users).to.have.length(1);
    expect(users[0]._id).to.equal(user.username);
  });

  it('it should fail to create an existing user', async () => {
    const res = await agent
      .post('/api/auth/register')
      .send(user);

    expect(res.body).to.equal(`Username ${user.username} already exists`);
  });

  it('it should handle missing username and password', async () => {
    const res = await agent
      .post('/api/auth/register')
      .send({});

    expect(res).to.have.status(400);

    const errors = res.body.errors;
    expect(errors).to.be.an('array');
    expect(errors).to.have.lengthOf(2);
    expect(errors[0].msg).to.equal('Invalid value');
    expect(errors[1].msg).to.equal('Invalid value');

    const users = await getUsers();
    expect(users).to.have.length(1);
    expect(users[0]._id).to.equal(user.username);
  });

  it('it should fail to enable 2FA when not signed in', async () => {
    const res = await agent
      .get('/api/auth/2fa/enable');

    expect(res).to.have.status(401);
    expect(res.text).to.equal('Access denied');
  });

  it('it should fail to disable 2FA when not signed in', async () => {
    const res = await agent
      .get('/api/auth/2fa/disable');

    expect(res).to.have.status(401);
    expect(res.text).to.equal('Access denied');
  });

  it('it should sign in a user without 2FA', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send(user);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
  });

  it('it should enable 2FA', async () => {
    const qrCodeRes = await agent
      .get('/api/auth/2fa/enable');

    expect(qrCodeRes).to.have.status(200);
    expect(qrCodeRes.body.success).to.equal(true);
    expect(qrCodeRes.body.qrCode).to.exist;
  });

  it('it should verify 2FA', async () => {
    const checkStub = stub(authenticator, 'check').returns(true);

    try {
      const res = await agent
        .post('/api/auth/2fa/verify')
        .send({
          token: 'mocked-token'
        });
  
      expect(res).to.have.status(200);
      expect(res.body.success).to.equal(true);
    } finally {
      checkStub.restore();
    }
  });

  it('it should logout the user', async () => {
    const res = await agent
      .get('/api/auth/logout');

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
  });

  it('it should attempt to sign in a user but then request for 2FA token', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send(user);

    expect(res).to.have.status(200);
    expect(res.body.require2FA).to.equal(true);
  });

  it('it should fail to login with an invalid 2FA token', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({
        ...user,
        token: 'invalid-token',
      });

    expect(res).to.have.status(401);
    expect(res.text).to.equal('Access denied');
  });

  it('it should sign in a user successfully with the correct 2FA token', async () => {
    const checkStub = stub(authenticator, 'check').returns(true);

    try {
      const res = await agent
        .post('/api/auth/login')
        .send({
          ...user,
          token: 'mocked-token',
        });
  
      expect(res).to.have.status(200);
      expect(res.body.success).to.equal(true);
    } finally {
      checkStub.restore();
    }
  });

  it('it should disable 2FA', async () => {
    const res = await agent
      .get('/api/auth/2fa/disable');

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
  });

  it('it should logout the user', async () => {
    const res = await agent
      .get('/api/auth/logout');

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
  });

  it('it should sign in a user without 2FA', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send(user);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
  });
});

// ==================== CHAT API ====================

describe('Testing Chat API', () => {
  let agent;

  const user_one = {
    username: 'testuser1',
    password: 'testpassword',
  };

  const group_title = 'testgroup';
  let group_id = "";

  const content = "hello world!";

  let mongoServer;

  before(async () => {
    agent = chai.request.agent(server);
  });

  after(async () => {
    agent.close();
    await mongoose.connection.dropDatabase();
  });

  it('it should create a user and sign in the user without 2FA', async () => {
    let res = await agent
      .post('/api/auth/register')
      .send(user_one);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
    const users = await getUsers();
    expect(users).to.have.length(1);
    expect(users[0]._id).to.equal(user_one.username);

    res = await agent
    .post('/api/auth/login')
    .send(user_one);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true); 
  });

  it('it should create a group with the user in it', async () => {
    const res = await agent
      .post('/api/group')
      .send({ title: group_title });

    expect(res).to.have.status(200);
    group_id = res.body._id;
    const groups = await getGroups();
    expect(groups).to.have.length(1);
    expect(groups[0].title).to.equal(group_title);
    expect(groups[0].members).to.have.length(1); 
    expect(groups[0].members[0]).to.equal(user_one.username);
  });

  it('it should add a message to the group', async () => {
    const res = await agent
      .post('/api/chat/messages')
      .send({group_id, content})

    expect(res).to.have.status(200);
    const messages = await getMessages();
    expect(messages).to.have.length(1);
    expect(messages[0].author).to.equal(user_one.username);
    expect(messages[0].content).to.equal(content); 
  });

  it('it should add another message to the group', async () => {
    const res = await agent
      .post('/api/chat/messages')
      .send({group_id, content})

    expect(res).to.have.status(200);
    const messages = await getMessages();
    expect(messages).to.have.length(2);
    expect(messages[1].author).to.equal(user_one.username);
    expect(messages[1].content).to.equal(content); 
  });

  it('it should get the two messages', async () => {
    const res = await agent
      .get('/api/chat/messages/' + group_id)

    expect(res).to.have.status(200);
    const messages = await getMessages();
    expect(messages).to.have.length(2);
    expect(messages[0].author).to.equal(user_one.username);
    expect(messages[0].content).to.equal(content); 
    expect(messages[0].author).to.equal(user_one.username);
    expect(messages[1].content).to.equal(content); 
  });
});

// ==================== GROUP API ====================

describe('Testing Group API', () => {
  let agent;

  const user_one = {
    username: 'testuser1',
    password: 'testpassword',
  };

  const user_two = {
    username: 'testuser2',
    password: 'testpassword',
  };

  const group_title = 'testgroup';
  let group_id = "";

  let mongoServer;

  before(async () => {
    agent = chai.request.agent(server);
  });

  after(async () => {
    agent.close();
    await mongoose.connection.dropDatabase();
  });

  it('it should create two users', async () => {
    let res = await agent
      .post('/api/auth/register')
      .send(user_one);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);

    res = await agent
      .post('/api/auth/register')
      .send(user_two);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);

    const users = await getUsers();
    expect(users).to.have.length(2);
    expect(users[0]._id).to.equal(user_one.username);
    expect(users[1]._id).to.equal(user_two.username);
  });

  it('it should sign in user_one without 2FA', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send(user_one);

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
  });

  it('it should create a group with user_one in it', async () => {
    const res = await agent
      .post('/api/group')
      .send({ title: group_title });

    expect(res).to.have.status(200);
    group_id = res.body._id;
    const groups = await getGroups();
    expect(groups).to.have.length(1);
    expect(groups[0].title).to.equal(group_title);
    expect(groups[0].members).to.have.length(1); 
    expect(groups[0].members[0]).to.equal(user_one.username);
  });

  it('it should get the group', async () => {
    const res = await agent
      .get('/api/group/' + group_id)

    expect(res).to.have.status(200);
    expect(res.body.title).to.equal(group_title);
    expect(res.body.members).to.have.length(1); 
    expect(res.body.members[0]).to.equal(user_one.username);
  });

  it('it should add user_two to the group', async () => {
    const res = await agent
      .patch('/api/group/member')
      .send({ group_id, username: user_two.username });

    expect(res).to.have.status(200);
    const groups = await getGroups();
    expect(groups[0].members).to.have.length(2); 
    expect(groups[0].members[1]).to.equal(user_two.username);
  });

  it('it should create an invitation to the group', async () => {
    const res = await agent
      .patch('/api/group/invite')
      .send({ group_id });

    expect(res).to.have.status(200);
    // const groups = await getGroups();
    // expect(groups[0].members).to.have.length(2); 
    // expect(groups[0].members[1]).to.equal(user_two.username);
  });
});

// ==================== Location API ====================

describe('Testing Location API', () => {
  let agent;
  const usersData = [
    { _id: 'user1', hash: 'hash1' },
    { _id: 'user2', hash: 'hash2' },
    { _id: 'user3', hash: 'hash3' }
  ];

  const testData = [{username: 'user1', coordinates: [40.7128, -74.0060]},
                    {username: 'user2', coordinates: [35.6895, 139.6917]},
                    {username: 'user3', coordinates: [ -33.8688, 151.2093]}];

  const updatedData = [{username: "user2", coordinates: [34.0522, -118.2437]}]

  const groupData = {
    title: 'Test Group',
    host: 'Test Host',
    members: ['user1', 'user2', 'user3']
  };
  
  let groupId;

  before(async () => {
    agent = chai.request.agent(server);
    await User.create(usersData);
    const group = await Group.create(groupData);
    groupId = group._id;
  });

  after(async () => {
    agent.close();
    await mongoose.connection.dropDatabase();
  });

  
  it('it should add a user location', async () => {
    const res = await agent
      .put('/api/location')
      .send(testData[0]);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("username", testData[0].username);
    expect(res.body.location.coordinates).to.deep.equal(testData[0].coordinates);
  });

  it('it should add another user location', async () => {
    const res = await agent
      .put('/api/location')
      .send(testData[1]);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("username", testData[1].username);
    expect(res.body.location.coordinates).to.deep.equal(testData[1].coordinates);
  });

  it('it should add a third user location', async () => {
    const res = await agent
      .put('/api/location')
      .send(testData[2]);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("username", testData[2].username);
    expect(res.body.location.coordinates).to.deep.equal(testData[2].coordinates);
  });

  
  it('it should update the second user location', async () => {
    const res = await agent
      .put('/api/location')
      .send(updatedData[0]);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("username", updatedData[0].username);
    expect(res.body.location.coordinates).to.deep.equal(updatedData[0].coordinates);
  });

  it('it should not update a nonexistent user location', async () => {
    const res = await agent
      .put('/api/location')
      .send({username: "DoesNotExist", coordinates: [51.5074, -0.1278]});
    expect(res).to.have.status(404);
    const count = await Location.find({}).count();
    expect(count).to.equal(3);
  });

  it('it should get a list of user locations', async () => {
    const res = await agent
      .get('/api/location/' + groupId + '/')

    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal([
      { username: 'user1', coordinates: [ 40.7128, -74.006 ] },
      { username: 'user2', coordinates: [ 34.0522, -118.2437 ] },
      { username: 'user3', coordinates: [ -33.8688, 151.2093 ] }
    ]);
  });

    
});