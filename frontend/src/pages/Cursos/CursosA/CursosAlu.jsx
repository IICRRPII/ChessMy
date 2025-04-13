import React, { useState, useEffect } from 'react';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  BookOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  FileOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { 
  Layout, 
  Menu, 
  Card, 
  Row, 
  Col, 
  Button, 
  theme, 
  Spin, 
  message, 
  Drawer, 
  List, 
  Avatar 
} from 'antd';
import { useNavigate } from 'react-router-dom';
import logo from './assets/LogoChessmy02.png'

const { Header, Sider, Content } = Layout;

const encodeBase64 = (str) => {
  return btoa(encodeURIComponent(str));
};

const generateRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292', '#A569BD', '#5DADE2'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CursosAlu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [courses, setCourses] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alumnosLoading, setAlumnosLoading] = useState(false);
  const [showAlumnos, setShowAlumnos] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    if (key === '5') {
      setShowAlumnos(true);
    } else if (key === '1') {
      navigate('/inicio'); // Redirecciona a la ruta '/inicio'
    }
  };

  const fetchCourses = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const endpoint = `/api/admin/cursos/getCursosAlumno/${userId}`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener cursos');
      }

      const data = await response.json();
      const formattedCourses = data.map(item => {
        const curso = item.Curso || item.curso || item;
        return {
          id: curso.idCurso || curso.id,
          title: curso.nombreCurso || curso.nombre || 'Curso sin nombre',
          code: curso.codigo || `CURSO-${curso.idCurso || curso.id}`,
          teacher: `Prof. ${curso.maestro || 'Usuario'}`,
          color: generateRandomColor(),
          description: curso.descripcion || ''
        };
      });
      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const tokenData = JSON.parse(decodedPayload);
        const userId = tokenData.userId;

        if (!userId) return;

        await fetchCourses(userId);
        
        if (showAlumnos) {
          await fetchAlumnos(userId);
        }
      } catch (error) {
        console.error('Error:', error);
        message.error('Error al cargar datos');
      }
    };

    fetchData();
  }, [showAlumnos]);

  return (
    <Layout className="layout-container">
        <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed}
            width={250}
            breakpoint="lg"
            collapsedWidth="80"
            onBreakpoint={(broken) => {
            if (broken) setCollapsed(true);
            else setCollapsed(false);
            }}
        >
        <div className="logo-container">
            {collapsed ? (
            <img 
                src={logo} 
                alt="Logo" 
                className="logo-collapsed" 
            />
            ) : (
            <img 
                src={logo} 
                alt="Logo Completo" 
                className="logo-expanded" 
            />
            )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          onClick={handleMenuClick}
          items={[
            {
                key: '1',
                icon: <HomeOutlined />,
                label: 'Inicio',
            },
            {
              key: '3',
              icon: <CalendarOutlined />,
              label: 'Calendario',
            },
            {
              key: '4',
              icon: <FileOutlined />,
              label: 'Tareas',
            },
          ]}
        />
      </Sider>

      <Drawer
        title="Mis Alumnos"
        width={400}
        onClose={() => setShowAlumnos(false)}
        open={showAlumnos}
        styles={{
          body: { padding: 15 } // Corregido: Reemplaza bodyStyle deprecated
        }}
      >
        {alumnosLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <Spin />
          </div>
        ) : alumnos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p>No tienes alumnos asignados</p>
          </div>
        ) : (
            <List
            itemLayout="horizontal"
            dataSource={alumnos}
            renderItem={(alumno) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={alumno.nombreCompleto}
                  description={
                    <>
                      <p>{alumno.email}</p>
                      <p><strong>Curso:</strong> {alumno.curso}</p>
                    </>
                  }
                />
            </List.Item>
            )}
          />
        )}
      </Drawer>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            </Col>
            <Col style={{ paddingRight: '24px' }}>
              <span style={{ fontWeight: 'bold' }}>Bienvenido, Alumno</span>
            </Col>
          </Row>
        </Header>
        <Content className="content-container" style={{ background: colorBgContainer }}>
          <h2 style={{ marginBottom: '20px' }}>Mis Cursos</h2>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Spin size="large" />
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No tienes cursos asignados actualmente</p>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
                {courses.map(course => (
                    <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                    <Card 
                        hoverable
                        className="course-card"
                        style={{ borderTop: `4px solid ${course.color}` }}
                        cover={
                        <div 
                            className="course-card-cover"
                            style={{ backgroundColor: course.color }}
                        />
                        }
                        onClick={() => navigate(`/curso/${encodeBase64(course.id.toString())}`)}
                    >
                        <Card.Meta
                        title={<h3 className="course-title">{course.title}</h3>}
                        description={
                            <>
                            <p className="course-code">{course.code}</p>
                            <p className="course-teacher">{course.teacher}</p>
                            {course.description && (
                                <p style={{ marginTop: '8px', fontSize: '0.9em' }}>
                                {course.description.length > 100 
                                    ? `${course.description.substring(0, 100)}...` 
                                    : course.description}
                                </p>
                            )}
                            </>
                        }
                        />
                    </Card>
                    </Col>
                ))}
            </Row>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CursosAlu;