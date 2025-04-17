import StoryModel from './StoryModel.js';
import { StoryDB } from './db.js';
import UI from './UI.js';
import Home from './Home.js';
import AddStory from './AddStory.js';
import Profile from './Profile.js';

let stream;

const StoryPresenter = {
  init() {
    this.initRouter();
    this.initEventListeners();
    this.updateAuthUI();
  },
  
  initRouter() {
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    this.handleRouteChange();
  },
  
  handleRouteChange() {
    const hash = window.location.hash || '#/';
    const routes = {
      '#/': Home.renderHome.bind(Home),
      '#/add-story': AddStory.renderAddStory.bind(AddStory),
      '#/profile': Profile.renderProfile.bind(Profile),
    };
    
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        const render = routes[hash] || routes['#/'];
        render();
        
        document.querySelectorAll('.nav-item').forEach(item => {
          if (item.getAttribute('href') === hash) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      });
    } else {
      const render = routes[hash] || routes['#/'];
      render();
      
      document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('href') === hash) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  },
  
  async fetchAndCacheStories() {
    try {
      const stories = await StoryModel.getAllStories(1, 20, 1);
      await StoryDB.clearStories();
      stories.forEach(story => StoryDB.saveStory(story));
      return stories;
    } catch (error) {
      console.log("Offline mode: Loading stories from IndexedDB");
      return await StoryDB.getStories();
    }
  },
  
  async showStoryDetail(storyId) {
    const modal = document.getElementById('story-detail-modal');
    const container = document.getElementById('story-detail-container');
    
    container.innerHTML = `
      <div class="loader">
        <div class="spinner"></div>
      </div>
    `;
    
    modal.style.display = 'block';
    
    try {
      const story = await StoryModel.getStoryDetail(storyId);
      
      container.innerHTML = `
        <div class="story-detail">
          <img src="${story.photoUrl}" alt="Photo for story by ${story.name}" class="story-detail-image">
          <div class="story-detail-info">
            <div>
              <h3>${story.name}'s Story</h3>
              <p><i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <p>${story.description}</p>
          ${story.lat && story.lon ? `<div id="detail-map" class="story-map"></div>` : ''}
        </div>
      `;
      
      if (story.lat && story.lon) {
        setTimeout(() => {
          const detailMap = L.map('detail-map').setView([story.lat, story.lon], 13);
          
          const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          });
          
          const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
          });
          
          const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
          });
          
          const baseLayers = {
            "Street": streetLayer,
            "Satellite": satelliteLayer,
            "Topographic": topoLayer
          };
          
          streetLayer.addTo(detailMap);
          
          L.control.layers(baseLayers).addTo(detailMap);
          
          L.marker([story.lat, story.lon])
            .addTo(detailMap)
            .bindPopup(`<strong>${story.name}'s Story</strong><br>${story.description.substring(0, 100)}...`)
            .openPopup();
        }, 100);
      }
    } catch (error) {
      container.innerHTML = `<p class="error">Error loading story details: ${error.message}</p>`;
    }
  },

  initEventListeners() {
    document.getElementById('login-button').addEventListener('click', () => {
      document.getElementById('login-modal').style.display = 'block';
    });
    
    document.getElementById('register-button').addEventListener('click', () => {
      document.getElementById('register-modal').style.display = 'block';
    });
    
    document.getElementById('logout-button').addEventListener('click', () => {
      StoryModel.logout();
      this.updateAuthUI();
      this.showNotification('Logged out successfully');
      window.location.hash = '#/';
    });
    
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        await StoryModel.login(email, password);
        document.getElementById('login-modal').style.display = 'none';
        this.updateAuthUI();
        this.showNotification('Logged in successfully');
        window.location.hash = '#/';
      } catch (error) {
        this.showNotification(error.message, true);
      }
    });
    
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      
      try {
        await StoryModel.register(name, email, password);
        document.getElementById('register-modal').style.display = 'none';
        this.showNotification('Registration successful. Please login.');
      } catch (error) {
        this.showNotification(error.message, true);
      }
    });
    
    document.querySelectorAll('.close').forEach(close => {
      close.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
          modal.style.display = 'none';
        });
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
        }
      });
    });
    
    window.addEventListener('click', (e) => {
      document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
          modal.style.display = 'none';
          
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
          }
        }
      });
    });
  },
  
  updateAuthUI() {
    UI.updateAuthUI();
  },
  
  showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    notification.classList.remove('hidden', 'error');
    
    if (isError) {
      notification.classList.add('error');
    }
    
    notificationMessage.textContent = message;
    
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  },
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
};

export default StoryPresenter;