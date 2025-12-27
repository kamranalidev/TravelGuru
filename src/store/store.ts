import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './features/auth/authSlice'
import cartReducer from './features/cart/cartSlice'
import profileReducer from './features/profile/profileSlice'
import serverCartReducer from './features/serverCart/serverCartSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartReducer,
    profile: profileReducer,
    serverCart: serverCartReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
