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
  TeamOutlined,
  EyeOutlined
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
  InputNumber,
  Popconfirm,
  message,
  Tag,
  Card,
  Divider,
  Grid,
  Statistic,
  Select
} from 'antd';
import { useNavigate } from 'react-router-dom';
import './CrudCursos.css';
import logo from './assets/LogoChessmy02.png';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const CrudCursos = () => {
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

  // Estados para maestros
  const [maestros, setMaestros] = useState([]);
  const [loadingMaestros, setLoadingMaestros] = useState(false);

  // Estados para la búsqueda
  const [searchNombre, setSearchNombre] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Función para obtener los cursos del backend
  const fetchCursos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/cursos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los cursos');
      }

      const cursos = await response.json();
      const formattedData = cursos.map((curso) => ({
        key: curso.idCurso.toString(),
        idCurso: curso.idCurso,
        nombreCurso: curso.nombreCurso,
        descripcion: curso.descripcion,
        precio: curso.precio,
        cursoToken: curso.cursoToken,
        idLlamada: curso.idLlamada,
        totalAlumnos: curso.totalAlumnos,
        totalMaestros: curso.totalMaestros
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener los maestros
  const fetchMaestros = async () => {
    setLoadingMaestros(true);
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

      const maestrosData = await response.json();
      const maestrosFormateados = maestrosData.map(maestro => ({
        ...maestro,
        nombreCompleto: `${maestro.nombres || ''} ${maestro.apellidos || ''}`.trim()
      }));
      setMaestros(maestrosFormateados);
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar los maestros');
    } finally {
      setLoadingMaestros(false);
    }
  };

  useEffect(() => {
    fetchCursos();
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

  const fetchMaestroDelCurso = async (idCurso) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/curso/${idCurso}/maestro`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el maestro del curso');
      }

      const maestro = await response.json();
      return maestro;
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al cargar el maestro del curso');
      return null;
    }
  };

  // Modifica la función handleEdit para cargar el maestro actual
  const handleEdit = async (record) => {
    try {
      const maestro = await fetchMaestroDelCurso(record.idCurso);
      
      form.setFieldsValue({
        nombreCurso: record.nombreCurso,
        descripcion: record.descripcion,
        precio: record.precio,
        cursoToken: record.cursoToken,
        idLlamada: record.idLlamada,
        idMaestro: maestro?.idUsuario || null
      });
      
      setEditingKey(record.key);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar datos para edición:', error);
      message.error('Error al cargar datos del curso para edición');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (key) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/deleteCurso/${key}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el curso');
      }

      const result = await response.json();
      
      setData(data.filter(item => item.key !== key));
      
      if (searchResults && searchResults.key === key) {
        setSearchResults(null);
      }

      message.success('Curso eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      message.error('Error al eliminar el curso');
    }
  };

  const searchByNombre = async () => {
    if (!searchNombre) {
      message.warning('Ingrese un nombre para buscar');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/curso/nombre/${encodeURIComponent(searchNombre)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Curso no encontrado');
      }

      const curso = await response.json();
      setSearchResults({
        key: curso.idCurso.toString(),
        idCurso: curso.idCurso,
        nombreCurso: curso.nombreCurso,
        descripcion: curso.descripcion,
        precio: curso.precio,
        cursoToken: curso.cursoToken,
        idLlamada: curso.idLlamada,
        totalAlumnos: curso.totalAlumnos,
        totalMaestros: curso.totalMaestros
      });
      message.success('Curso encontrado');
    } catch (error) {
      console.error('Error:', error);
      setSearchResults(null);
      message.error('No se encontró ningún curso con ese nombre');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchNombre('');
    setSearchResults(null);
  };

  const createCurso = async (values) => {
    try {
      setConfirmLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/createCurso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreCurso: values.nombreCurso,
          descripcion: values.descripcion,
          precio: values.precio,
          idUsuario: values.idMaestro
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear el curso');
      }

      const result = await response.json();
      
      setData([...data, {
        key: result.curso.idCurso.toString(),
        idCurso: result.curso.idCurso,
        nombreCurso: result.curso.nombreCurso,
        descripcion: result.curso.descripcion,
        precio: result.curso.precio,
        cursoToken: result.curso.cursoToken,
        idLlamada: result.curso.idLlamada,
        totalAlumnos: 0,
        totalMaestros: 1
      }]);

      message.success(result.message || 'Curso creado correctamente');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Error al crear el curso');
    } finally {
      setConfirmLoading(false);
    }
  };

  const updateCurso = async (values) => {
    try {
      setConfirmLoading(true);
      const idCurso = editingKey;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/updateCurso/${idCurso}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreCurso: values.nombreCurso,
          descripcion: values.descripcion,
          precio: values.precio,
          idMaestro: values.idMaestro
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el curso');
      }

      const result = await response.json();
      
      // Actualizamos el estado local
      setData(data.map(item => 
        item.key === editingKey ? {
          ...item,
          nombreCurso: values.nombreCurso,
          descripcion: values.descripcion,
          precio: values.precio,
          // Actualizamos el contador de maestros si cambió
          totalMaestros: values.idMaestro !== item.idMaestro ? 1 : item.totalMaestros
        } : item
      ));

      message.success(result.message || 'Curso actualizado correctamente');
      setIsModalOpen(false);
      setEditingKey('');
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Error al actualizar el curso');
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmUpdate = async () => {
    try {
      setConfirmLoading(true);
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (editingKey) {
        await updateCurso(values);
      } else {
        await createCurso(values);
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
      dataIndex: 'idCurso',
      key: 'idCurso',
      width: 50,
    },
    {
      title: 'Nombre del Curso',
      dataIndex: 'nombreCurso',
      key: 'nombreCurso',
      width: 150,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      width: 200,
      render: (descripcion) => (
        <div style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '200px'
        }}>
          {descripcion}
        </div>
      ),
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (precio) => `$${precio.toFixed(2)}`,
      width: 80,
    },
    {
      title: 'Token',
      dataIndex: 'cursoToken',
      key: 'cursoToken',
      width: 120,
      render: (token) => (
        <Tag color="blue">{token}</Tag>
      ),
    },
    {
      title: 'ID Llamada',
      dataIndex: 'idLlamada',
      key: 'idLlamada',
      width: 130,
    },
    {
      title: 'Alumnos',
      dataIndex: 'totalAlumnos',
      key: 'totalAlumnos',
      width: 100,
      render: (count) => (
        <Statistic 
          value={count} 
          prefix={<TeamOutlined />} 
          valueStyle={{ fontSize: '16px' }} 
        />
      ),
    },
    {
      title: 'Maestros',
      dataIndex: 'totalMaestros',
      key: 'totalMaestros',
      width: 100,
      render: (count) => (
        <Statistic 
          value={count} 
          prefix={<UserOutlined />} 
          valueStyle={{ fontSize: '16px' }} 
        />
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small"
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Eliminar este curso?"
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
          defaultSelectedKeys={['5']}
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
                Administración de Cursos
              </span>
            </Col>
          </Row>
        </Header>
        <Content className="content-container" style={{ 
          background: colorBgContainer,
          padding: screens.xs ? '16px' : '24px',
          overflow: 'auto'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Lista de Cursos</h2>
          
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
                placeholder="Buscar curso por nombre"
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
                onSearch={searchByNombre}
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
              {screens.xs ? 'Nuevo' : 'Nuevo Curso'}
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
                  rowKey="idCurso"
                  scroll={false}
                  rowClassName="clickable-row"
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
                rowKey="idCurso"
                scroll={false}
                rowClassName="clickable-row"
              />
            </div>
          )}

          {/* Modal para agregar/editar */}
          <Modal
            title={editingKey ? "Editar Curso" : "Nuevo Curso"}
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
                <Form.Item
                  name="nombreCurso"
                  label="Nombre del Curso"
                  rules={[{ required: true, message: 'Ingrese el nombre del curso' }]}
                >
                  <Input placeholder="Ej. Ajedrez Intermedio" />
                </Form.Item>

                <Form.Item
                  name="descripcion"
                  label="Descripción"
                  rules={[{ required: true, message: 'Ingrese una descripción' }]}
                >
                  <TextArea rows={4} placeholder="Descripción detallada del curso..." />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                        name="precio"
                        label="Precio"
                        rules={[{ required: true, message: 'Ingrese el precio' }]}
                        >
                        <InputNumber 
                            style={{ width: '100%' }}
                            min={0}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Ej. 99.99"
                        />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                        name="idMaestro"
                        label="Maestro asignado"
                        rules={[{ required: true, message: 'Seleccione un maestro' }]}
                        >
                        <Select
                            placeholder="Seleccione un maestro"
                            loading={loadingMaestros}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {maestros.map(maestro => (
                            <Select.Option 
                                key={maestro.idUsuario} 
                                value={maestro.idUsuario}
                            >
                                {maestro.nombres} {maestro.apellidos} (ID: {maestro.idUsuario})
                            </Select.Option>
                            ))}
                        </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="cursoToken"
                      label="Token del Curso"
                    >
                      <Input placeholder="Generado automáticamente" disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="idLlamada"
                      label="ID de Llamada"
                    >
                      <Input placeholder="Generado automáticamente" disabled />
                    </Form.Item>
                  </Col>
                </Row>

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

export default CrudCursos;