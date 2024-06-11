import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { userReducer } from "./user/userSlice";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import { ThemeReducer } from "./theme/themeSlice";

const rootreducer = combineReducers({
  user: userReducer,
  theme: ThemeReducer,
});

const persistCofig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistCofig, rootreducer);
export const store = configureStore({
  reducer: persistedReducer,
  //防止出现error
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
