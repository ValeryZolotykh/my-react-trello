// Configuration object for API requests. The baseURL is set to the value of the environment variable REACT_APP_API_URL,
// or an empty string if the variable is not defined.
export default {
  baseURL: process.env.REACT_APP_API_URL || '' //
};