import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PasswordEntry {
  id: string;
  label: string;
  username?: string;
  password: string;
  link?: string;
  description?: string;
  favicon?: string;
  pinned?: boolean;
  createdAt?: number;
}

interface PasswordManagerState {
  passwords: PasswordEntry[];
}

const initialState: PasswordManagerState = {
  passwords: [],
};

const passwordManagerSlice = createSlice({
  name: 'passwordManager',
  initialState,
  reducers: {
    addPassword: (state, action: PayloadAction<PasswordEntry>) => {
      state.passwords.push(action.payload);
    },
    updatePassword: (state, action: PayloadAction<PasswordEntry>) => {
      const index = state.passwords.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.passwords[index] = action.payload;
      }
    },
    deletePassword: (state, action: PayloadAction<string>) => {
      state.passwords = state.passwords.filter(p => p.id !== action.payload);
    },
    loadPasswords: (state, action: PayloadAction<PasswordEntry[]>) => {
      state.passwords = action.payload;
    },
    togglePin: (state, action: PayloadAction<string>) => {
      const password = state.passwords.find(p => p.id === action.payload);
      if (password) {
        password.pinned = !password.pinned;
      }
    },
  },
});

export const { addPassword, updatePassword, deletePassword, loadPasswords, togglePin } = passwordManagerSlice.actions;
export default passwordManagerSlice.reducer;
