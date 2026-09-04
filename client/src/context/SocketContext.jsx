import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    let sid = localStorage.getItem('vibepulse_session_id');
    if (!sid) {
      sid = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('vibepulse_session_id', sid);
    }
    return sid;
  });

  const [matchStatus, setMatchStatus] = useState('idle'); // 'idle' | 'searching' | 'matched' | 'partner_disconnected'
  const [currentRoom, setCurrentRoom] = useState(null); // { roomId, partnerId, isInitiator }
  const [messages, setMessages] = useState([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [notification, setNotification] = useState(null);

  const socketRef = useRef(null);

  // Show temporary toast notification
  const showToast = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      auth: { sessionId },
      query: { sessionId },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected successfully:', s.id);
    });

    s.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Socket disconnected:', reason);
    });

    s.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      showToast(`Connection alert: ${err.message}`, 'error');
    });

    s.on('searching', (data) => {
      setMatchStatus('searching');
      setCurrentRoom(null);
    });

    s.on('match_found', (data) => {
      console.log('Match established:', data);
      setCurrentRoom({
        roomId: data.roomId,
        partnerId: data.partnerId,
        isInitiator: data.isInitiator
      });
      setMatchStatus('matched');
      setMessages([]);
      setIsPartnerTyping(false);
      showToast('Connected to a new partner!', 'success');
    });

    s.on('partner_disconnected', (data) => {
      console.log('Partner left:', data);
      setMatchStatus('partner_disconnected');
      setIsPartnerTyping(false);
      showToast(data.message || 'Partner disconnected.', 'warning');
    });

    s.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on('partner_typing', ({ isTyping }) => {
      setIsPartnerTyping(isTyping);
    });

    s.on('message_blocked', (data) => {
      showToast(data.reason || 'Message violates guidelines', 'error');
    });

    s.on('report_success', (data) => {
      showToast(data.message || 'Report submitted.', 'success');
    });

    s.on('blocked', (data) => {
      showToast(data.message || 'User blocked.', 'info');
    });

    s.on('error', (err) => {
      showToast(err.message || 'An error occurred', 'error');
    });

    return () => {
      s.disconnect();
    };
  }, [sessionId]);

  // Actions
  const joinQueue = () => {
    if (!socket || !isConnected) return;
    setMatchStatus('searching');
    setMessages([]);
    socket.emit('join_queue');
  };

  const cancelQueue = () => {
    if (!socket) return;
    setMatchStatus('idle');
    socket.emit('cancel_queue');
  };

  const nextUser = () => {
    if (!socket) return;
    setMatchStatus('searching');
    setMessages([]);
    setCurrentRoom(null);
    socket.emit('next_user');
  };

  const disconnectChat = () => {
    if (!socket) return;
    setMatchStatus('idle');
    setCurrentRoom(null);
    setMessages([]);
    socket.emit('disconnect_chat');
  };

  const sendMessage = (text) => {
    if (!socket || !currentRoom?.roomId || !text.trim()) return;
    socket.emit('send_message', {
      roomId: currentRoom.roomId,
      text: text.trim()
    });
  };

  const sendTyping = (isTyping) => {
    if (!socket || !currentRoom?.roomId) return;
    socket.emit('typing', {
      roomId: currentRoom.roomId,
      isTyping
    });
  };

  const reportUser = (reason, details) => {
    if (!socket || !currentRoom) return;
    socket.emit('report_user', {
      reportedSessionId: currentRoom.partnerId,
      roomId: currentRoom.roomId,
      reason,
      details,
      autoNext: true
    });
    setMatchStatus('searching');
    setCurrentRoom(null);
  };

  const blockUser = (reason) => {
    if (!socket || !currentRoom) return;
    socket.emit('block_user', {
      blockedSessionId: currentRoom.partnerId,
      reason,
      autoNext: true
    });
    setMatchStatus('searching');
    setCurrentRoom(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        sessionId,
        matchStatus,
        currentRoom,
        messages,
        isPartnerTyping,
        notification,
        joinQueue,
        cancelQueue,
        nextUser,
        disconnectChat,
        sendMessage,
        sendTyping,
        reportUser,
        blockUser,
        showToast
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
