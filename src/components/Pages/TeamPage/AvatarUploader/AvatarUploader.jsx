import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../cropImage';
import './AvatarUploader.css';

function AvatarUploader({ specialistId, onSave }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append('avatar', croppedImage, croppedImage.name);
      formData.append('specialistId', specialistId);

      const response = await fetch('http://localhost:3001/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onSave(data.avatarPath);  // Передаем путь к аватару в родительский компонент
      } else {
        console.error('Error uploading avatar');
      }
    } catch (error) {
      console.error('Error cropping image', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageSrc && (
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}
      {imageSrc && (
        <button onClick={handleSave} className="save-avatar-button">
          Save Avatar
        </button>
      )}
    </div>
  );
}

export default AvatarUploader;
