import { StoryDB } from './db.js';
import StoryPresenter from './StoryPresenter.js';


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  StoryPresenter.init();
  await StoryPresenter.fetchAndCacheStories();
});