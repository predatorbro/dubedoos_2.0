export interface StreakData {
  id: string;
  title: string;
  completedDates: string[]; // ['2024-01-01', '2024-01-02']
  currentStreak: number;
  longestStreak: number;
  createdDate: string;
  color: string; // for visual differentiation
  description?: string;
}

export interface StreakCalendars {
  [key: string]: StreakData;
}

// LocalStorage key
export const STREAK_CALENDARS_KEY = 'todosForCalendar';

// Utility functions for streak calculations
export const calculateCurrentStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  const sortedDates = completedDates.sort();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = today;

  // Check if today is completed
  if (completedDates.includes(today)) {
    currentStreak = 1;
    checkDate = yesterday;
  } else if (completedDates.includes(yesterday)) {
    currentStreak = 1;
    checkDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  } else {
    return 0; // No recent completion
  }

  // Count consecutive days backwards
  while (completedDates.includes(checkDate)) {
    currentStreak++;
    const prevDate = new Date(checkDate);
    prevDate.setDate(prevDate.getDate() - 1);
    checkDate = prevDate.toISOString().split('T')[0];
  }

  return currentStreak;
};

export const calculateLongestStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  const sortedDates = completedDates.sort();
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = new Date(sortedDates[i - 1]);
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
};

export const getTotalCompleted = (completedDates: string[]): number => {
  return completedDates ? completedDates.length : 0;
};

export const isDateCompleted = (date: string, completedDates: string[]): boolean => {
  return completedDates ? completedDates.includes(date) : false;
};

export const toggleDate = (calendarId: string, date: string): StreakData | null => {
  const calendars = loadStreakCalendars();
  const calendar = calendars[calendarId];

  if (!calendar) return null;

  const dateIndex = calendar.completedDates.indexOf(date);

  if (dateIndex > -1) {
    // Remove date (uncomplete)
    calendar.completedDates.splice(dateIndex, 1);
  } else {
    // Add date (complete)
    calendar.completedDates.push(date);
  }

  // Recalculate streaks
  calendar.currentStreak = calculateCurrentStreak(calendar.completedDates);
  calendar.longestStreak = calculateLongestStreak(calendar.completedDates);

  // Save updated calendar
  calendars[calendarId] = calendar;
  saveStreakCalendars(calendars);

  return calendar;
};

export const createNewStreakCalendar = (title: string, color: string, description?: string): StreakData => {
  const newCalendar: StreakData = {
    id: `streak-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    completedDates: [],
    currentStreak: 0,
    longestStreak: 0,
    createdDate: new Date().toISOString().split('T')[0],
    color,
    description,
  };

  const calendars = loadStreakCalendars();
  calendars[newCalendar.id] = newCalendar;
  saveStreakCalendars(calendars);

  return newCalendar;
};

export const deleteStreakCalendar = (calendarId: string): boolean => {
  const calendars = loadStreakCalendars();
  if (calendars[calendarId]) {
    delete calendars[calendarId];
    saveStreakCalendars(calendars);

    // Also delete associated todos from localStorage
    if (typeof window !== "undefined") {
      try {
        const todosData = localStorage.getItem("calendarTodos");
        if (todosData) {
          const todos = JSON.parse(todosData);
          const filteredTodos = todos.filter((todo: any) => todo.calendarId !== calendarId);
          localStorage.setItem("calendarTodos", JSON.stringify(filteredTodos));
        }
      } catch (error) {
        console.error('Error deleting calendar todos:', error);
      }
    }

    return true;
  }
  return false;
};

export const loadStreakCalendars = (): StreakCalendars => {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STREAK_CALENDARS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading streak calendars:', error);
    return {};
  }
};

export const saveStreakCalendars = (calendars: StreakCalendars): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STREAK_CALENDARS_KEY, JSON.stringify(calendars));
  } catch (error) {
    console.error('Error saving streak calendars:', error);
  }
};

export const getFireEmojiCount = (streak: number): number => {
  if (streak >= 100) return 5;
  if (streak >= 30) return 4;
  if (streak >= 14) return 3;
  if (streak >= 7) return 2;
  if (streak >= 1) return 1;
  return 0;
};

export const getStreakColor = (streak: number): string => {
  if (streak >= 100) return '#FFD700'; // Gold
  if (streak >= 30) return '#FF6B35'; // Orange
  if (streak >= 14) return '#4CAF50'; // Green
  if (streak >= 7) return '#2196F3'; // Blue
  return '#9E9E9E'; // Gray
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

export const isFutureDate = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString > today;
};

export const isPastDate = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};
