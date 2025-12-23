import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { getToken } from '../utils/auth';

const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || "http://localhost:4100";

// Shared socket instance để tất cả components dùng chung
let sharedSocket = null;
let socketRefCount = 0;
let socketEventHandlers = new Map(); // Map<eventName, Set<handlers>>

/**
 * Tạo hoặc lấy shared socket instance
 */
function getSharedSocket(token) {
  if (!token) return null;
  
  // Nếu đã có socket và đang connected, dùng lại
  if (sharedSocket?.connected) {
    return sharedSocket;
  }
  
  // Nếu đã có socket nhưng chưa connected, đợi hoặc tạo mới
  if (sharedSocket && !sharedSocket.connected) {
    // Nếu socket đang trong quá trình kết nối, đợi một chút
    return sharedSocket;
  }
  
  // Tạo socket mới
  const socket = io(REALTIME_URL, {
    transports: ["polling", "websocket"],
    withCredentials: true,
    auth: { token },
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    timeout: 20000,
    forceNew: false,
    upgrade: true,
    rememberUpgrade: true,
    // Suppress WebSocket errors
    autoConnect: true,
  });
  
  // Suppress WebSocket connection errors
  socket.io.on("error", (err) => {
    // Suppress "WebSocket is closed before connection is established" errors
    if (err.message?.includes('WebSocket is closed') || 
        err.message?.includes('transport close')) {
      return; // Silent ignore
    }
  });
  
  sharedSocket = socket;
  return socket;
}

/**
 * Cleanup shared socket khi không còn component nào dùng
 */
function releaseSharedSocket() {
  socketRefCount--;
  if (socketRefCount <= 0 && sharedSocket) {
    try {
      // Chỉ disconnect nếu socket đã connected hoặc đang connecting
      if (sharedSocket.connected || sharedSocket.connecting) {
        sharedSocket.removeAllListeners();
        sharedSocket.disconnect();
      } else {
        // Nếu chưa connect, chỉ remove listeners và cleanup
        sharedSocket.removeAllListeners();
        // Đóng transport nếu có
        if (sharedSocket.io) {
          sharedSocket.io.close();
        }
      }
    } catch (err) {
      // Suppress errors khi disconnect socket chưa connected
      // Đây là warning không ảnh hưởng đến functionality
    }
    sharedSocket = null;
    socketEventHandlers.clear();
    socketRefCount = 0;
  }
}

/**
 * Custom hook để kết nối realtime service cho các trang
 * @param {Object} options - Cấu hình cho realtime connection
 * @param {Object} options.eventHandlers - Object chứa các event handlers: { EVENT_NAME: callback }
 * @param {boolean} options.enabled - Có bật realtime không (default: true)
 * @returns {Object} { isConnected: boolean, socket: Socket | null }
 */
export default function useRealtime({ eventHandlers = {}, enabled = true } = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const timeoutRefs = useRef({});
  const handlersRef = useRef({});
  const authStore = useSelector((state) => state.user);

  useEffect(() => {
    if (!enabled) {
      releaseSharedSocket();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    // Lấy token
    const token = authStore?.token || getToken();
    
    if (!token) {
      releaseSharedSocket();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    // Lấy shared socket
    const socket = getSharedSocket(token);
    if (!socket) {
      setIsConnected(false);
      return;
    }
    
    socketRefCount++;
    socketRef.current = socket;
    
    // Cập nhật connection state
    setIsConnected(socket.connected);

    // Tạo debounced handlers cho mỗi event
    const debouncedHandlers = {};
    Object.keys(eventHandlers).forEach((eventName) => {
      const handler = eventHandlers[eventName];
      if (typeof handler === 'function') {
        // Tạo unique handler cho component này
        const wrappedHandler = () => {
          // Clear timeout cũ nếu có
          if (timeoutRefs.current[eventName]) {
            clearTimeout(timeoutRefs.current[eventName]);
          }
          // Set timeout mới với debounce 500ms
          timeoutRefs.current[eventName] = setTimeout(() => {
            try {
              handler();
            } catch (err) {
              console.error(`Error in event handler for ${eventName}:`, err);
            }
          }, 500);
        };
        
        debouncedHandlers[eventName] = wrappedHandler;
        
        // Lưu handler vào map để có thể remove sau
        if (!socketEventHandlers.has(eventName)) {
          socketEventHandlers.set(eventName, new Set());
        }
        socketEventHandlers.get(eventName).add(wrappedHandler);
        
        // Đăng ký handler
        socket.on(eventName, wrappedHandler);
      }
    });
    
    handlersRef.current = debouncedHandlers;

    // Setup connection listeners cho component này
    const onConnect = () => {
      setIsConnected(true);
    };
    
    const onDisconnect = (reason) => {
      setIsConnected(false);
      
      // Tự động reconnect cho các lý do có thể recover được
      if (reason === "io server disconnect") {
        socket.connect();
      }
    };
    
    const onReconnect = () => {
      setIsConnected(true);
    };
    
    const onConnectError = (err) => {
      // Silent fail - đã có polling fallback
      if (err.message.includes("token") || err.message.includes("Invalid")) {
        // Token invalid - có thể cần logout
      }
    };

    // Đăng ký listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);
    socket.on("connect_error", onConnectError);
    
    // Lưu listeners để cleanup
    handlersRef.current._internalListeners = {
      connect: onConnect,
      disconnect: onDisconnect,
      reconnect: onReconnect,
      connect_error: onConnectError,
    };

    // Cleanup function
    return () => {
      if (socketRef.current === socket) {
        // Clear tất cả timeouts
        Object.values(timeoutRefs.current).forEach(timeout => {
          if (timeout) clearTimeout(timeout);
        });
        timeoutRefs.current = {};
        
        // Remove handlers khỏi socket
        Object.keys(handlersRef.current).forEach((eventName) => {
          if (eventName === '_internalListeners') return;
          
          const handler = handlersRef.current[eventName];
          socket.off(eventName, handler);
          
          // Remove khỏi map
          if (socketEventHandlers.has(eventName)) {
            socketEventHandlers.get(eventName).delete(handler);
            if (socketEventHandlers.get(eventName).size === 0) {
              socketEventHandlers.delete(eventName);
            }
          }
        });
        
        // Remove internal listeners
        if (handlersRef.current._internalListeners) {
          const internal = handlersRef.current._internalListeners;
          socket.off("connect", internal.connect);
          socket.off("disconnect", internal.disconnect);
          socket.off("reconnect", internal.reconnect);
          socket.off("connect_error", internal.connect_error);
        }
        
        handlersRef.current = {};
        socketRef.current = null;
        setIsConnected(false);
        
        // Release shared socket
        releaseSharedSocket();
      }
    };
  }, [authStore?.token, enabled, ...Object.values(eventHandlers)]); // Re-run khi token, enabled, hoặc handlers thay đổi

  return {
    isConnected,
    socket: socketRef.current,
  };
}


