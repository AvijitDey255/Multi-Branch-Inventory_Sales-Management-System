import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import projectsReducer from './projectsSlice';
import ecomReducer from './ecomSlice';
import branchesReducer from './branchesSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    projects: projectsReducer,
    ecom: ecomReducer,
    branches: branchesReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
