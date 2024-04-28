function send(method, url, data, cookie){
  const headers = { "Content-Type": "application/json" };
  if (cookie) {
    headers["Cookie"] = cookie;
  }
  return fetch(`${process.env.NEXT_PUBLIC_BACKEND}${url}`, {
    method: method,
    headers: headers,
    body: (data)? JSON.stringify(data): null,
    credentials: "include"
  })
  .then(res => {
    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      } else {
        return res.text();
      }
    } 
  }) 
}

export function getAuthenticatedUser(cookie) {
  return send("GET", "/api/auth/", null, cookie);
}

export function register(username, password) {
  return send("POST", "/api/auth/register/", { username, password });
}

export function login(username, password, token) {
  return send("POST", "/api/auth/login/", { username, password, token });
}

export function logout() {
  return send("GET", "/api/auth/logout/", null);
}

export function enable2FA() {
  return send("GET", "/api/auth/2fa/enable/", null);
}

export function verify2FA(token) {
  return send("POST", "/api/auth/2fa/verify/", { token });
}

export function disable2FA() {
  return send("GET", "/api/auth/2fa/disable/", null);
}

// group 
export function createGroup(title) {
  return send("POST", "/api/groups/", { title });
}

export function getGroup(group_id) {
  return send("GET", "/api/groups/" + group_id + "/", null);
}

export function deleteGroup(group_id) {
  return send("DELETE", "/api/groups/" + group_id + "/", null);
}

export function getGroupMembers(group_id, cookie) {
  return send("GET", "/api/groups/" + group_id + "/members", null, cookie ? cookie : null);
}

export function getGroupsForMember(username) {
  return send("GET", "/api/groups/member/" + username + "/", null);
}

export function inviteToGroup(group_id) {
  return send("POST", "/api/groups/invite/", { group_id });
}

export function joinGroup(code) {
  return send("PUT", "/api/groups/join/", { code });
}

export function leaveGroup(group_id, username) {
  return send("PUT", "/api/groups/leave/", { group_id, username });
}

export function removeFromGroup(group_id, username) {
  return send("PUT", "/api/groups/remove/", { group_id, username });
}

export function getInvitationCode(group_id) {
  return send("GET", "/api/groups/invite/" + group_id, null);
}

// locations
export function getAllUserLocations(group_id) {
  return send("GET", "/api/locations/" + group_id, null);
}

export function getLocationSetting(username) {
  return send("GET", "/api/locations/setting/" + username, null);
}

export function updateLocationSetting (username, isManual) {
  return send("PUT", "/api/locations/setting/", { username, isManual });
}

// events
export function getEvents(group_id) {
  return send("GET", "/api/events/" + group_id, null);
};
export function createEvent(title, location, description, date, group_id) {
  return send("POST", "/api/events/", { title, location, description, date, group_id });
};

/*
  Query:
  how to group a string field of all objects of an array into a single string separated by a comma?

  Response:
  // Sample array of objects
  const arrayOfObjects = [
    { name: 'John', age: 25 },
    { name: 'Jane', age: 30 },
    { name: 'Bob', age: 22 }
  ];

  // Extract the 'name' field from each object and join them with a comma
  const namesString = arrayOfObjects.map(obj => obj.name).join(', ');

  // Output the result
  console.log(namesString);
*/
export function createRestaurantEvent(restaurant, date, group_id) {
  return send("POST", "/api/events/restaurant", { title: restaurant.name, 
                                                  location: restaurant.location.address1,
                                                  description: restaurant.categories.map(item => item.title).join(', '),
                                                  price: restaurant.price ? restaurant.price : null,
                                                  rating: restaurant.rating,
                                                  review_count: restaurant.review_count,
                                                  date, 
                                                  group_id });
};
export function updateResponse(event_id, attending) {
  return send("PUT", "/api/events/" + event_id, { attending });
}

export function deleteEvent(event_id) {
  return send("DELETE", "/api/events/" + event_id);
}

export function searchYelp(term, latitude, longitude, distance, page) {
  return send("GET", "/api/yelp/?term=" + term + 
                               "&latitude=" + latitude + 
                               "&longitude=" + longitude +
                               "&distance=" + distance +
                               "&page=" + page, null);
}

// weather

export function getWeather(coordinates) {
  const [lat, lon] = coordinates;

  // Weather API implementation was inspired by https://openweathermap.org/current
  return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric`)
    .then(res => {
      if (res.ok) {
        return res.json();
      } 
    })
}