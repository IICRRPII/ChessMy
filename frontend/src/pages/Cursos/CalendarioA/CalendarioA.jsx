import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaCalendarAlt, 
  FaClock 
} from 'react-icons/fa';
import './CalendarioA.css';

// Componente para mostrar un ítem de tarea
const TaskItem = ({ task }) => (
  <li className={`task-item ${task.completado ? 'completed' : 'pending'}`}>
    <div className="task-header">
      <span className={`task-status ${task.completado ? 'completed' : 'pending'}`}></span>
      <div className="task-info">
        <strong>{task.descripcion}</strong>
        <div className="task-meta">
          <span className="task-teacher">{task.nombreMaestro}</span>
          {task.horaFinal && (
            <span className="task-time">
              <FaClock /> {task.horaFinal}
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="task-dates">
      <span className="task-date">
        <FaCalendarAlt /> Entrega: {task.diaFinal}/{task.mesFinal}/{task.añoFinal}
      </span>
    </div>
    {task.completado ? (
      <div className="task-completed">
        <FaCheckCircle /> Completado
      </div>
    ) : (
      <div className="task-pending">
        <FaExclamationCircle /> Pendiente
      </div>
    )}
  </li>
);

TaskItem.propTypes = {
  task: PropTypes.shape({
    idEjercicioCurso: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    descripcion: PropTypes.string.isRequired,
    nombreMaestro: PropTypes.string.isRequired,
    horaFinal: PropTypes.string,
    diaFinal: PropTypes.number.isRequired,
    mesFinal: PropTypes.number.isRequired,
    añoFinal: PropTypes.number.isRequired,
    completado: PropTypes.bool.isRequired
  }).isRequired
};

// Componente para mostrar un día del calendario
const CalendarDay = ({ 
  day, 
  isToday, 
  isSelected, 
  hasTasks, 
  taskTypeClass, 
  taskCount, 
  onClick 
}) => (
  <div 
    className={`calendar-day 
      ${isToday ? 'today' : ''} 
      ${isSelected ? 'selected' : ''}
      ${hasTasks ? 'has-tasks' : ''}
      ${taskTypeClass}`}
    onClick={onClick}
    aria-label={`Día ${day}${isToday ? ', hoy' : ''}${hasTasks ? `, ${taskCount} tareas` : ''}`}
  >
    {day}
    {hasTasks && (
      <span className="task-indicator">
        <span className="task-count">{taskCount}</span>
      </span>
    )}
  </div>
);

CalendarDay.propTypes = {
  day: PropTypes.number.isRequired,
  isToday: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  hasTasks: PropTypes.bool.isRequired,
  taskTypeClass: PropTypes.string.isRequired,
  taskCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

// Componente principal del calendario
const CalendarioA = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Obtener cursoId de los parámetros de la URL
  const obtenerIdCurso = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('cursoId');
  };

  const cursoId = obtenerIdCurso();

  // Obtener userId del token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId);
      } catch (error) {
        console.error('Error decodificando token:', error);
        setError('Error al cargar los datos del usuario');
      }
    }
  }, []);

  // Función para obtener ejercicios del curso
  const fetchEjerciciosCurso = useCallback(async (cursoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ver-ejercicios-curso/${cursoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener ejercicios del curso");
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error obteniendo ejercicios del curso:", error);
      throw error;
    }
  }, []);

  // Función para obtener ejercicios completados por el alumno
  const fetchEjerciciosAlumno = useCallback(async (userId, cursoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ver-ejercicios-del-usuario-en-el-curso/${cursoId}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener ejercicios del alumno");
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error obteniendo ejercicios del alumno:", error);
      throw error;
    }
  }, []);

  // Procesar y combinar los datos de los ejercicios
  const processTasks = useCallback((ejerciciosCurso, ejerciciosAlumno) => {
    // Crear un Set con los IDs de ejercicios completados
    const ejerciciosCompletadosIds = new Set(
      ejerciciosAlumno.map(ej => ej.idEjercicioCurso)
    );
    
    // Filtrar para obtener solo ejercicios pendientes
    return ejerciciosCurso
      .filter(ejCurso => !ejerciciosCompletadosIds.has(ejCurso.idEjercicioCurso))
      .map(ejCurso => ({
        ...ejCurso,
        estatusEjercicio: 'pendiente',
        completado: false,
        diaInicio: ejCurso.diaInicio,
        mesInicio: ejCurso.mesInicio,
        añoInicio: ejCurso.añoInicio,
        diaFinal: ejCurso.diaFinal,
        mesFinal: ejCurso.mesFinal,
        añoFinal: ejCurso.añoFinal,
        horaFinal: ejCurso.horaFinal,
        descripcion: ejCurso.descripcion,
        nombreMaestro: ejCurso.nombreMaestro
      }));
  }, []);

  // Cargar los datos
  const loadData = useCallback(async () => {
    if (!userId || !cursoId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [ejerciciosCurso, ejerciciosAlumno] = await Promise.all([
        fetchEjerciciosCurso(cursoId),
        fetchEjerciciosAlumno(userId, cursoId)
      ]);

      const processedTasks = processTasks(ejerciciosCurso, ejerciciosAlumno);
      setTasks(processedTasks);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del calendario');
    } finally {
      setIsLoading(false);
    }
  }, [userId, cursoId, fetchEjerciciosCurso, fetchEjerciciosAlumno, processTasks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generar los días del calendario
  const generateDays = useCallback(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];

    // Días vacíos para alinear
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      // Solo mostrar en día final de entrega
      const dayTasks = tasks.filter(task => {
        return i === task.diaFinal && 
               month === task.mesFinal - 1 && 
               year === task.añoFinal;
      });

      const isToday = i === new Date().getDate() && 
                      month === new Date().getMonth() && 
                      year === new Date().getFullYear();

      const isSelected = i === selectedDay;

      days.push(
        <CalendarDay
          key={`day-${i}`}
          day={i}
          isToday={isToday}
          isSelected={isSelected}
          hasTasks={dayTasks.length > 0}
          taskTypeClass="pending-tasks" // Todos son pendientes ahora
          taskCount={dayTasks.length}
          onClick={() => handleDayClick(i)}
        />
      );
    }

    return days;
  }, [currentDate, selectedDay, tasks]);

  const handleDayClick = useCallback((day) => {
    setSelectedDay(day);
  }, []);

  const changeMonth = useCallback((increment) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      
      if (newDate.getMonth() < 0) {
        newDate.setFullYear(newDate.getFullYear() - 1);
        newDate.setMonth(11);
      } else if (newDate.getMonth() > 11) {
        newDate.setFullYear(newDate.getFullYear() + 1);
        newDate.setMonth(0);
      }
      
      return newDate;
    });
  }, []);

  // Obtener tareas para el día seleccionado
  const getDayTasks = useCallback(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    return tasks.filter(task => {
      return selectedDay === task.diaFinal && 
             month === task.mesFinal - 1 && 
             year === task.añoFinal;
    });
  }, [currentDate, selectedDay, tasks]);

  // Formatear la fecha seleccionada
  const formatSelectedDate = useCallback(() => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      selectedDay
    );
    
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }, [currentDate, selectedDay]);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={loadData}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="demo-container">
      <div className="Calendario">
        <div className="calendar-container">
          <div className="calendar-header">
            <button 
              className="calendar-nav" 
              onClick={() => changeMonth(-1)}
              aria-label="Mes anterior"
            >
              <FaChevronLeft />
            </button>
            <h3>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button 
              className="calendar-nav" 
              onClick={() => changeMonth(1)}
              aria-label="Mes siguiente"
            >
              <FaChevronRight />
            </button>
          </div>
          
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {isLoading ? (
                <div className="loading-spinner">
                  Cargando calendario...
                </div>
              ) : (
                generateDays()
              )}
            </div>
          </div>
        </div>
        
        <div className="calendar-tasks">
          <h4>
            Tareas del día <span id="selected-date">{formatSelectedDate()}</span>
          </h4>
          
          {isLoading ? (
            <div className="loading-spinner">
              Cargando tareas...
            </div>
          ) : (
            <ul id="tasks-list">
              {getDayTasks().length === 0 ? (
                <li className="no-tasks">
                  No hay tareas pendientes para este día
                </li>
              ) : (
                getDayTasks().map(task => (
                  <TaskItem key={task.idEjercicioCurso} task={task} />
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioA;