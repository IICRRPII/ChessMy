import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from 'react-icons/fa';
import './Llamadas.css';
import ProfessorBoard from '../../../components/Chess/ProfessorBoard';
import StudentBoard from '../../../components/Chess/StudentBoard';

const Llamada = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const appId = import.meta.env.VITE_AGORA_APP_ID;
  const sslEnabled = import.meta.env.VITE_AGORA_SSL === 'true';
  const mode = import.meta.env.VITE_AGORA_MODE || 'rtc';
  const codec = import.meta.env.VITE_AGORA_CODEC || 'vp8';
  
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const shouldNavigateRef = useRef(false); 
  const [isMuted, setIsMuted] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Obtener el rol del usuario del token en localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Verificar si es maestro en rolesPorCurso
        if (payload.rolesPorCurso && payload.rolesPorCurso.includes('maestro')) {
          setUserRole('maestro');
        } else if (payload.rolGlobal === 'alumno') {
          setUserRole('alumno');
        }
      } catch (error) {
        console.error('Error al parsear el token:', error);
      }
    }
  }, []);

  const leaveCall = async (shouldRedirect = true) => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
      localStorage.removeItem('agoraToken');
      localStorage.removeItem('agoraUid');
      localStorage.removeItem('agoraChannel');
      
      if (shouldRedirect) {
        navigate(`/curso/${id}`);
      }
    } catch (error) {
      console.error('Error al salir de la llamada:', error);
    }
  };

  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      const newMuteState = !isMuted;
      localAudioTrackRef.current.setEnabled(!newMuteState);
      setIsMuted(newMuteState);
    }
  };

  useEffect(() => {
    const agoraData = location.state?.agoraData || {
      token: localStorage.getItem('agoraToken'),
      uid: localStorage.getItem('agoraUid'),
      channel: localStorage.getItem('agoraChannel')
    };

    if (!agoraData.token || !agoraData.uid || !agoraData.channel) {
      shouldNavigateRef.current = true;
      return;
    }

    clientRef.current = AgoraRTC.createClient({
      mode: mode,
      codec: codec
    });

    if(!sslEnabled) {
      AgoraRTC.setParameter('DISABLE_WEBSOCKET_SSL', true);
      console.warn('Modo testing: SSL desactivado');
    }

    const handleUserPublished = async (user, mediaType) => {
      if (mediaType === 'audio') {
        const remoteAudioTrack = await clientRef.current.subscribe(user, 'audio');
        remoteAudioTrack.play();
        console.log('Usuario remoto conectado:', user.uid);
      }
    };

    clientRef.current.on('user-published', handleUserPublished);

    const joinChannel = async () => {
      try {
        await clientRef.current.join(
          appId,
          agoraData.channel,
          null,
          agoraData.uid
        );
        console.log('Unido al canal exitosamente');
        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await clientRef.current.publish([localAudioTrackRef.current]);
        console.log('Audio local publicado');
        setIsMuted(!localAudioTrackRef.current.enabled);
      } catch (error) {
        console.error('Error al unirse:', error);
        shouldNavigateRef.current = true;
      }
    };

    joinChannel();

    return () => {
      leaveCall(false);
      
      if (shouldNavigateRef.current) {
        navigate(`/curso/${id}`);
      }
    };
  }, [id, location.state, navigate]);

  useEffect(() => {
    if (shouldNavigateRef.current) {
      navigate(`/curso/${id}`);
    }
  }, []);

  return (
    <div className="llamada-wrapper">
      {/* Sección del tablero a la izquierda */}
      <section className="llamada-container">
        {userRole === 'maestro' ? (
          <ProfessorBoard />
        ) : userRole === 'alumno' ? (
          <StudentBoard />
        ) : null}
      </section>
      
      {/* Sección de controles a la derecha */}
      <div className="controls-section">
        <div className="controls">
          <button 
              className={`control-button mic-button ${isMuted ? 'muted' : ''}`} 
              onClick={toggleMute}
          >
              {isMuted ? (
                  <FaMicrophoneSlash className="icon" />
              ) : (
                  <FaMicrophone className="icon" />
              )}
          </button>
          
          <button 
              className="control-button end-call" 
              onClick={() => leaveCall(true)}
          >
              <FaPhoneSlash className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Llamada;