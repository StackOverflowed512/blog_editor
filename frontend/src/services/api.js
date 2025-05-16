// frontend/src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:5001/api/blogs"; // Your Flask backend URL

export const getAllBlogs = () => {
    return axios.get(API_URL);
};

export const getBlogById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

export const saveDraft = (blogData) => {
    // If blogData has an ID, it's an update, otherwise it's a new draft
    return axios.post(`${API_URL}/save-draft`, blogData);
};

export const publishBlog = (blogData) => {
    return axios.post(`${API_URL}/publish`, blogData);
};

export const deleteBlog = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
