import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  StreakData,
  StreakCalendars,
  calculateCurrentStreak,
  calculateLongestStreak,
  STREAK_CALENDARS_KEY,
} from '@/lib/streakUtils';

interface StreakCalendarState {
  calendars: StreakCalendars;
  currentCalendarId: string;
  isLoading: boolean;
}

// Load initial state from localStorage
const loadInitialState = (): StreakCalendarState => {
  if (typeof window === 'undefined') {
    return {
      calendars: {},
      currentCalendarId: '',
      isLoading: false,
    };
  }

  try {
    const stored = localStorage.getItem(STREAK_CALENDARS_KEY);
    let calendars: StreakCalendars = stored ? JSON.parse(stored) : {};

    // Validate and sanitize loaded data
    const sanitizedCalendars: StreakCalendars = {};
    Object.entries(calendars).forEach(([id, calendar]) => {
      if (calendar && typeof calendar === 'object' && calendar.id && calendar.title) {
        sanitizedCalendars[id] = {
          id: calendar.id,
          title: calendar.title,
          completedDates: Array.isArray(calendar.completedDates) ? calendar.completedDates : [],
          currentStreak: typeof calendar.currentStreak === 'number' ? calendar.currentStreak : 0,
          longestStreak: typeof calendar.longestStreak === 'number' ? calendar.longestStreak : 0,
          createdDate: calendar.createdDate || new Date().toISOString().split('T')[0],
          color: calendar.color || '#10B981',
          description: calendar.description,
        };
      }
    });

    const calendarIds = Object.keys(sanitizedCalendars);

    return {
      calendars: sanitizedCalendars,
      currentCalendarId: calendarIds.length > 0 ? calendarIds[0] : '',
      isLoading: false,
    };
  } catch (error) {
    console.error('Error loading streak calendars from localStorage:', error);
    return {
      calendars: {},
      currentCalendarId: '',
      isLoading: false,
    };
  }
};

// Save to localStorage helper
const saveToLocalStorage = (calendars: StreakCalendars) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STREAK_CALENDARS_KEY, JSON.stringify(calendars));
  } catch (error) {
    console.error('Error saving streak calendars to localStorage:', error);
  }
};

const initialState: StreakCalendarState = loadInitialState();

const streakCalendarSlice = createSlice({
  name: 'streakCalendar',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Load calendars from localStorage
    loadCalendars: (state) => {
      const loadedState = loadInitialState();
      state.calendars = loadedState.calendars;
      state.currentCalendarId = loadedState.currentCalendarId;
      state.isLoading = false;
    },

    // Set current calendar
    setCurrentCalendar: (state, action: PayloadAction<string>) => {
      state.currentCalendarId = action.payload;
    },

    // Create new streak calendar
    createCalendar: (state, action: PayloadAction<{ title: string; color: string; description?: string }>) => {
      const { title, color, description } = action.payload;
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

      state.calendars[newCalendar.id] = newCalendar;
      state.currentCalendarId = newCalendar.id;
      
      // Save to localStorage
      saveToLocalStorage(state.calendars);
    },

    // Delete streak calendar
    deleteCalendar: (state, action: PayloadAction<string>) => {
      const calendarId = action.payload;
      if (state.calendars[calendarId]) {
        delete state.calendars[calendarId];
        
        // If deleted calendar was current, switch to another one
        if (state.currentCalendarId === calendarId) {
          const remainingIds = Object.keys(state.calendars);
          state.currentCalendarId = remainingIds.length > 0 ? remainingIds[0] : '';
        }
        
        // Save to localStorage
        saveToLocalStorage(state.calendars);
        
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
      }
    },

    // Toggle date completion
    toggleDate: (state, action: PayloadAction<{ calendarId: string; date: string }>) => {
      const { calendarId, date } = action.payload;
      const calendar = state.calendars[calendarId];
      
      if (!calendar) return;

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

      // Save to localStorage
      saveToLocalStorage(state.calendars);
    },

    // Update calendar (for editing title, description, etc.)
    updateCalendar: (state, action: PayloadAction<{ calendarId: string; updates: Partial<StreakData> }>) => {
      const { calendarId, updates } = action.payload;
      const calendar = state.calendars[calendarId];
      
      if (calendar) {
        Object.assign(calendar, updates);
        
        // Save to localStorage
        saveToLocalStorage(state.calendars);
      }
    },

    // Bulk update calendars (for syncing with localStorage)
    setCalendars: (state, action: PayloadAction<StreakCalendars>) => {
      state.calendars = action.payload;
      saveToLocalStorage(state.calendars);
    },

    // Reset state
    resetStreakCalendar: (state) => {
      state.calendars = {};
      state.currentCalendarId = '';
      state.isLoading = false;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STREAK_CALENDARS_KEY);
      }
    },
  },
});

export const {
  setLoading,
  loadCalendars,
  setCurrentCalendar,
  createCalendar,
  deleteCalendar,
  toggleDate,
  updateCalendar,
  setCalendars,
  resetStreakCalendar,
} = streakCalendarSlice.actions;

export default streakCalendarSlice.reducer;

// Selectors
export const selectAllCalendars = (state: { streakCalendar: StreakCalendarState }) => state.streakCalendar.calendars;
export const selectCurrentCalendarId = (state: { streakCalendar: StreakCalendarState }) => state.streakCalendar.currentCalendarId;
export const selectCurrentCalendar = (state: { streakCalendar: StreakCalendarState }) => {
  const { calendars, currentCalendarId } = state.streakCalendar;
  return currentCalendarId ? calendars[currentCalendarId] : null;
};
export const selectCalendarById = (state: { streakCalendar: StreakCalendarState }, calendarId: string) => 
  state.streakCalendar.calendars[calendarId];
export const selectIsLoading = (state: { streakCalendar: StreakCalendarState }) => state.streakCalendar.isLoading;
export const selectCalendarCount = (state: { streakCalendar: StreakCalendarState }) => 
  Object.keys(state.streakCalendar.calendars).length;
