import { Server } from "socket.io";
import { addMessage, getMessages } from "../controllers/chatController.mjs";
import { updateLocation } from "../controllers/locationController.mjs";
import { addCount, getCount, clearCount } from "../controllers/notificationCounterController.mjs";
import { getNotifications, addNotification } from "../controllers/notificationController.mjs";


/* Prompt: How do I set up sockets for a chat room using Socket.io and React?

  Response:
  Handle Chat Events:

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (message) => {
      console.log(`Message: ${message}`);
      // Broadcast the message to all connected clients
      io.emit('chat message', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

*/
export function groupSocket(httpServer) {

    const io = new Server(httpServer, {
        cors: {
          origin: process.env.FRONTEND,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: 'Content-Type',
        },
    });

    // Chat events =====
    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('join', async (username, group_id) => {
            socket.join(group_id);
            socket.data = { username, group_id };
            console.log(`User: ${username} joined`);
            updateUsersInRoom(group_id, username);
        
            getMessages(group_id)
            .then((messages)=> {
                socket.emit('get messages', messages);
            })
            .catch((err) => {
                console.log("error failed to retrieve messages");
                socket.emit('error', 'Failed to retrieve messages');
            })

            getCount({ group_id, username }, "chat_count")
            .then((chatCount) => {
                socket.emit('get chat notification count', chatCount);
            }).catch((err) => {
                console.log("error failed to retrieve group notification count");
                socket.emit('error', 'Failed to retrieve group notification count');
            })

            getNotifications(group_id)
            .then(notifications => {
                socket.emit('get group notifications', notifications);
            }).catch((err) => {
              console.log("error failed to retrieve group notifications");
              socket.emit('error', 'Failed to retrieve group notifications');
            })

            getCount({ group_id, username }, "group_count")
            .then((notificationCount) => {
                socket.emit('get group notification count', notificationCount);
            }).catch((err) => {
                console.log("error failed to retrieve group notification count");
                socket.emit('error', 'Failed to retrieve group notification count');
            })
        });
        
        // New messages
        socket.on('add message', async (message) => {
          try {
            const msg = await addMessage(message);
            await addCount(message.group_id, message.username, "chat_count");
            io.to(msg.group_id).emit('new message', msg);
          } catch(err) {
            console.log("error failed to add message");
            socket.emit('error', 'Failed to add message');
          }
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected');
            if (socket.data && socket.data.group_id) {
                updateUsersInRoom(socket.data.group_id);
            }
            });
            
        // Location events =====

        socket.on('update location', async (location) => {
            updateLocation(location)
            .then((loc) => {
                io.to(loc.group_id).emit('new location', loc);
            })
        });

        // Chat notification count
        socket.on('chat read', async (userInfo) => {
            clearCount(userInfo, "chat_count")
            .then((newCount) => {
              socket.emit('get chat notification count', newCount);
            })
        })

        socket.on('update chat notification count', async (userInfo) => {
            getCount(userInfo, "chat_count")
            .then((newCount) => {
              socket.emit('get chat notification count', newCount);
            })
        })

        // New notifications
        socket.on('add group notification', async (notification) => {
          try {
            const notif = await addNotification(notification);
            await addCount(notification.group_id, notification.username, "group_count");
            io.to(notif.group_id).emit('new group notification', notif);
          } catch(err) {
            console.log("error failed to add group notification");
            socket.emit('error', 'Failed to add group notification');
          }
        });

        // Group notification count
        socket.on('group notification read', async (userInfo) => {
            clearCount(userInfo, "group_count")
            .then((newCount) => {
              socket.emit('get group notification count', newCount);
            })
        })
        socket.on('update group notification count', async (userInfo) => {
            getCount(userInfo, "group_count")
            .then((newCount) => {
              socket.emit('get group notification count', newCount);
            })
      })


    });
    
    const updateUsersInRoom = async (group_id, username) => {
        const onlineSockets =  await io.in(group_id).fetchSockets()
        const usersInRoom = Object.values(onlineSockets).map((socket) => 
            socket.data.username,
        );

        io.to(group_id).emit('updateUsers', { onlineUsers: usersInRoom, newUser: username });
    }


}

export default groupSocket;