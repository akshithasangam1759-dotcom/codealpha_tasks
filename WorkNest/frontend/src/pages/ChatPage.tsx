import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiHash, FiGlobe, FiSmile } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  room_id: string;
  content: string;
  created_at: string;
  user_id: number;
  name: string;
  avatar: string | null;
}

interface Room {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { isDark } = useTheme();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // colors
  const bg = isDark ? '#111' : '#FAF5F2';
  const sidebar = isDark ? '#1A1A1A' : '#FFF0EB';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textPrimary = isDark ? '#fff' : '#2D1208';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(100,60,30,0.5)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.2)';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(196,133,106,0.08)';
  const activeBg = isDark ? 'rgba(232,84,10,0.15)' : 'rgba(232,84,10,0.1)';

  // load projects to build room list
  useEffect(() => {
    api.get('/projects').then(res => {
      const projectRooms: Room[] = (res.data.data || []).map((p: any) => ({
        id: `project-${p.id}`,
        label: p.name,
        icon: <FiHash size={14} />,
      }));
      const allRooms = [
        { id: 'global', label: 'General', icon: <FiGlobe size={14} /> },
        ...projectRooms,
      ];
      setRooms(allRooms);
      setActiveRoom(allRooms[0]);
    }).catch(() => {
      const fallback = [{ id: 'global', label: 'General', icon: <FiGlobe size={14} /> }];
      setRooms(fallback);
      setActiveRoom(fallback[0]);
    });
  }, []);

  // load messages when room changes
  useEffect(() => {
    if (!activeRoom) return;
    setLoadingMsgs(true);
    setMessages([]);
    api.get(`/chat/${activeRoom.id}/messages`)
      .then(res => setMessages(res.data.data || []))
      .catch(() => toast.error('Could not load messages'))
      .finally(() => setLoadingMsgs(false));
  }, [activeRoom]);

  // socket: join/leave rooms + listen
  useEffect(() => {
    if (!socket || !activeRoom) return;
    socket.emit('chat:join', activeRoom.id);

    const handleMessage = (msg: Message) => {
      if (msg.room_id === activeRoom.id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    const handleTyping = ({ userId }: { userId: number }) => {
      setTypingUsers(prev => [...new Set([...prev, userId])]);
    };
    const handleStopTyping = ({ userId }: { userId: number }) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop-typing', handleStopTyping);

    return () => {
      socket.emit('chat:leave', activeRoom.id);
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop-typing', handleStopTyping);
    };
  }, [socket, activeRoom]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !socket || !activeRoom) return;
    socket.emit('chat:message', { roomId: activeRoom.id, content: input.trim() });
    setInput('');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    socket.emit('chat:stop-typing', { roomId: activeRoom.id });
  }, [input, socket, activeRoom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!socket || !activeRoom) return;
    socket.emit('chat:typing', { roomId: activeRoom.id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('chat:stop-typing', { roomId: activeRoom.id });
    }, 1500);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // group messages by date + consecutive sender
  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = formatDate(msg.created_at);
    const last = acc[acc.length - 1];
    if (!last || last.date !== date) acc.push({ date, msgs: [msg] });
    else last.msgs.push(msg);
    return acc;
  }, []);

  const Avatar = ({ msg, size = 36 }: { msg: Message; size?: number }) => (
    <div style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      background: msg.avatar ? 'transparent' : 'linear-gradient(135deg,#E8540A,#6B1010)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 900, color: '#fff', overflow: 'hidden',
    }}>
      {msg.avatar
        ? <img src={msg.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        : msg.name?.[0]?.toUpperCase()}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: bg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${border}` }}>

      {/* Sidebar */}
      <div style={{ width: 220, minWidth: 220, display: 'none' }}
      className="chat-sidebar">
        <div style={{ padding: '20px 16px 12px', fontSize: 11, fontWeight: 800, color: textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
          Channels
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {rooms.map(room => (
            <motion.button key={room.id} onClick={() => setActiveRoom(room)}
              whileHover={{ x: 2 }}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none',
                background: activeRoom?.id === room.id ? activeBg : 'transparent',
                color: activeRoom?.id === room.id ? '#E8540A' : textMuted,
                fontSize: 13, fontWeight: activeRoom?.id === room.id ? 700 : 500,
                fontFamily: 'Figtree, sans-serif', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                transition: 'all 0.15s',
              }}>
              {room.icon}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10, background: cardBg }}>
          <span style={{ color: '#E8540A' }}>{activeRoom?.icon}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: textPrimary }}>{activeRoom?.label}</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loadingMsgs && (
            <div style={{ textAlign: 'center', color: textMuted, fontSize: 13, padding: 40 }}>loading messages...</div>
          )}

          {!loadingMsgs && messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', color: textMuted, fontSize: 14, padding: '60px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontWeight: 700, color: textPrimary, marginBottom: 4 }}>No messages yet!</div>
              <div>Be the first to say something 👋</div>
            </motion.div>
          )}

          {grouped.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px' }}>
                <div style={{ flex: 1, height: 1, background: border }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: textMuted, whiteSpace: 'nowrap' }}>{date}</span>
                <div style={{ flex: 1, height: 1, background: border }} />
              </div>

              {msgs.map((msg, i) => {
                const isMe = msg.user_id === user?.id;
                const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.user_id !== msg.user_id);
                const showName = !isMe && showAvatar;

                return (
                  <motion.div key={msg.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-end', gap: 8, marginBottom: 4,
                      paddingLeft: !isMe && !showAvatar ? 44 : 0,
                    }}>
                    {!isMe && showAvatar && <Avatar msg={msg} />}
                    <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {showName && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: textMuted, marginBottom: 3, paddingLeft: 4 }}>
                          {msg.name}
                        </span>
                      )}
                      <div style={{
                        padding: '9px 14px', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: isMe ? 'linear-gradient(135deg,#E8540A,#6B1010)' : cardBg,
                        color: isMe ? '#fff' : textPrimary,
                        fontSize: 14, lineHeight: 1.5,
                        border: isMe ? 'none' : `1px solid ${border}`,
                        boxShadow: isMe ? '0 2px 12px rgba(232,84,10,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                        wordBreak: 'break-word',
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: 10, color: textMuted, marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {typingUsers.filter(id => id !== user?.id).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ display: 'flex', gap: 3, padding: '8px 12px', background: cardBg, borderRadius: '4px 16px 16px 16px', border: `1px solid ${border}` }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8540A' }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 24px 16px', background: cardBg, borderTop: `1px solid ${border}` }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, background: inputBg, border: `1px solid ${border}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); handleTyping(); }}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${activeRoom?.label?.toLowerCase() ?? 'general'}...`}
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: textPrimary, fontSize: 14, fontFamily: 'Figtree, sans-serif',
                  resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                }}
              />
              <FiSmile size={18} style={{ color: textMuted, cursor: 'pointer', flexShrink: 0 }} />
            </div>
            <motion.button onClick={handleSend}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              disabled={!input.trim()}
              style={{
                width: 44, height: 44, borderRadius: 12, border: 'none',
                background: input.trim() ? 'linear-gradient(135deg,#E8540A,#6B1010)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.15)'),
                color: input.trim() ? '#fff' : textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', flexShrink: 0,
                boxShadow: input.trim() ? '0 4px 16px rgba(232,84,10,0.3)' : 'none',
              }}>
              <FiSend size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}