import StoryModel from './StoryModel.js';
import StoryPresenter from './StoryPresenter.js';

const DEFAULT_MAP_CENTER = [-6.2088, 106.8456];

const AddStory = {
  async renderAddStory() {
    const appContainer = document.getElementById('app');
    let stream;
    let marker;
    let map;
    
    appContainer.innerHTML = `
      <div class="form-container">
        <h2 class="form-title">Share Your Story</h2>
        <form id="add-story-form">
          <div class="camera-container">
            <label>Take a Photo</label>
            <div class="camera-preview" id="camera-preview">
              <i class="fas fa-camera fa-3x"></i>
            </div>
            <div class="camera-buttons">
              <button type="button" id="start-camera" class="btn btn-secondary">
                <i class="fas fa-camera"></i> Start Camera
              </button>
              <button type="button" id="capture-photo" class="btn btn-primary" disabled>
                <i class="fas fa-camera-retro"></i> Capture
              </button>
              <button type="button" id="retry-photo" class="btn btn-danger" disabled>
                <i class="fas fa-redo"></i> Retry
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="story-description">Description</label>
            <textarea id="story-description" rows="4" required></textarea>
          </div>
          
          <div>
            <label>Select Location (Click on the map)</label>
            <div id="add-map" class="add-map"></div>
            <div class="form-group">
              <label for="story-location">Selected Location</label>
              <input type="text" id="story-location" readonly>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i> Share Story
          </button>
        </form>
      </div>
    `;
    
    setTimeout(() => {
      if (L.DomUtil.get('add-map') !== null && L.DomUtil.get('add-map')._leaflet_id !== undefined) {
        L.DomUtil.get('add-map')._leaflet_id = null; 
      }
    
      map = L.map('add-map').setView(DEFAULT_MAP_CENTER, 13);
      
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
    
      streetLayer.addTo(map);
    
      map.on('click', (e) => {
        if (marker) {
          map.removeLayer(marker);
        }
        
        marker = L.marker(e.latlng).addTo(map);
        document.getElementById('story-location').value = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`;
      });
    }, 100);
    
    
    
    let capturedPhoto = null;
    const startCameraButton = document.getElementById('start-camera');
    const capturePhotoButton = document.getElementById('capture-photo');
    const retryPhotoButton = document.getElementById('retry-photo');
    const cameraPreview = document.getElementById('camera-preview');
    
    startCameraButton.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.id = 'camera-stream';
        
        cameraPreview.innerHTML = '';
        cameraPreview.appendChild(videoElement);
        
        startCameraButton.disabled = true;
        capturePhotoButton.disabled = false;
      } catch (error) {
        StoryPresenter.showNotification('Failed to access camera: ' + error.message, true);
      }
    });
    
    capturePhotoButton.addEventListener('click', () => {
      const videoElement = document.getElementById('camera-stream');
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      const capturedImage = document.createElement('img');
      capturedImage.src = canvas.toDataURL('image/jpeg');
      capturedImage.id = 'captured-image';
      
      canvas.toBlob(blob => {
        capturedPhoto = blob;
      }, 'image/jpeg');
      
      cameraPreview.innerHTML = '';
      cameraPreview.appendChild(capturedImage);
      
      capturePhotoButton.disabled = true;
      retryPhotoButton.disabled = false;
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });
    
    retryPhotoButton.addEventListener('click', () => {
      capturedPhoto = null;
      
      cameraPreview.innerHTML = '<i class="fas fa-camera fa-3x"></i>';
      
      startCameraButton.disabled = false;
      capturePhotoButton.disabled = true;
      retryPhotoButton.disabled = true;
    });
    
    document.getElementById('add-story-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!capturedPhoto) {
        StoryPresenter.showNotification('Please take a photo first', true);
        return;
      }
      
      const description = document.getElementById('story-description').value;
      let latitude = null;
      let longitude = null;
      
      if (marker) {
        latitude = marker.getLatLng().lat;
        longitude = marker.getLatLng().lng;
    }
    
    try {
      const result = await StoryModel.addStory(description, capturedPhoto, latitude, longitude);
      
      StoryPresenter.showNotification('Story shared successfully!');
      
      document.getElementById('add-story-form').reset();
      cameraPreview.innerHTML = '<i class="fas fa-camera fa-3x"></i>';
      capturedPhoto = null;
      
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      
      startCameraButton.disabled = false;
      capturePhotoButton.disabled = true;
      retryPhotoButton.disabled = true;
      
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } catch (error) {
      StoryPresenter.showNotification(error.message, true);
    }
  });
}
};

export default AddStory;