import axios from "axios";

export default axios.create({
  baseURL: "https://staging-api.internal-streamflow.com/v1/api",
  headers: {
    "Content-type": "application/json",
  },
});
