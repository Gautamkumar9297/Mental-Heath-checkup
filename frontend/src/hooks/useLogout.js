import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear auth state
    logout();
    
    // Clear any additional app state
    // Clear chat history if needed
    localStorage.removeItem('mindcare-chat-history');
    
    // Clear any temporary data
    sessionStorage.clear();
    
    // Navigate to login page and replace history so user can't go back
    navigate('/login', { replace: true });
    
    // Show a temporary success message (you can integrate with a toast library later)
    const showLogoutMessage = () => {
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      message.textContent = 'Successfully logged out!';
      document.body.appendChild(message);
      
      setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(message);
        }, 300);
      }, 2000);
    };
    
    // Show the message after a brief delay to ensure navigation is complete
    setTimeout(showLogoutMessage, 100);
    
    console.log('Successfully logged out');
  };

  return handleLogout;
};
