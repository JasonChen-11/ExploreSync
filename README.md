# ExploreSync

## Project URL

https://exploresync.tech/

## Project Description

ExploreSync is an event planning app meant to be utilized for planning outings with friends. The app provides several features that will be useful in the planning process. One feature that was implemented was a live chat where group members can discuss future events or activities they would like to participate in. Another crucial feature of the app is the live map. This map gathers and displays the location information of each user in the group, and the location information of each user is updated for each connected group member in real time. This map, with the help of a Yelp API, allows group members to search for local restaurants or hotels, based on a user’s location or the central location of all users. Using these restaurants and hotels, group members can then pick a location and schedule an event to be held at a certain time. These events can be seen and responded to on an events page. Furthermore, a calendar is displayed for group members to view scheduled events on their group calendar on a calendar page. Overall this app provides the necessities needed for group event planning. 

## Development

### Tech Stack
The overall application was built using the MERN stack, with Next.js on top of React.js. For the frontend, we used Chakra UI to build and style the majority of our components. For the backend, we used MongoDB Atlas, so the database is hosted on the cloud. We used Mongoose on top of MongoDB to build our models and perform queries on our data. We organized our file structure with routes, controllers, models, middlewares, and sockets so that it was easier to manage any conflicts when working together.

### Authentication
The simple authentication, login and register, used express sessions and bcrypt hashing. When a user logs in, we store these sessions persistently using MongoStore. We also enforced routing rules to ensure that authenticated users cannot access the login/register page and unauthenticated users cannot access any of the pages that required the user to be logged in. For 2FA, we used the libraries otplib to generate the secret token for authenticating, and qrcode to display to the user to enable the feature.

### Notifications
For the chat and group notifications, we created a model that stores unread notifications for every user in specific groups. We initialized the socket connection when a user joins a group to ensure that the socket is enabled for all components within that group, so it allowed us to emit events through the socket within any component we wanted. This enabled us to implement and integrate live and persistent notifications.

### Groups
The invitations to groups were created and inserted to a particular MongoDB collection that automatically deletes the documents after 10 minutes, whereas the 6-digit invitation code is randomly generated in the backend using JavaScript. 

### Events
Users can either add restaurants as events by choosing the date and time of the event, or they can create their own custom events by inputting a title, description, data and time. Events created can be distinguished by the price, rating, and review_count fields in which the values are provided by the search results from Yelp API. All events are also categorized into past events and upcoming events based on the date and this was done using moment.js. Users can change their responses to upcoming events which will then notify all other users in the group.

### Yelp API
Yelp API was used to search for places of interest such as restaurants and hotels near a specific coordinate. The coordinates are then extracted from the data returned by the API to display the search results on the map. Pagination was also implemented within the API request to deal with a large set of data.

### Map
The map was implemented using the react-leaflet library. Other APIs like the Geolocation API (for user location), and Yelp API (for restaurant/hotel location) were used to collect location coordinates and display them as markers on the react-leaflet map. Additionally, geolib library was used to calculate the center of all coordinates and socket.io sockets were used to implement live location/map updates. Whenever a user location was updated, a socket would emit the new location, the backend would listen for it, update the new location in the database, and emit the new location back to all sockets connected in the group. The socket from the map component would listen for new location events, and appropriately update the set of user locations, which are then updated on the map. 

### Livechat
The live chat follows a similar approach with the map. Sockets (from socket.io) are the foundation to the implementation of our live chat. The chatBox component has a socket which listens for new users, new messages, and notifications. It also emits when a new message is added, so the backend can listen for this event, write the new message to the database, and then emit this new message to all sockets in the group.
