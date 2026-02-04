import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format timestamp to readable time
 */
export function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

/**
 * Format timestamp to readable date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get icon name based on action type
 */
export function getActionIcon(actionType) {
  const iconMap = {
    create_trello_card: 'CheckSquare',
    create_calendar_event: 'Calendar',
    create_notion_note: 'FileText',
    send_slack_message: 'MessageSquare',
    get_todays_events: 'Calendar',
    get_pending_tasks: 'List',
  };
  return iconMap[actionType] || 'Zap';
}

/**
 * Get color based on action status
 */
export function getStatusColor(status) {
  const colorMap = {
    pending: 'text-warning',
    success: 'text-success',
    failed: 'text-error',
  };
  return colorMap[status] || 'text-text-secondary';
}

/**
 * Get integration color
 */
export function getIntegrationColor(type) {
  const colorMap = {
    trello: '#0079BF',
    calendar: '#4285F4',
    notion: '#000000',
    slack: '#4A154B',
  };
  return colorMap[type] || '#667eea';
}

/**
 * Convert audio buffer to base64
 */
export function audioBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convert base64 to audio buffer
 */
export function base64ToAudioBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if browser supports required audio APIs
 */
export function checkAudioSupport() {
  return {
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    mediaRecorder: !!window.MediaRecorder,
  };
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { granted: true, error: null };
  } catch (error) {
    return { granted: false, error: error.message };
  }
}