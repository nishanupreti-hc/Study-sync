// Pomodoro Settings Management
const SETTINGS_KEY = 'pomodoroSettings';

const defaultSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartWork: false,
  soundNotifications: true,
  cameraMonitoring: false,
  faceDetectionMode: 'manual', // 'manual' or 'automatic'
  autoFaceControl: false // Auto pause/resume based on face detection
};

export const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const resetSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  } catch (error) {
    console.error('Error resetting settings:', error);
    return defaultSettings;
  }
};
