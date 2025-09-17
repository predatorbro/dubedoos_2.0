"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Flame, Trophy, Calendar, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import {
  StreakData,
  StreakCalendars,
  getFireEmojiCount,
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
  isFutureDate,
  isPastDate,
} from '@/lib/streakUtils';
import {
  loadCalendars,
  setCurrentCalendar,
  createCalendar,
  deleteCalendar,
  toggleDate,
  selectAllCalendars,
  selectCurrentCalendarId,
  selectCurrentCalendar,
  selectIsLoading,
} from '@/store/features/streakCalendarSlice';
import { RootState } from '@/store/store';
import SpecButton from '../specButton';
import useConfirmDialog from '../AlertComponent';

const StreakCalendar: React.FC = () => {
  const dispatch = useDispatch();
  const calendars = useSelector(selectAllCalendars);
  const currentCalendarId = useSelector(selectCurrentCalendarId);
  const currentCalendar = useSelector(selectCurrentCalendar);
  const isLoading = useSelector(selectIsLoading);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Confirmation dialog for deletions
  const { confirm, ConfirmDialog } = useConfirmDialog({
    text: "This will permanently delete this streak calendar and all its data. This action cannot be undone."
  });

  // Load calendars on mount
  useEffect(() => {
    dispatch(loadCalendars());
  }, [dispatch]);

  const handleDateToggle = useCallback((dateString: string) => {
    if (!currentCalendarId || !currentCalendar) return;

    // Only allow toggling today's date
    if (!isToday(dateString)) {
      toast.info("You can only mark today's date as completed!");
      return;
    }

    // Check if we're completing or uncompleting today's date
    const wasCompleted = currentCalendar.completedDates ? currentCalendar.completedDates.includes(dateString) : false;
    
    // Dispatch the toggle action
    dispatch(toggleDate({ calendarId: currentCalendarId, date: dateString }));

    // Only show success messages when completing (not when uncompleting)
    if (!wasCompleted) {
      // Array of motivational success messages
      const successMessages = [
        "Great job! Today's task completed! 🔥",
        "Awesome! Another day conquered! 💪",
        "Fantastic! You're on fire! 🔥",
        "Well done! Habit streak growing! 🌟",
        "Excellent! Daily goal achieved! 🎯",
        "Amazing! You're crushing it! 💥",
        "Perfect! Day completed successfully! ✨",
        "Outstanding! Keep the momentum! 🚀",
        "Brilliant! Another win today! 🏆",
        "Superb! You're unstoppable! ⚡"
      ];

      // Show celebration for milestones (we'll need to get updated streak from state)
      setTimeout(() => {
        const updatedCalendar = calendars[currentCalendarId];
        if (updatedCalendar && updatedCalendar.currentStreak > 0 && updatedCalendar.currentStreak % 7 === 0) {
          toast.success(`🎉 ${updatedCalendar.currentStreak} day streak! Keep it up!`);
        } else {
          // Show random success message
          const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
          toast.success(randomMessage);
        }
      }, 100);
    }
    // No message when uncompleting (unticking)
  }, [currentCalendarId, currentCalendar, dispatch, calendars]);

  const handleCreateCalendar = useCallback((title: string, color: string, description?: string) => {
    dispatch(createCalendar({ title, color, description }));
    setShowCreateModal(false);
    toast.success('New streak calendar created!');
  }, [dispatch]);

  const handleDeleteCalendar = useCallback(async (calendarId: string) => {
    const calendar = calendars[calendarId];
    if (!calendar) return;

    // Show confirmation dialog
    const confirmed = await confirm();
    if (!confirmed) return;

    // Proceed with deletion
    dispatch(deleteCalendar(calendarId));
    toast.success('Streak calendar deleted successfully');
  }, [calendars, confirm, dispatch]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  if (isLoading) {
    return <StreakCalendarSkeleton />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Streak Calendars</h1>
        </div>
        <SpecButton
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
          text="New Calendar"
          children={<Plus className="w-4 h-4" />}
          id="new-calendar-btn"
        />
      </div>

      {/* Calendar List */}
      {Object.keys(calendars).length > 0 && (
        <StreakCalendarList
          calendars={calendars}
          currentCalendarId={currentCalendarId}
          onSelectCalendar={(id) => dispatch(setCurrentCalendar(id))}
          onDeleteCalendar={handleDeleteCalendar}
        />
      )}

      {/* Main Calendar View */}
      {currentCalendar ? (
        <StreakCalendarView
          calendar={currentCalendar}
          currentDate={currentDate}
          onDateToggle={handleDateToggle}
          onNavigateMonth={navigateMonth}
        />
      ) : (
        <EmptyState onCreateClick={() => setShowCreateModal(true)} />
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateStreakModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateCalendar}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      {ConfirmDialog}
    </div>
  );
};

// Sub-components
const StreakCalendarList: React.FC<{
  calendars: StreakCalendars;
  currentCalendarId: string;
  onSelectCalendar: (id: string) => void;
  onDeleteCalendar: (id: string) => void;
}> = ({ calendars, currentCalendarId, onSelectCalendar, onDeleteCalendar }) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      {Object.values(calendars).map((calendar) => (
        <motion.div
          key={calendar.id}
          className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all min-w-0 flex-1 sm:flex-initial ${
            currentCalendarId === calendar.id
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onSelectCalendar(calendar.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div
                className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: calendar.color }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm md:text-base truncate">{calendar.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  🔥 {calendar.currentStreak} day streak
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCalendar(calendar.id);
              }}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const StreakCalendarView: React.FC<{
  calendar: StreakData;
  currentDate: Date;
  onDateToggle: (date: string) => void;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}> = ({ calendar, currentDate, onDateToggle, onNavigateMonth }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <motion.div
      className="bg-card rounded-lg border p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Streak Stats */}
      <StreakStats calendar={calendar} />

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigateMonth('prev')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-foreground">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>

        <button
          onClick={() => onNavigateMonth('next')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        calendar={calendar}
        year={year}
        month={month}
        onDateToggle={onDateToggle}
      />
    </motion.div>
  );
};

const StreakStats: React.FC<{ calendar: StreakData }> = ({ calendar }) => {
  const fireCount = getFireEmojiCount(calendar.currentStreak);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div
        className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg text-white"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5" />
          <span className="text-sm font-medium">Current Streak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{calendar.currentStreak}</span>
          <span className="text-lg">
            {'🔥'.repeat(Math.min(fireCount, 3))}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-lg text-white"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5" />
          <span className="text-sm font-medium">Longest Streak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{calendar.longestStreak}</span>
          <span className="text-lg">
            {'🏆'.repeat(Math.min(Math.floor(calendar.longestStreak / 10), 3))}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg text-white"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">Total Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{calendar.completedDates ? calendar.completedDates.length : 0}</span>
          <span className="text-lg">📅</span>
        </div>
      </motion.div>
    </div>
  );
};

const CalendarGrid: React.FC<{
  calendar: StreakData;
  year: number;
  month: number;
  onDateToggle: (date: string) => void;
}> = ({ calendar, year, month, onDateToggle }) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = formatDate(new Date(year, month, day));
    const isCompleted = calendar.completedDates ? calendar.completedDates.includes(dateString) : false;
    const isTodayDate = isToday(dateString);
    const isFuture = isFutureDate(dateString);

    calendarDays.push({
      day,
      dateString,
      isCompleted,
      isToday: isTodayDate,
      isFuture,
    });
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {daysOfWeek.map((day) => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {calendarDays.map((dayData, index) => (
        <CalendarDay
          key={index}
          dayData={dayData}
          onToggle={onDateToggle}
        />
      ))}
    </div>
  );
};

const CalendarDay: React.FC<{
  dayData: any;
  onToggle: (date: string) => void;
}> = ({ dayData, onToggle }) => {
  if (!dayData) {
    return <div className="p-2" />;
  }

  const { day, dateString, isCompleted, isToday, isFuture } = dayData;

  const getDayClasses = () => {
    let classes = "p-3 text-center text-sm rounded-lg transition-all relative min-h-[3.5rem] flex items-center justify-center ";

    if (isFuture) {
      classes += "text-muted-foreground cursor-not-allowed opacity-50 ";
    } else if (isToday) {
      classes += "bg-blue-500 text-white hover:bg-blue-600 ring-2 ring-blue-300 cursor-pointer ";
    } else if (isCompleted) {
      classes += "bg-green-500 text-white cursor-default ";
    } else {
      classes += "text-muted-foreground cursor-not-allowed opacity-60 ";
    }

    return classes;
  };

  return (
    <motion.div
      className={getDayClasses()}
      onClick={() => isToday && onToggle(dateString)}
      whileHover={isToday ? { scale: 1.1 } : {}}
      whileTap={isToday ? { scale: 0.95 } : {}}
    >
      {day}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <span className="text-2xl">🔥</span>
        </motion.div>
      )}
    </motion.div>
  );
};

const CreateStreakModal: React.FC<{
  onClose: () => void;
  onCreate: (title: string, color: string, description?: string) => void;
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#10B981');
  const [description, setDescription] = useState('');

  const colorOptions = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), color, description.trim() || undefined);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card p-6 rounded-lg border max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h3 className="text-lg font-semibold mb-4 text-foreground">Create New Streak Calendar</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Daily Exercise"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Describe your streak goal..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!title.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EmptyState: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">No Streak Calendars Yet</h3>
      <p className="text-muted-foreground mb-6">
        Create your first streak calendar to start tracking your habits and build amazing streaks!
      </p>
      <SpecButton
        onClick={onCreateClick}
        className="inline-flex items-center gap-2"
        text="Create Your First Calendar"
        children={<Plus className="w-4 h-4" />}
        id="empty-state-create-btn"
      />
    </motion.div>
  );
};

const StreakCalendarSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>

      <div className="bg-muted animate-pulse rounded-lg h-96" />
    </div>
  );
};

export default StreakCalendar;
