import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../cropImage';
import './AvatarUploader.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

function AvatarUploader({ specialistId, onSave }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_, area) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // простая валидация типа/размера
    if (!file.type.startsWith('image/')) {
      alert('Выберите файл изображения.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Слишком большой файл (макс. 8MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    // сбрасываем input, чтобы можно было выбрать тот же файл повторно
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !specialistId) return;

    try {
      setIsSaving(true);

      // getCroppedImg может вернуть Blob или File — приводим к File
      let cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!(cropped instanceof File)) {
        // если Blob — оборачиваем в File
        cropped = new File([cropped], 'avatar.jpg', { type: 'image/jpeg' });
      }

      const formData = new FormData();
      formData.append('avatar', cropped, cropped.name || 'avatar.jpg');
      formData.append('specialistId', String(specialistId));

      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Нет токена. Войдите как администратор.');
        setIsSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/upload-avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // JWT
          // НЕ указывать 'Content-Type' — браузер сам выставит boundary для multipart/form-data
        },
        body: formData,
      });

      const data = await res.json();
      if (data?.success && data.avatarPath) {
        // добавим cache-busting параметр, чтобы сразу увидеть новую картинку
        const url = `${data.avatarPath}?v=${Date.now()}`;
        onSave?.(url);
        // сбросим кроппер
        setImageSrc(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      } else {
        console.error('Upload avatar error:', data);
        alert('Не удалось загрузить аватар.');
      }
    } catch (err) {
      console.error('Error cropping/uploading avatar:', err);
      alert('Ошибка при обработке изображения.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="avatar-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {imageSrc && (
        <>
          <div className="crop-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              zoomWithScroll
              minZoom={1}
              maxZoom={4}
              restrictPosition={true}
            />
          </div>

          <div className="controls">
            <label className="zoom-label">
              Zoom:
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>

            <button
              onClick={handleSave}
              className="save-avatar-button"
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save Avatar'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AvatarUploader;
