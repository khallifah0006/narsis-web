const BASE_URL = 'https://story-api.dicoding.dev/v1';

const StoryModel = {
  async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      localStorage.setItem('token', data.loginResult.token);
      localStorage.setItem('userId', data.loginResult.userId);
      localStorage.setItem('name', data.loginResult.name);
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async register(name, email, password) {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
  },
  
  async getAllStories(page = 1, size = 10, location = 0) {
    try {
      let url = `${BASE_URL}/stories?page=${page}&size=${size}&location=${location}`;
      
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data.listStory;
    } catch (error) {
      throw error;
    }
  },
  
  async getStoryDetail(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data.story;
    } catch (error) {
      throw error;
    }
  },
  
  async addStory(description, photoBlob, lat, lon) {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoBlob);
      
      if (lat && lon) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }
      
      let url = `${BASE_URL}/stories`;
      const headers = {};
      const token = localStorage.getItem('token');
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        url = `${BASE_URL}/stories/guest`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async subscribeNotification(subscription) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
          },
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  async unsubscribeNotification(subscription) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default StoryModel;