// Singleton to prevent multiple sounds from playing simultaneously
let isPlaying = false;

export function playAlertSound() {
  if (isPlaying) return;
  
  isPlaying = true;
  const audio = new Audio('/alert.wav');
  
  audio.addEventListener('ended', () => {
    isPlaying = false;
  });
  
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
    isPlaying = false;
  });
}
