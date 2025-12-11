import { combineReducers } from '@reduxjs/toolkit';
import authPersistReducer from './auth-persist.reducer';
const rootReducer = combineReducers({
  authPersist: authPersistReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;