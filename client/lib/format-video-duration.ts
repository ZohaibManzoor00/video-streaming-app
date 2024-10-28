export const formatDuration = (durationStr: string): string => {
    const totalSeconds = parseFloat(durationStr);
  
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0 seconds';
  
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
  
    let formattedDuration = `${seconds} second${seconds !== 1 ? 's' : ''}`;
  
    if (minutes > 0) {
      formattedDuration = `${minutes} minute${minutes > 1 ? 's' : ''}`;
      if (seconds > 0) formattedDuration += ` and ${seconds} second${seconds > 1 ? 's' : ''}`;
    } 
  
    return formattedDuration;
  }