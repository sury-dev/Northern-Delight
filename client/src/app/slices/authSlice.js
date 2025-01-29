import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: false, // false means not logged in
    userData : null, // user data
    role : null // user role
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
            state.role = action.payload.userData.role;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
        }
    }
})

export const {login, logout} = authSlice.actions;

export default authSlice.reducer;