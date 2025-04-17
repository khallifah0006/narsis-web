const UI = {
    updateAuthUI() {
      const loginButton = document.getElementById('login-button');
      const registerButton = document.getElementById('register-button');
      const logoutButton = document.getElementById('logout-button');
      const profileLink = document.getElementById('profile-link');
      
      const token = localStorage.getItem('token');
      
      if (token) {
        loginButton.classList.add('hidden');
        registerButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        profileLink.classList.remove('hidden');
      } else {
        loginButton.classList.remove('hidden');
        registerButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
        profileLink.classList.add('hidden');
      }
    }
  };
  
  export default UI;