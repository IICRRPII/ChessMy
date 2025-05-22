import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, message, Card, Upload, Form, Spin, Modal } from 'antd';
import { jwtDecode } from 'jwt-decode';
import './Profile.css';

const { TextArea } = Input;
const { Dragger } = Upload;

const Profile = () => {
  const { idUsuario } = useParams();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState({
    imagenPerfil: '',
    descripcionPerfil: '',
    usuarioNickname: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [localImage, setLocalImage] = useState('');

  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.userId ? String(decodedToken.userId) : null;
  const isOwner = currentUserId && String(idUsuario) === currentUserId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile/${idUsuario}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar perfil');
        }

        const data = await response.json();
        setProfile({
          imagenPerfil: data.imagenPerfil || '',
          descripcionPerfil: data.descripcionPerfil || '',
          usuarioNickname: data.usuarioNickname || ''
        });
        setLocalImage(data.imagenPerfil || '');
        form.setFieldsValue({
          usuarioNickname: data.usuarioNickname || '',
          descripcionPerfil: data.descripcionPerfil || ''
        });
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [idUsuario, form, token]);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile/${idUsuario}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir imagen');
      }

      const data = await response.json();
      setLocalImage(data.imageUrl);
      setProfile(prev => ({ ...prev, imagenPerfil: data.imageUrl }));
      return { success: true, imageUrl: data.imageUrl };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview || localImage);
    setPreviewVisible(true);
  };

  const getBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setLocalImage(profile.imagenPerfil);
    },
    beforeUpload: file => {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      if (!isImage) {
        message.error('Solo puedes subir archivos JPG/PNG/GIF!');
        return Upload.LIST_IGNORE;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('La imagen debe ser menor a 2MB!');
        return Upload.LIST_IGNORE;
      }

      getBase64(file).then(preview => {
        setLocalImage(preview);
      });

      setFileList([file]);
      return false;
    },
    fileList,
    listType: 'picture-card',
    onPreview: handlePreview,
    showUploadList: false,
    multiple: false,
    accept: 'image/*'
  };

  const saveProfile = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Subir imagen primero si hay una nueva
      if (fileList.length > 0) {
        const uploadResult = await handleImageUpload(fileList[0]);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
      }

      // Actualizar información del perfil
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile/${idUsuario}/info`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioNickname: values.usuarioNickname,
          descripcionPerfil: values.descripcionPerfil
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar perfil');
      }

      const data = await response.json();
      setProfile(prev => ({
        ...prev,
        usuarioNickname: data.usuarioNickname,
        descripcionPerfil: data.descripcionPerfil,
        imagenPerfil: localImage || prev.imagenPerfil
      }));

      setIsEditing(false);
      setFileList([]);
      message.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <Card
        title="Perfil de Usuario"
        loading={loading}
        extra={isOwner && (
          isEditing ? (
            <div className="profile-actions">
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={() => {
                  setIsEditing(false);
                  setLocalImage(profile.imagenPerfil);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={saveProfile}
                loading={loading}
              >
                Guardar cambios
              </Button>
            </div>
          ) : (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)}
            >
              Editar perfil
            </Button>
          )
        )}
      >
        <div className="profile-content">
          <div className="profile-avatar-section">
            {isEditing ? (
              <>
                <Dragger
                  {...uploadProps}
                  className="profile-upload-dragger"
                >
                  {localImage ? (
                    <img 
                      src={localImage} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">Haz clic o arrastra una imagen aquí</p>
                      <p className="ant-upload-hint">
                        Soporta solo imágenes JPG/PNG/GIF menores a 2MB
                      </p>
                    </>
                  )}
                </Dragger>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={() => document.querySelector('.profile-upload-dragger input').click()}
                  style={{ marginTop: 16 }}
                  loading={uploading}
                  disabled={uploading}
                >
                  {localImage !== profile.imagenPerfil ? 'Cambiar imagen' : 'Subir imagen'}
                </Button>
              </>
            ) : (
              <Avatar
                size={128}
                src={profile.imagenPerfil || <UserOutlined />}
                className="profile-avatar"
              />
            )}
          </div>

          <Form form={form} layout="vertical" className="profile-form">
            <Form.Item
              name="usuarioNickname"
              label="Nickname"
              rules={[
                { required: true, message: 'Por favor ingresa un nickname' },
                { max: 30, message: 'El nickname no puede exceder los 30 caracteres' }
              ]}
            >
              {isEditing ? (
                <Input 
                  placeholder="Tu nickname" 
                  maxLength={30}
                  showCount
                />
              ) : (
                <div className="profile-info-text">
                  {profile.usuarioNickname || 'No especificado'}
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="descripcionPerfil"
              label="Descripción"
              rules={[
                { max: 500, message: 'La descripción no puede exceder los 500 caracteres' }
              ]}
            >
              {isEditing ? (
                <TextArea 
                  rows={4} 
                  placeholder="Cuéntanos algo sobre ti" 
                  maxLength={500}
                  showCount
                />
              ) : (
                <div className="profile-info-text">
                  {profile.descripcionPerfil || 'No hay descripción'}
                </div>
              )}
            </Form.Item>
          </Form>
        </div>
      </Card>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default Profile;