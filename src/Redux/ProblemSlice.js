import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  testcases: [],
  hidden_cases: []
};

const problemSlice = createSlice({
  name: 'problem',
  initialState,
  reducers: {
    setcase: (state, action) => {
      const { testcases, hidden_cases } = action.payload;
      state.testcases = testcases;
      state.hidden_cases = hidden_cases;
    }
  }
});

export const { setcase } = problemSlice.actions;
export default problemSlice.reducer;
