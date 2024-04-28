import { getAuthenticatedUser } from "../api/api.mjs";
import moment from "moment";

export function displayTimeStamp(message_timestamp) {
  const messageTime = moment(message_timestamp);
  const currentTime = moment();

  /*
  Query:
  How do I verify Date object is today or yesterday using moment.js?

  Response:
  const moment = require('moment');

  // Assuming you have a Date object
  const yourDateObject = new Date(); // Replace this with your actual Date object

  // Check if it's today
  const isToday = moment(yourDateObject).isSame(moment(), 'day');

  // Check if it's yesterday
  const isYesterday = moment(yourDateObject).isSame(moment().subtract(1, 'days'), 'day');

  if (isToday) {
    console.log('The date is today.');
  } else if (isYesterday) {
    console.log('The date is yesterday.');
  } else {
    console.log('The date is neither today nor yesterday.');
  }
  */

  if (currentTime.isSame(messageTime, 'day')) {
    return `Today at ${messageTime.format('h:mm A')}`;
  } else if (currentTime.subtract(1, 'days').isSame(messageTime, 'day')) {
    return `Yesterday at ${messageTime.format('h:mm A')}`;
  }
  
  return messageTime.format('MM/DD/YYYY h:mm A');
}

export function redirectLogin() {
  return {
    redirect: {
      destination: '/'
    },
  };
}

export function redirectMain() {
  return {
    redirect: {
      destination: '/main'
    },
  };
}

export async function getUser({ req }) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req.headers.cookie);
    if (!authenticatedUser) {
      return null;
    }
    return {
      props: {
        user: authenticatedUser
      },
    };
  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
}

export function showToast(toast, status, description) {
  toast({
    title: status ? 'Success' : 'Error',
    description: description,
    status: status ? 'success' : 'error',
    duration: 10000,
    isClosable: true,
  });
};