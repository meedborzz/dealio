// Sound utility functions for the application
export const playSuccessSound = () => {
  try {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.7; // Set volume to 70%
    audio.play().catch(error => {
      console.warn('Could not play success sound:', error);
    });
  } catch (error) {
    console.warn('Audio not supported or file not found:', error);
  }
};

export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.5; // Slightly quieter for notifications
    audio.play().catch(error => {
      console.warn('Could not play notification sound:', error);
    });
  } catch (error) {
    console.warn('Audio not supported or file not found:', error);
  }
};