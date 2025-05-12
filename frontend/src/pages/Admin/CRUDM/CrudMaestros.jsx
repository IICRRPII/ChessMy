import React, { useState, useEffect } from 'react';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  SearchOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined
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
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Tag,
  Card,
  Divider,
  Grid
} from 'antd';
import { useNavigate } from 'react-router-dom';
import './CrudMaestros.css';
import logo from './assets/LogoChessmy02.png';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import locale from 'antd/es/date-picker/locale/es_ES';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { useBreakpoint } = Grid;

const CrudMaestros = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Estados para la tabla CRUD
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Estados para la búsqueda
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Función para obtener los maestros del backend
  const fetchMaestros = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maestros`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los maestros');
      }

      const maestros = await response.json();
      const formattedData = maestros.map((maestro) => ({
        key: maestro.idUsuario.toString(),
        id: maestro.idUsuario,
        nombre: maestro.nombres,
        apellido: maestro.apellidos,
        correo: maestro.correoUsuario,
        fechaRegistro: maestro.fechaRegistro,
        estadoCuenta: maestro.estadoCuenta || 'activa',
        rol: maestro.rolUsuario
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar los maestros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaestros();
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key === '1') {
      navigate('/inicio');
    }
    if (key === '2') {
      navigate('/datos_maestros');
    }
    if (key === '3') {
        navigate('/datos_alumnos');
    }
    if (key === '4') {
      navigate('/datos_pagos');
    }
    if (key === '5') {
      navigate('/datos_cursos');
    }
  };

  // Funciones para el CRUD
  const showModal = () => {
    form.resetFields();
    setEditingKey('');
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      nombre: record.nombre,
      apellido: record.apellido,
      correo: record.correo,
      fechaRegistro: dayjs(record.fechaRegistro),
      estadoCuenta: record.estadoCuenta,
      rol: record.rol,
    });
    setEditingKey(record.key);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (key) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maestro/${key}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el maestro');
      }
  
      const result = await response.json();
      
      setData(data.filter(item => item.key !== key));
      
      if (searchResults && searchResults.key === key) {
        setSearchResults(null);
      }
      
      message.success('Maestro eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al eliminar el maestro');
    } finally {
      setLoading(false);
    }
  };

  const searchByEmail = async () => {
    if (!searchEmail) {
      message.warning('Ingrese un correo para buscar');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maestro/correo/${encodeURIComponent(searchEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Maestro no encontrado');
      }

      const maestro = await response.json();
      setSearchResults({
        key: maestro.idUsuario.toString(),
        id: maestro.idUsuario,
        nombre: maestro.nombres,
        apellido: maestro.apellidos,
        correo: maestro.correoUsuario,
        fechaRegistro: maestro.fechaRegistro,
        estadoCuenta: maestro.estadoCuenta || 'activa',
        rol: maestro.rolUsuario
      });
      message.success('Maestro encontrado');
    } catch (error) {
      console.error('Error:', error);
      setSearchResults(null);
      message.error('No se encontró ningún maestro con ese correo');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchEmail('');
    setSearchResults(null);
  };

  const createMaestro = async (values) => {
    try {
      setConfirmLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maestro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres: values.nombre,
          apellidos: values.apellido,
          correoUsuario: values.correo,
          fechaRegistro: values.fechaRegistro.format('YYYY-MM-DD'),
          estadoCuenta: values.estadoCuenta,
          rolUsuario: 'maestro'
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear el maestro');
      }

      const nuevoMaestro = await response.json();
      
      setData([...data, {
        key: nuevoMaestro.idUsuario.toString(),
        id: nuevoMaestro.idUsuario,
        nombre: nuevoMaestro.nombres,
        apellido: nuevoMaestro.apellidos,
        correo: nuevoMaestro.correoUsuario,
        fechaRegistro: nuevoMaestro.fechaRegistro,
        estadoCuenta: nuevoMaestro.estadoCuenta || 'activa',
        rol: 'maestro'
      }]);

      message.success('Maestro creado correctamente');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al crear el maestro');
    } finally {
      setConfirmLoading(false);
    }
  };

  const updateMaestro = async (values) => {
    try {
      const id = editingKey;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maestro/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres: values.nombre,
          apellidos: values.apellido,
          correoUsuario: values.correo,
          fechaRegistro: values.fechaRegistro.format('YYYY-MM-DD'),
          estadoCuenta: values.estadoCuenta,
          rolUsuario: values.rol
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el maestro');
      }

      const maestroActualizado = await response.json();
      
      setData(data.map(item => 
        item.key === editingKey ? {
          ...item,
          nombre: values.nombre,
          apellido: values.apellido,
          correo: values.correo,
          fechaRegistro: values.fechaRegistro.format('YYYY-MM-DD'),
          estadoCuenta: values.estadoCuenta,
          rol: values.rol
        } : item
      ));

      message.success('Maestro actualizado correctamente');
      setIsModalOpen(false);
      setEditingKey('');
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al actualizar el maestro');
    }
  };

  const confirmUpdate = async () => {
    try {
      setConfirmLoading(true);
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (editingKey) {
        await updateMaestro(values);
      } else {
        await createMaestro(values);
      }
    } catch (error) {
      console.error('Error de validación:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 100,
    },
    {
      title: 'Apellido',
      dataIndex: 'apellido',
      key: 'apellido',
      width: 110,
    },
    {
      title: 'Correo',
      dataIndex: 'correo',
      key: 'correo',
      width: 150,
    },
    {
      title: 'Fecha Registro',
      dataIndex: 'fechaRegistro',
      key: 'fechaRegistro',
      render: (fecha) => dayjs(fecha).format('DD/MM/YYYY'),
      width: 120,
    },
    {
      title: 'Estado Cuenta',
      dataIndex: 'estadoCuenta',
      key: 'estadoCuenta',
      render: (estado) => (
        <Tag color={estado === 'activa' ? 'green' : 'red'}>
          {estado.toUpperCase()}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (rol) => (
        <Tag color={
          rol === 'maestro' ? 'blue' : 
          rol === 'admin' ? 'purple' : 'orange'
        }>
          {rol.toUpperCase()}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small"
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Eliminar este usuario?"
            onConfirm={() => handleDelete(record.key)}
            okText="Sí"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
          defaultSelectedKeys={['1']}
          onClick={handleMenuClick}
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
                Administración de Maestros
              </span>
            </Col>
          </Row>
        </Header>
        <Content className="content-container" style={{ 
          background: colorBgContainer,
          padding: screens.xs ? '16px' : '24px',
          overflow: 'auto'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Lista de Maestros</h2>
          
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
                placeholder="Buscar maestro por correo"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onSearch={searchByEmail}
                loading={searchLoading}
                allowClear
                onClear={clearSearch}
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
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showModal} 
              style={{
                background: '#212121',
                width: screens.xs ? '100%' : 'auto'
              }}
            >
              {screens.xs ? 'Nuevo' : 'Nuevo Maestro'}
            </Button>
          </div>
          
          {searchResults ? (
            <>
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button 
                        onClick={clearSearch}
                        style={{
                        color: '#212121',
                        borderColor: '#212121',
                        }}
                        className="custom-search-button"
                    >
                        Mostrar todos
                    </Button>
                </div>
              <div style={{ 
                width: '100%',
                overflowX: 'auto'
              }}>
                <Table 
                  columns={columns} 
                  dataSource={[searchResults]} 
                  bordered
                  pagination={false}
                  rowKey="id"
                  scroll={{ x: true }}
                />
              </div>
            </>
          ) : (
            <div style={{ 
              width: '100%',
              overflowX: 'auto'
            }}>
              <Table 
                columns={columns} 
                dataSource={data} 
                bordered
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowKey="id"
                scroll={{ x: true }}
              />
            </div>
          )}

          {/* Modal para agregar/editar */}
          <Modal
            title={editingKey ? "Editar Maestro" : "Nuevo Maestro"}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={screens.xs ? '90%' : 700}
            destroyOnClose
            style={{ top: screens.xs ? 16 : 50 }}
          >
            <Form
              form={form}
              layout="vertical"
            >
              <Card bordered={false}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="nombre"
                      label="Nombre"
                      rules={[{ required: true, message: 'Ingrese el nombre' }]}
                    >
                      <Input placeholder="Ej. Juan" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="apellido"
                      label="Apellido"
                      rules={[{ required: true, message: 'Ingrese el apellido' }]}
                    >
                      <Input placeholder="Ej. Pérez" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="correo"
                  label="Correo electrónico"
                  rules={[
                    { required: true, message: 'Ingrese el correo' },
                    { type: 'email', message: 'Correo no válido' }
                  ]}
                >
                  <Input placeholder="Ej. ejemplo@dominio.com" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="fechaRegistro"
                      label="Fecha de Registro"
                      rules={[{ required: true, message: 'Seleccione la fecha' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        format="DD/MM/YYYY"
                        placeholder="Seleccione fecha"
                        locale={locale}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="estadoCuenta"
                      label="Estado de Cuenta"
                      rules={[{ required: true, message: 'Seleccione el estado' }]}
                    >
                      <Select placeholder="Seleccione estado">
                        <Option value="activa">Activa</Option>
                        <Option value="inactivo">Inactivo</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {editingKey ? (
                  <Form.Item
                    name="rol"
                    label="Rol"
                    rules={[{ required: true, message: 'Seleccione el rol' }]}
                  >
                    <Select placeholder="Seleccione rol">
                      <Option value="maestro">Maestro</Option>
                      <Option value="alumno">Alumno</Option>
                      <Option value="admin">Administrador</Option>
                    </Select>
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="rol"
                    label="Rol"
                    initialValue="maestro"
                  >
                    <Input 
                      readOnly 
                      prefix={<BookOutlined />} 
                      value="Maestro" 
                    />
                  </Form.Item>
                )}

                <Divider />

                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Space>
                    <Button onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Popconfirm
                      title="¿Está seguro de guardar los cambios?"
                      icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                      onConfirm={confirmUpdate}
                      okText="Sí, guardar"
                      cancelText="No"
                      okButtonProps={{ loading: confirmLoading }}
                    >
                      <Button type="primary">
                        {editingKey ? 'Actualizar' : 'Guardar'}
                      </Button>
                    </Popconfirm>
                  </Space>
                </Form.Item>
              </Card>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CrudMaestros;