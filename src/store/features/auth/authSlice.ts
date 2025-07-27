import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
interface AuthState {
    isAuthenticated: boolean;
    user: any;
    token: string;
}   

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: '',
};  

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ user: any; token: string }>) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = '';
        },
        updateUser: (state, action: PayloadAction<any>) => {
           if (state.user) {
            state.user = { ...state.user, ...action.payload };
            }

        }
    },
})