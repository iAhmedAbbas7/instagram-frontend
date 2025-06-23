// <= IMPORTS =>
import { createContext, useContext, useRef } from "react";

// <= INITIALIZING SOCKET CONTEXT =>
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // SOCKET REF
  const socketRef = useRef(null);
  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

// <= USING SOCKET REF =>
export const useSocketRef = () => {
  return useContext(SocketContext);
};
