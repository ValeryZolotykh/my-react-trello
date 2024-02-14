import axios, { AxiosError, AxiosResponse } from "axios";
import { api } from "../common/constants";
import store from "../store/store";
import { startRequest, endRequest } from "../actions/actions"; // These actions are designed to manage the loading state in Redux.

/**
 * This code adds global interceptors for requests and responses that allow you to track the start and completing
 * requests. Using Redux, it also manages the loading state of the application. When a request starts, the load counter
 * is incremented, and when the request completes (successfully or with error), the counter decreases. This can be
 * useful for showing the user a loading indicator. */

// Define action types for start and end request.
interface StartRequestAction {
  type: "START_REQUEST";
}

interface EndRequestAction {
  type: "END_REQUEST";
}

// Create axios instance with base URL and default headers.
const instance = axios.create({
  baseURL: api.baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer 123",
  },
});

/* Add request interceptor to dispatch startRequest action before making a request. This code will be executed before
 each request.*/
instance.interceptors.request.use((config) => {
  store.dispatch(<StartRequestAction>startRequest()); // Dispatch startRequest action.
  return config; // Return modified request configuration.
});

/* Add response interceptor to dispatch endRequest action after receiving a response. This code will be executed after
  receiving a response or in case of error.*/
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Dispatch endRequest action for successful response.
    store.dispatch<EndRequestAction>(<EndRequestAction>endRequest());
    return response;
  },
  (error: AxiosError) => {
    // Dispatch endRequest action in case of an error response.
    store.dispatch<EndRequestAction>(<EndRequestAction>endRequest());
    return Promise.reject(error); // Returns a rejected promise to report an error.
  },
);

export default instance;
