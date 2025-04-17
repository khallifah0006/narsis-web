import StoryModel from './StoryModel.js';
import StoryPresenter from './StoryPresenter.js';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const Profile = {
  renderProfile() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');
    let pushSubscription = null;
    
    if (!token) {
      StoryPresenter.showNotification('Please login to view your profile', true);
      window.location.hash = '#/';
      return;
    }
    
    const appContainer = document.getElementById('app');
    
    const initials = userName ? userName.charAt(0).toUpperCase() : 'U';
    
    appContainer.innerHTML = `
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar">${initials}</div>
          <h2 class="profile-name">${userName || 'User'}</h2>
          <p class="profile-email">User ID: ${userId || 'Unknown'}</p>
        </div>
        
        <div class="notifications-section">
          <h3>Push Notifications</h3>
          <p>Get notified when your stories are published.</p>
          
          <div class="toggle-container">
            <label class="toggle-switch">
              <input type="checkbox" id="notifications-toggle">
              <span class="slider"></span>
            </label>
            <span>Enable Push Notifications</span>
          </div>
        </div>
      </div>
    `;
    
    const notificationsToggle = document.getElementById('notifications-toggle');
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('./script/service-worker.js')
        .then(async (registration) => {
          const subscription = await registration.pushManager.getSubscription();
          
          if (subscription) {
            pushSubscription = subscription;
            notificationsToggle.checked = true;
          }
          
          notificationsToggle.addEventListener('change', async () => {
            if (notificationsToggle.checked) {
              try {
                const subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: StoryPresenter.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
                
                pushSubscription = subscription;
                
                await StoryModel.subscribeNotification(subscription);
                
                StoryPresenter.showNotification('Push notifications enabled');
              } catch (error) {
                notificationsToggle.checked = false;
                StoryPresenter.showNotification('Failed to enable push notifications: ' + error.message, true);
              }
            } else {
              try {
                if (pushSubscription) {
                  await StoryModel.unsubscribeNotification(pushSubscription);
                  await pushSubscription.unsubscribe();
                  
                  pushSubscription = null;
                  StoryPresenter.showNotification('Push notifications disabled');
                }
              } catch (error) {
                StoryPresenter.showNotification('Failed to disable push notifications: ' + error.message, true);
              }
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
          notificationsToggle.disabled = true;
          notificationsToggle.parentElement.nextElementSibling.textContent = 'Push notifications not available';
        });
    } else {
      notificationsToggle.disabled = true;
      notificationsToggle.parentElement.nextElementSibling.textContent = 'Push notifications not supported on this browser';
    }
  }
};

export default Profile;