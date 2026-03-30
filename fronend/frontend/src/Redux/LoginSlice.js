import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  username: '',
  password: '',
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { username, password } = action.payload;
      state.username = username;
      state.password = password;
      console.log("state now:", state.username);
    },
    clearUser: (state) => {
      state.username = '';
      state.password = '';
    },
  },
});

export const { setUser, clearUser } = loginSlice.actions;
export default loginSlice.reducer;
