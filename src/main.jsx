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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// <= REDUX-PERSIST =>
const persistor = persistStore(store);

// <= SELECTING THE ROOT ELEMENT =>
const rootElement = document.getElementById("root");

// <= CREATING THE ROOT ELEMENT =>
const root = ReactDOM.createRoot(rootElement);

// <= CREATING QUERY CLIENT =>
const queryClient = new QueryClient();

// HIDING SCREEN SPLASH
const hideSplashScreen = () => {
  try {
    // SELECTING THE SPLASH ELEMENT
    const splash = document.getElementById("splash");
    // IF NO SPLASH ELEMENT EXISTS, THEN RETURNING
    if (!splash) return;
    // ADDING THE HIDDEN CLASS
    splash.classList.add("splash-hidden");
    // REMOVING THE ELEMENT AFTER TRANSITION
    setTimeout(() => {
      // IF THE PARENT NODE EXISTS, THEN REMOVING THE CHILD ELEMENT
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 450);
  } catch (error) {
    // LOGGING THE ERROR MESSAGE
    console.log("Error Hiding the Splash Screen", error);
  }
};

// MAKING THE FUNCTION AVAILABLE GLOBALLY
window.__APP__HIDE__SPLASH = hideSplashScreen;

// <= RENDERING THE APP =>
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools position="top" initialIsOpen={false} />
          </QueryClientProvider>
        </SocketProvider>
      </PersistGate>
    </Provider>
    <Toaster position="bottom-left" />
  </React.StrictMode>
);
