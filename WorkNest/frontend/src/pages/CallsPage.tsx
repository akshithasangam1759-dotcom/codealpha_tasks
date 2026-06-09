import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhoneOff, FiPhone, FiHash, FiGlobe, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Participant {
  userId: number;
  name: string;
  stream: MediaStream | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isLocal: boolean;
}

interface Room { id: string; label: string; }

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function CallsPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { isDark } = useTheme();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [inCall, setInCall] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [joining, setJoining] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<number, RTCPeerConnection>>(new Map());
  const remoteVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  // colors
  const bg = isDark ? '#111' : '#FAF5F2';
  const sidebar = isDark ? '#1A1A1A' : '#FFF0EB';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textPrimary = isDark ? '#fff' : '#2D1208';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(100,60,30,0.5)';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(196,133,106,0.2)';
  const activeBg = isDark ? 'rgba(232,84,10,0.15)' : 'rgba(232,84,10,0.1)';

  // load rooms
  useEffect(() => {
    api.get('/projects').then(res => {
      const projectRooms = (res.data.data || []).map((p: any) => ({ id: `project-${p.id}`, label: p.name }));
      setRooms([{ id: 'global', label: 'General' }, ...projectRooms]);
      setActiveRoom({ id: 'global', label: 'General' });
    }).catch(() => {
      setRooms([{ id: 'global', label: 'General' }]);
      setActiveRoom({ id: 'global', label: 'General' });
    });
  }, []);

  const createPeerConnection = useCallback((remoteUserId: number) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('call:ice-candidate', { roomId: activeRoom?.id, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      setParticipants(prev => prev.map(p =>
        p.userId === remoteUserId ? { ...p, stream } : p
      ));
      const videoEl = remoteVideoRefs.current.get(remoteUserId);
      if (videoEl) videoEl.srcObject = stream;
    };

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    peerConnections.current.set(remoteUserId, pc);
    return pc;
  }, [socket, activeRoom, localStream]);

  // socket events
  useEffect(() => {
    if (!socket || !inCall) return;

    const handleUserJoined = async ({ userId: remoteUserId }: { userId: number }) => {
      toast(`Someone joined the call! 📹`, { icon: '👋' });
      setParticipants(prev => [...prev, { userId: remoteUserId, name: `User ${remoteUserId}`, stream: null, audioEnabled: true, videoEnabled: true, isLocal: false }]);

      const pc = createPeerConnection(remoteUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call:offer', { roomId: activeRoom?.id, offer, toUserId: remoteUserId });
    };

    const handleOffer = async ({ offer, fromUserId }: { offer: RTCSessionDescriptionInit; fromUserId: number }) => {
      setParticipants(prev => {
        if (prev.find(p => p.userId === fromUserId)) return prev;
        return [...prev, { userId: fromUserId, name: `User ${fromUserId}`, stream: null, audioEnabled: true, videoEnabled: true, isLocal: false }];
      });

      const pc = createPeerConnection(fromUserId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { roomId: activeRoom?.id, answer, toUserId: fromUserId });
    };

    const handleAnswer = async ({ answer, fromUserId }: { answer: RTCSessionDescriptionInit; fromUserId: number }) => {
      const pc = peerConnections.current.get(fromUserId);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = async ({ candidate, fromUserId }: { candidate: RTCIceCandidateInit; fromUserId: number }) => {
      const pc = peerConnections.current.get(fromUserId);
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleUserLeft = ({ userId: remoteUserId }: { userId: number }) => {
      setParticipants(prev => prev.filter(p => p.userId !== remoteUserId));
      const pc = peerConnections.current.get(remoteUserId);
      if (pc) { pc.close(); peerConnections.current.delete(remoteUserId); }
      toast(`Someone left the call`, { icon: '👋' });
    };

    const handleAudioToggled = ({ userId: uid, enabled }: { userId: number; enabled: boolean }) => {
      setParticipants(prev => prev.map(p => p.userId === uid ? { ...p, audioEnabled: enabled } : p));
    };

    const handleVideoToggled = ({ userId: uid, enabled }: { userId: number; enabled: boolean }) => {
      setParticipants(prev => prev.map(p => p.userId === uid ? { ...p, videoEnabled: enabled } : p));
    };

    socket.on('call:user-joined', handleUserJoined);
    socket.on('call:offer', handleOffer);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:user-left', handleUserLeft);
    socket.on('call:audio-toggled', handleAudioToggled);
    socket.on('call:video-toggled', handleVideoToggled);

    return () => {
      socket.off('call:user-joined', handleUserJoined);
      socket.off('call:offer', handleOffer);
      socket.off('call:answer', handleAnswer);
      socket.off('call:ice-candidate', handleIceCandidate);
      socket.off('call:user-left', handleUserLeft);
      socket.off('call:audio-toggled', handleAudioToggled);
      socket.off('call:video-toggled', handleVideoToggled);
    };
  }, [socket, inCall, activeRoom, createPeerConnection]);

  // attach local stream to video el
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, inCall]);

  const joinCall = async () => {
    if (!activeRoom || !socket) return;
    setJoining(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setParticipants([{ userId: user!.id, name: user!.name, stream, audioEnabled: true, videoEnabled: true, isLocal: true }]);
      socket.emit('call:join', { roomId: activeRoom.id });
      setInCall(true);
      toast.success('Joined the call!! 🎉');
    } catch (err) {
      toast.error('Could not access camera/mic!! Check permissions 📷');
    } finally {
      setJoining(false);
    }
  };

  const leaveCall = () => {
    if (socket && activeRoom) socket.emit('call:leave', { roomId: activeRoom.id });
    localStream?.getTracks().forEach(t => t.stop());
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    setLocalStream(null);
    setParticipants([]);
    setInCall(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
    toast('Left the call', { icon: '👋' });
  };

  const toggleAudio = () => {
    if (!localStream) return;
    const enabled = !audioEnabled;
    localStream.getAudioTracks().forEach(t => t.enabled = enabled);
    setAudioEnabled(enabled);
    socket?.emit('call:toggle-audio', { roomId: activeRoom?.id, enabled });
  };

  const toggleVideo = () => {
    if (!localStream) return;
    const enabled = !videoEnabled;
    localStream.getVideoTracks().forEach(t => t.enabled = enabled);
    setVideoEnabled(enabled);
    socket?.emit('call:toggle-video', { roomId: activeRoom?.id, enabled });
  };

  const VideoTile = ({ participant }: { participant: Participant }) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        background: isDark ? '#222' : '#e8d5ce',
        border: `2px solid ${participant.isLocal ? '#E8540A' : border}`,
        aspectRatio: '16/9', minHeight: 160,
        boxShadow: participant.isLocal ? '0 0 20px rgba(232,84,10,0.3)' : 'none',
      }}>
      <video
        ref={el => {
          if (participant.isLocal) {
            (localVideoRef as any).current = el;
          } else if (el) {
            remoteVideoRefs.current.set(participant.userId, el);
            if (participant.stream) el.srcObject = participant.stream;
          }
        }}
        autoPlay playsInline muted={participant.isLocal}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: participant.isLocal ? 'scaleX(-1)' : 'none' }}
      />

      {/* no video placeholder */}
      {!participant.videoEnabled && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#1a1a1a' : '#e8d5ce' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#E8540A,#6B1010)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff' }}>
            {participant.name[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {/* name tag */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#fff' }}>
          {participant.isLocal ? 'You' : participant.name}
        </div>
        {!participant.audioEnabled && <div style={{ background: 'rgba(239,68,68,0.8)', borderRadius: 6, padding: '4px 6px' }}><FiMicOff size={11} color="#fff"/></div>}
      </div>

      {participant.isLocal && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(232,84,10,0.8)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: '#fff' }}>LIVE</div>
      )}
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: bg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${border}` }}>

      {/* Sidebar */}
      <div style={{ width: 220, minWidth: 220, display: 'none' }} className="chat-sidebar">
        <div style={{ padding: '20px 16px 12px', fontSize: 11, fontWeight: 800, color: textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>Call Rooms</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {rooms.map(room => (
            <motion.button key={room.id}
              onClick={() => { if (!inCall) setActiveRoom(room); }}
              whileHover={{ x: 2 }}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none',
                background: activeRoom?.id === room.id ? activeBg : 'transparent',
                color: activeRoom?.id === room.id ? '#E8540A' : textMuted,
                fontSize: 13, fontWeight: activeRoom?.id === room.id ? 700 : 500,
                fontFamily: 'Figtree, sans-serif', cursor: inCall ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                transition: 'all 0.15s', opacity: inCall && activeRoom?.id !== room.id ? 0.4 : 1,
              }}>
              {room.id === 'global' ? <FiGlobe size={14}/> : <FiHash size={14}/>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: cardBg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiVideo size={16} style={{ color: '#E8540A' }}/>
            <span style={{ fontSize: 16, fontWeight: 800, color: textPrimary }}>{activeRoom?.label}</span>
            {inCall && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '3px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>LIVE · {participants.length} in call</span>
              </div>
            )}
          </div>
          {inCall && (
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button onClick={toggleAudio} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: audioEnabled ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(196,133,106,0.15)') : 'rgba(239,68,68,0.15)', color: audioEnabled ? textPrimary : '#ef4444' }}>
                {audioEnabled ? <FiMic size={16}/> : <FiMicOff size={16}/>}
              </motion.button>
              <motion.button onClick={toggleVideo} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: videoEnabled ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(196,133,106,0.15)') : 'rgba(239,68,68,0.15)', color: videoEnabled ? textPrimary : '#ef4444' }}>
                {videoEnabled ? <FiVideo size={16}/> : <FiVideoOff size={16}/>}
              </motion.button>
              <motion.button onClick={leaveCall} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ padding: '0 16px', height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 13, fontWeight: 700, fontFamily: 'Figtree' }}>
                <FiPhoneOff size={15}/> Leave
              </motion.button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {!inCall ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontSize: 64 }}>📹</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: textPrimary }}>Start a Call</div>
              <div style={{ fontSize: 14, color: textMuted, textAlign: 'center', maxWidth: 320 }}>
                Join <strong style={{ color: textPrimary }}>#{activeRoom?.label}</strong> to start a video or audio call with your team!!
              </div>
              <motion.button onClick={joinCall} disabled={joining}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{
                  marginTop: 8, padding: '14px 32px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg,#E8540A,#6B1010)', color: '#fff',
                  fontSize: 15, fontWeight: 800, fontFamily: 'Figtree', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 4px 24px rgba(232,84,10,0.4)',
                }}>
                <FiPhone size={17}/> {joining ? 'Joining...' : 'Join Call'}
              </motion.button>
            </motion.div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: participants.length === 1 ? '1fr' : participants.length <= 2 ? 'repeat(2, 1fr)' : participants.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 16, alignContent: 'start',
            }}>
              <AnimatePresence>
                {participants.map(p => <VideoTile key={p.userId} participant={p}/>)}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}