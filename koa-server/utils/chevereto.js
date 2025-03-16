// utils/chevereto.js
import axios from 'axios';
import FormData from 'form-data';

export const uploadImage = async (fileBuffer) => {
  const form = new FormData();
  form.append('source', fileBuffer, { filename: 'upload.jpg' });
  
  const response = await axios.post(`$${process.env.CHEVERETO_API}/upload`, form, {
    headers: form.getHeaders(),
    params: { key: process.env.CHEVERETO_API_KEY }
  });
  
  return response.data.image.url;
};
