// <= IMPORTS =>
import "./index.css";
import React from "react";
import App from "./App.jsx";
import { Toaster } from "sonner";
import store from "./redux/store";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { persistStore } from "redux-persist";
import { SocketProvider } from "./context/SocketContext";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// <= REDUX-PERSIST =>
const persistor = persistStore(store);

// <= SELECTING THE ROOT ELEMENT =>
const rootElement = document.getElementById("root");

// <= CREATING THE ROOT ELEMENT =>
const root = ReactDOM.createRoot(rootElement);

// <= CREATING QUERY CLIENT =>
const queryClient = new QueryClient();

// <= RENDERING THE APP =>
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </SocketProvider>
      </PersistGate>
    </Provider>
    <Toaster position="bottom-left" />
  </React.StrictMode>
);
