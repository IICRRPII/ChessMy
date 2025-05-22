import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import Login from './pages/Login/Login'
import ProtectedRoute from './components/router/ProtectedRoute';
import Inicio from './pages/Inicio/Inicio';
import PagoExitoso from "./components/Venta/Pago-exitoso";
import ListEjercicios from "./components/Ejercicios/EjerAje/ListEjercicios";
import Ataquedoble from "./components/Ejercicios/EjerAje/AtaDoble/Ataquedoble";
import AtaDobleEx from "./components/Ejercicios/EjerAje/AtaDoble/AtaDobleEx";
import Desviacion from "./components/Ejercicios/EjerAje/Desviacion/Desviacion"
import DesviacionEx from "./components/Ejercicios/EjerAje/Desviacion/DesviacionEx";
import CursosMaes from "./pages/Cursos/CursosM/CursosMaes";
import CursosAlu from "./pages/Cursos/CursosA/CursosAlu";
import Curso from "./pages/Cursos/Curso/Curso";
import Gamevs from "./components/Chess/Gamevs";
import ChessGame from "./components/Chess/ChessGame";
import Llamadas from "./pages/Cursos/Llamadas/Llamadas";
import ProfessorBoard from "./components/Chess/ProfessorBoard"
import StudentBoard from "./components/Chess/StudentBoard"
import ProfessorChallenges from "./components/Chess/ProfessorChallenges"
import CrudMaestro from "./pages/Admin/CRUDM/CrudMaestros"
import CrudAlumno from "./pages/Admin/CRUDA/CrudAlumno";
import CrudPagos from "./pages/Admin/CRUDP/CrudPagos";
import CrudCursos from "./pages/Admin/CRUDC/CrudCursos";
import Profile from "./pages/Perfil/Profile";
import EjerciciosM from "./pages/Cursos/EjerciciosM/EjerciciosM";
 

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/auth-success" element={<AuthSuccessRedirect />} />
          <Route path="/Inicio" element={<ProtectedRoute> <Inicio /> </ProtectedRoute>} />
          <Route path="/pago-exitoso" element={<ProtectedRoute> <PagoExitoso /> </ProtectedRoute>} />
          <Route path="/lista_ejercicios" element={<ProtectedRoute> <ListEjercicios /> </ProtectedRoute>} />
          <Route path="/ataque_doble" element={<ProtectedRoute> <Ataquedoble /> </ProtectedRoute>} />
          <Route path="/ataque_doble_ejercicios" element={<ProtectedRoute> <AtaDobleEx /> </ProtectedRoute>} />
          <Route path="/desviacion" element={<ProtectedRoute> <Desviacion /> </ProtectedRoute>} />
          <Route path="/desviacion_ejercicios" element={<ProtectedRoute> <DesviacionEx /> </ProtectedRoute>} />
          <Route path="/tus_cursos" element={<ProtectedRoute> <CursosMaes /> </ProtectedRoute>} />
          <Route path="/tus_clases" element={<ProtectedRoute> <CursosAlu /> </ProtectedRoute>} />
          <Route path="/curso/:id" element={<ProtectedRoute> <Curso /> </ProtectedRoute>} />
          <Route path="/profile/:idUsuario" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/*Chess */}
          <Route path="/jugar_vs" element={<ProtectedRoute> <Gamevs /> </ProtectedRoute>} />
          <Route path="/jugar_AI" element={<ProtectedRoute> <ChessGame /> </ProtectedRoute> } />

          {/*Llamada Chess*/}
          <Route path="/curso/:id/llamada" element={<ProtectedRoute> <Llamadas /> </ProtectedRoute>} />

          <Route path="/professor-board" element={<ProtectedRoute> <ProfessorBoard /> </ProtectedRoute>} />
          <Route path="/professor-challenges" element={<ProtectedRoute> <ProfessorChallenges /> </ProtectedRoute>} />
          <Route path="/student-board" element={<ProtectedRoute> <StudentBoard /> </ProtectedRoute>} />
          <Route path="/ejercicios_maestro" element={<EjerciciosM />}/>

          {/*Admin*/}
          <Route path="/datos_maestros" element={<ProtectedRoute> <CrudMaestro /> </ProtectedRoute>} />
          <Route path="/datos_alumnos" element={<ProtectedRoute> <CrudAlumno /> </ProtectedRoute>} />
          <Route path="/datos_pagos" element={<ProtectedRoute> <CrudPagos /> </ProtectedRoute>} />
          <Route path="/datos_cursos" element={<ProtectedRoute> <CrudCursos /> </ProtectedRoute>} />
        </Routes>
      </Router>
    </div>
  )
}

//<Route path="/curso/:id" element={<ProtectedRoute> <Curso /> </ProtectedRoute>} />
// Componente que guarda la autenticación y redirige
const AuthSuccessRedirect = () => {
  React.useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
          localStorage.setItem("token", token); // Guarda el token
          window.location.href = "/inicio"; // Redirige a la página protegida
      } else {
          window.location.href = "/"; // Si no hay token, redirige al login
      }
  }, []);

  return <p>Autenticando...</p>;
};

export default App