import axios from "axios";

const API = axios.create({
  baseURL: "http://172.17.240.89:3000/api",
});

export const submitVote = (data) => API.post("/votes", data);

export const changeVote = (data) => API.post("/redact", data);

export const getResults = () => API.get("/results");
