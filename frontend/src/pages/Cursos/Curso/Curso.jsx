import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import './Curso.css';
import { FaPaperPlane, FaRegSmile, FaRegImage, FaTrash, FaVideo } from 'react-icons/fa';
import CalendarioMaestro from '../CalendarioM/CalendarioM';
import CalendarioAlumno from '../CalendarioA/CalendarioA';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const decodeBase64 = (str) => {
  return decodeURIComponent(atob(str));
};

const Curso = () => {
  const { id } = useParams();
  const decodedCourseId = id ? decodeBase64(id) : null;
  const [role, setRole] = useState('alumno');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeCommentInputs, setActiveCommentInputs] = useState({});
  const commentInputRefs = useRef({});
  const navigate = useNavigate();

  // Obtener el ID del usuario actual
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      return decoded.userId;
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.rolesPorCurso) {
        const esMaestro = decoded.rolesPorCurso.includes("maestro");
        setRole(esMaestro ? 'maestro' : 'alumno');
      }
    }
  }, []);

  const fetchComentarios = async (idPubTablon) => {
    try {
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      const response = await fetch(`/api/admin/comentarios/${idPubTablon}`, {
=======
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/comentarios/${idPubTablon}`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener comentarios');
      }

      const data = await response.json();
      return data.comentarios || [];
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        const token = localStorage.getItem('token');
<<<<<<< HEAD
        const response = await fetch(`/api/admin/show-publicaciones/${decodedCourseId}`, {
=======
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/show-publicaciones/${decodedCourseId}`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al obtener publicaciones');
        }

        const data = await response.json();
        
        if (!data.publicaciones || data.publicaciones.length === 0) {
          setPosts([]);
          setSuccessMessage('No hay publicaciones activas en este curso.');
        } else {
          const publicacionesConComentarios = await Promise.all(
            data.publicaciones.map(async (post) => {
              const comentarios = await fetchComentarios(post.idPubTablon);
              return { ...post, comentarios };
            })
          );
          setPosts(publicacionesConComentarios);
        }
        
      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Ocurrió un error al cargar las publicaciones');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedCourseId) {
      fetchPublicaciones();
    }
  }, [decodedCourseId]);

  const formatDateForDB = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    
    try {
      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      const userId = decoded.userId;
      const fechaFormateada = formatDateForDB(new Date());

<<<<<<< HEAD
      const response = await fetch('/api/admin/create-publicacion', {
=======
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/create-publicacion`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idCurso: decodedCourseId,
          idUsuario: decoded.userId,
          tituloPublicacion: newPost.title,
          desPublicacion: newPost.content,
          fechaPublicacion: fechaFormateada,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear publicación');
      }

      const data = await response.json();
      setPosts([data.publicacion, ...posts]);
      setNewPost({ title: '', content: '' });
      setSuccessMessage('Publicación creada exitosamente!');
      setError(null);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setSuccessMessage(null);
    }
  };

  const addComment = async (idPubTablon, commentText) => {
    if (!commentText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      const userId = decoded.userId;

<<<<<<< HEAD
      const response = await fetch('/api/admin/comentario', {
=======
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/comentario`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idPubTablon,
          idUsuario: userId,
          comentario: commentText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear comentario');
      }

      const data = await response.json();
      
      setPosts(posts.map(post => {
        if (post.idPubTablon === idPubTablon) {
          return {
            ...post,
            comentarios: [...(post.comentarios || []), data.comentario]
          };
        }
        return post;
      }));

      if (commentInputRefs.current[idPubTablon]) {
        commentInputRefs.current[idPubTablon].value = '';
      }
      
      setSuccessMessage('Comentario agregado exitosamente!');
      setError(null);
      
      setTimeout(() => setSuccessMessage(null), 3000);
      return true;
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setSuccessMessage(null);
      return false;
    }
  };

  const deleteComment = async (idPubTablon, idComentario) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const userId = getCurrentUserId();

<<<<<<< HEAD
      const response = await fetch('/api/admin/comentario', {
=======
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/comentario`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idComentario,
          idUsuario: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar comentario');
      }

      setPosts(posts.map(post => {
        if (post.idPubTablon === idPubTablon) {
          return {
            ...post,
            comentarios: post.comentarios.filter(c => c.idComentario !== idComentario)
          };
        }
        return post;
      }));

      setSuccessMessage('Comentario eliminado exitosamente!');
      setError(null);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setSuccessMessage(null);
    }
  };

  const toggleCommentInput = (postId) => {
    setActiveCommentInputs(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (postId) => {
    const input = commentInputRefs.current[postId];
    if (input && input.value.trim()) {
      await addComment(postId, input.value);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  /*
  const handleJoinCall = () => {
    console.log("Uniéndose a la videollamada...");
  };
*/
const handleJoinCall = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const decodedToken = parseJwt(token);
      const idUsuario = decodedToken.userId;
      const idCurso = decodedCourseId;

      if (!idUsuario || !idCurso) {
        throw new Error('Faltan datos necesarios para unirse a la llamada');
      }

      setIsLoading(true);
      setError(null);

<<<<<<< HEAD
      const response = await fetch('/api/admin/generate-token', {
=======
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/generate-token`, {
>>>>>>> 51f11dc2048470616a97283ad32e7ed865f765c4
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idUsuario, idCurso })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el token');
      }

      const { token: agoraToken, uid, CHANNEL_NAME } = await response.json();
      
      // Guardar los datos necesarios en localStorage
      localStorage.setItem('agoraToken', agoraToken);
      localStorage.setItem('agoraUid', uid);
      localStorage.setItem('agoraChannel', CHANNEL_NAME);
      
      // Redirigir a la página de llamada usando navigate
      navigate(`/curso/${id}/llamada`, {
        state: {
          agoraData: {
            token: agoraToken,
            uid: uid,
            channel: CHANNEL_NAME
          }
        }
      });
      
    } catch (error) {
      console.error('Error al unirse a la llamada:', error);
      setError(error.message || 'Error al unirse a la videollamada');
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="curso-container">
      <Navbar />
      <div className="app-layout">
        <div className="app-sidebar">
          <div className="call-section">
            <div className="call-info">
              <h3>Sesión de Videollamada</h3>
              <p>Clase en vivo disponible</p>
            </div>
              <button className="join-call-button"
                  onClick={handleJoinCall}
                  disabled={isLoading}
                >
                  <FaVideo className="call-icon" />
                  <span className="button-text">
                    {isLoading ? 'Cargando...' : 'Unirse ahora'}
                  </span>
              </button>
          </div>
          
          <div className="calendar-section">
            <h3 className="sidebar-title">Calendario</h3>
            <CalendarioMaestro idCurso={decodedCourseId}/>
          </div>
        </div>
        
        <div className="app-content">
          <header className="content-header">
            <h1>Curso {decodedCourseId}</h1>
          </header>

          {error && (
            <div className="alert alert-error">
              <span className="material-icons">error</span>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <span className="material-icons">check_circle</span>
              <p>{successMessage}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando contenido del curso...</p>
            </div>
          ) : (
            <>
              {role === 'maestro' && (
                <div className="compose-post">
                  <form onSubmit={handlePostSubmit} className="post-form">
                    <input
                      name="title"
                      placeholder="Título de la publicación"
                      value={newPost.title}
                      onChange={handleInputChange}
                      className="post-title-input"
                      required
                    />
                    <textarea
                      name="content"
                      placeholder="Escribe un mensaje para la clase..."
                      value={newPost.content}
                      onChange={handleInputChange}
                      className="post-content-input"
                      rows="3"
                      required
                    />
                    <div className="compose-actions">
                      <button type="submit" className="submit-post-button">
                        Publicar
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="posts-feed">
                {posts.length === 0 ? (
                  <div className="empty-feed">
                    <div className="empty-icon">
                      <span className="material-icons">forum</span>
                    </div>
                    <h3>{successMessage || 'No hay publicaciones disponibles'}</h3>
                    {role === 'maestro' ? (
                      <p>Comienza compartiendo información con tus estudiantes</p>
                    ) : (
                      <p>El profesor aún no ha publicado contenido para este curso</p>
                    )}
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.idPubTablon} className="post">
                      <div className="post-content">
                        <div className="post-header">
                          <span className="post-author">Maestr@: {post.nombreMaestro || 'Profesor'}</span>
                          <span className="post-date">
                            {new Date(post.fechaPublicacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {post.tituloPublicacion && <h4 className="post-title">Título: {post.tituloPublicacion}</h4>}
                        <p className="post-text">Mensaje: {post.desPublicacion}</p>
                        
                        <div className="post-actions">
                          <button 
                            className="comment-toggle-button"
                            onClick={() => toggleCommentInput(post.idPubTablon)}
                          >
                            {activeCommentInputs[post.idPubTablon] ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                          </button>
                        </div>

                        {activeCommentInputs[post.idPubTablon] && (
                          <>
                            {(post.comentarios || []).length > 0 && (
                              <div className="post-comments">
                                {post.comentarios.map(comment => (
                                  <div key={comment.idComentario} className="comment">
                                    <div className="comment-content">
                                      <div className="comment-header">
                                        <span className="comment-author">{comment.nombreAlumno || 'Estudiante'}</span>
                                        <span className="comment-date">
                                          {new Date(comment.fechaComentario).toLocaleDateString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        {comment.idUsuario === getCurrentUserId() && (
                                          <button 
                                            className="delete-comment-button"
                                            onClick={() => deleteComment(post.idPubTablon, comment.idComentario)}
                                            title="Eliminar comentario"
                                          >
                                            <FaTrash size={14} />
                                          </button>
                                        )}
                                      </div>
                                      <p className="comment-text">{comment.comentario}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="new-comment-container">
                              <div className="new-comment">
                                <input
                                  type="text"
                                  placeholder="Escribe un comentario..."
                                  ref={el => commentInputRefs.current[post.idPubTablon] = el}
                                  onKeyPress={async (e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                      await addComment(post.idPubTablon, e.target.value);
                                    }
                                  }}
                                />
                                <div className="comment-actions">
                                  <button 
                                    className="send-comment-button"
                                    onClick={() => handleCommentSubmit(post.idPubTablon)}
                                  >
                                    <FaPaperPlane />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Curso;