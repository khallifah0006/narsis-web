import StoryPresenter from './StoryPresenter.js';

const Home = {
  async renderHome() {
    const appContainer = document.getElementById('app');
    
    appContainer.innerHTML = `
      <h2>Recent Stories</h2>
      <div class="loader" id="stories-loader">
        <div class="spinner"></div>
      </div>
      <div class="stories-container"></div>
    `;
    
    try {
      const stories = await StoryPresenter.fetchAndCacheStories();
      const storiesContainer = document.querySelector('.stories-container');
      const loader = document.getElementById('stories-loader');
      
      if (stories.length === 0) {
        storiesContainer.innerHTML = '<p>No stories found. Be the first to share a story!</p>';
      } else {
        storiesContainer.innerHTML = stories.map(story => `
          <article class="story-card">
            <img src="${story.photoUrl}" alt="Photo for story by ${story.name}" class="story-image">
            <div class="story-content">
              <div class="story-author">
                <i class="fas fa-user author-icon"></i>
                <span>${story.name}</span>
              </div>
              <h3 class="story-title">Story by ${story.name}</h3>
              <p class="story-description">${story.description}</p>
              <div class="story-meta">
                <span><i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString()}</span>
                <button class="story-detail-button" data-id="${story.id}">View Details</button>
              </div>
            </div>
          </article>
        `).join('');
        
        document.querySelectorAll('.story-detail-button').forEach(button => {
          button.addEventListener('click', async () => {
            const storyId = button.getAttribute('data-id');
            StoryPresenter.showStoryDetail(storyId);
          });
        });
      }
      
      
      if (loader) {
        loader.remove();
      }
    } catch (error) {
      const loader = document.getElementById('stories-loader');
      
      if (loader) {
        loader.remove();
      }
      StoryPresenter.showNotification(error.message, true);
    }
  }
};

export default Home;