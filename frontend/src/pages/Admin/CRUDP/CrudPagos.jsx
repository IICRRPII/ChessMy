import React, { useState, useEffect } from 'react';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  BookOutlined,
  SearchOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { 
  Layout, 
  Menu, 
  Row, 
  Col, 
  Button, 
  theme,
  Table,
  Space,
  Input,
  Select,
  Popconfirm,
  message,
  Tag,
  Card,
  Spin,
  Grid
} from 'antd';
import { useNavigate } from 'react-router-dom';
import logo from './assets/LogoChessmy02.png';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import locale from 'antd/es/date-picker/locale/es_ES';
import './CrudPagos.css'

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { useBreakpoint } = Grid;

const CrudPagos = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Estados para los pagos
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Función para decodificar el token JWT
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Obtener el ID del usuario y verificar si es admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        const id = decoded.userId;
        if (id) {
          setUserId(id);
        }
        if (decoded.rolGlobal === 'admin') {
          setIsAdmin(true);
        }
      }
    }
  }, []);

  // Función para obtener los pagos
  const fetchPagos = async () => {
    if (!userId || !isAdmin) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pagos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Error al obtener los pagos');
      }
  
      const data = await response.json();
      setPagos(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar pagos
  const handleSearch = async () => {
    if (!searchText.trim()) {
      fetchPagos();
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pagos/buscar?query=${encodeURIComponent(searchText)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const results = await response.json();
      setPagos(results);
    } catch (error) {
      message.error(error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Cargar los pagos cuando se verifique que es admin
  useEffect(() => {
    if (isAdmin && userId) {
      fetchPagos();
    }
  }, [isAdmin, userId]);

  // Columnas para la tabla de pagos
  const columns = [
    {
      title: 'ID Pago',
      dataIndex: 'idPago',
      key: 'idPago',
      width: screens.xs ? 100 : 200,
      render: (id) => <Tag color="blue">{id}</Tag>,
      fixed: screens.xs ? 'left' : false,
    },
    {
      title: 'Transacción',
      dataIndex: 'idTransaccion',
      key: 'idTransaccion',
      width: screens.xs ? 150 : 180,
      render: (id) => id || <Tag color="gray">N/A</Tag>,
    },
    screens.md ? {
      title: 'ID Orden',
      dataIndex: 'idOrden',
      key: 'idOrden',
      width: 150,
    } : null,
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      width: screens.xs ? 100 : 120,
      render: (monto, record) => {
        const amount = typeof monto === 'string' ? parseFloat(monto) : monto;
        const formattedAmount = typeof amount === 'number' && !isNaN(amount) 
          ? amount.toFixed(2) 
          : '0.00';
        
        return (
          <span>
            {screens.xs ? formattedAmount : `${formattedAmount} ${record.monedaTipo || ''}`}
          </span>
        );
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: screens.xs ? 150 : 180,
      render: (fecha) => screens.xs ? dayjs(fecha).format('DD/MM') : dayjs(fecha).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    },
    {
      title: 'Estado',
      dataIndex: 'estatus',
      key: 'estatus',
      width: screens.xs ? 100 : 120,
      filters: [
        { text: 'Completado', value: 'COMPLETED' },
        { text: 'Pendiente', value: 'CREATED' },
        { text: 'Fallido', value: 'FAILED' },
      ],
      onFilter: (value, record) => record.estatus === value,
      render: (estatus) => {
        let color = '';
        let text = '';
        
        switch(estatus) {
          case 'COMPLETED':
            color = 'green';
            text = screens.xs ? 'C' : 'Completado';
            break;
          case 'CREATED':
            color = 'orange';
            text = screens.xs ? 'P' : 'Pendiente';
            break;
          case 'FAILED':
            color = 'red';
            text = screens.xs ? 'F' : 'Fallido';
            break;
          default:
            color = 'gray';
            text = estatus;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    isAdmin && screens.md ? {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small"
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEditPago(record)}
          />
          <Popconfirm
            title="¿Eliminar este pago?"
            onConfirm={() => handleDeletePago(record.idPago)}
            okText="Sí"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    } : null,
  ].filter(Boolean);

  const handleEditPago = (pago) => {
    // Implementar lógica de edición
    message.info(`Editar pago ${pago.idPago}`);
  };

  const handleDeletePago = (idPago) => {
    // Implementar lógica de eliminación
    message.info(`Eliminar pago ${idPago}`);
  };

  return (
    <Layout className="layout-container">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        breakpoint="lg"
        collapsedWidth={screens.xs ? 0 : 80}
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
          else setCollapsed(false);
        }}
        style={{
          height: '100vh',
          position: screens.xs ? 'absolute' : 'relative',
          zIndex: 100,
          left: screens.xs && collapsed ? '-100%' : 0
        }}
      >
        <div className="logo-container">
          {collapsed ? (
            <img src={logo} alt="Logo" className="logo-collapsed" />
          ) : (
            <img src={logo} alt="Logo Completo" className="logo-expanded" />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['4']}
          onClick={({ key }) => {
            if (key === '1') navigate('/inicio');
            if (key === '2') navigate('/datos_maestros');
            if (key === '3') navigate('/datos_alumnos');
            if (key === '4') navigate('/datos_pagos');
            if (key === '5') navigate('/datos_cursos');
          }}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: 'Inicio',
            },
            {
              key: '2',
              icon: <UserOutlined />,
              label: 'Maestros',
            },
            {
              key: '3',
              icon: <TeamOutlined />,
              label: 'Alumnos',
            },
            {
              key: '4',
              icon: <DollarOutlined />,
              label: 'Pagos',
            },
            {
              key: '5',
              icon: <BookOutlined />,
              label: 'Cursos',
            }
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          position: screens.xs ? 'sticky' : 'static',
          top: 0,
          zIndex: 99,
          width: '100%'
        }}>
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
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: screens.xs ? '16px' : '20px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: screens.xs ? '150px' : 'none'
              }}>
                Administración de Pagos
              </span>
            </Col>
          </Row>
        </Header>
        <Content className="content-container" style={{ 
          background: colorBgContainer,
          padding: screens.xs ? '16px' : '24px',
          overflow: 'auto'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Lista de Pagos</h2>
          
          {!isAdmin ? (
            <Card>
              <p>No tienes permisos de administrador para ver esta sección.</p>
            </Card>
          ) : (
            <>
              <div style={{ 
                marginBottom: 16, 
                display: 'flex', 
                gap: '16px', 
                alignItems: 'center',
                flexDirection: screens.xs ? 'column' : 'row'
              }}>
                <div style={{ 
                  flex: 1,
                  width: screens.xs ? '100%' : 'auto'
                }}>
                  <Input.Search
                    placeholder="Buscar por ID, usuario o monto"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={handleSearch}
                    loading={searchLoading}
                    allowClear
                    onClear={() => {
                      setSearchText('');
                      fetchPagos();
                    }}
                    enterButton={<Button 
                        style={{ 
                          backgroundColor: '#212121', 
                          borderColor: '#212121', 
                          color: '#fff'
                        }} 
                        icon={<SearchOutlined />} 
                      />}
                  />
                </div>
              </div>
              
              <Spin spinning={loading || searchLoading}>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <Table 
                    columns={columns} 
                    dataSource={pagos} 
                    bordered
                    rowKey="idPago"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                    size={screens.xs ? 'small' : 'middle'}
                  />
                </div>
              </Spin>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CrudPagos;