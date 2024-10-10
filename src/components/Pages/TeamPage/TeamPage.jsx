import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import io from 'socket.io-client';
import Accordion from './Accordion';
import ReviewCardTeam from './ReviewCardTeam';
import CustomArrow from '../App/Svg/CustomArrow';
import SaveButton from '../../SaveButton/SaveButton'; // Импорт кнопки сохранения
import leftArrow from '../App/Svg/leftArrow.svg';
import rightArrow from '../App/Svg/rightArrow.svg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './TeamPage.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import AvatarUploader from './AvatarUploader/AvatarUploader'; // Импорт компонента для загрузки аватара



const socket = io('http://localhost:3001'); 

function TeamPage({ reviews, isAdmin, addReview }) {
  const { t } = useTranslation();

  const [nataliaCertificates, setNataliaCertificates] = useState([]);
  const [sebastianCertificates, setSebastianCertificates] = useState([]);
  const [nataliaAvatar, setNataliaAvatar] = useState(null);  // Состояние для аватара Натальи
  const [sebastianAvatar, setSebastianAvatar] = useState(null); // Состояние для аватара Себастьяна
  const [currentIndex, setCurrentIndex] = useState(0);
  const [changesMade, setChangesMade] = useState(false); // Состояние для отслеживания изменений
 const [liveReviews, setLiveReviews] = useState(reviews); 

  // Загрузка отзывов из пропсов при монтировании
  useEffect(() => {
    setLiveReviews(reviews);
  }, [reviews]);

  useEffect(() => {
  socket.on('new_review', (newReview) => {
    console.log('Новый отзыв получен через WebSocket:', newReview);
    setLiveReviews((prevReviews) => [...prevReviews, newReview]);
  });

  socket.on('review_deleted', (deletedReviewId) => {
    console.log('Отзыв удалён через WebSocket с id:', deletedReviewId);
    setLiveReviews((prevReviews) => prevReviews.filter(review => review.id !== deletedReviewId));
  });

  return () => {
    socket.off('new_review');
    socket.off('review_deleted');
  };
}, []);

  // Загрузка существующих сертификатов при загрузке компонента
  useEffect(() => {
    const fetchCertificates = async (specialistId, setCertificates) => {
      try {
        const response = await fetch(`http://localhost:3001/certificates/${specialistId}`);
        const data = await response.json();
        if (data.success) {
          setCertificates(data.certificates);
        }
      } catch (error) {
        console.error('Ошибка при загрузке сертификатов:', error);
      }
    };

    fetchCertificates('natalia', setNataliaCertificates);
    fetchCertificates('sebastian', setSebastianCertificates);
  }, []);

  useEffect(() => {
  const fetchAvatar = async (specialistId, setAvatar) => {
    try {
      const response = await fetch(`http://localhost:3001/avatar/${specialistId}`);
      const data = await response.json();
      if (data.success) {
        setAvatar(data.avatar); // Устанавливаем путь к аватару
      }
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error);
    }
  };

  // Загрузка аватара для каждого специалиста
  fetchAvatar('natalia', setNataliaAvatar);
  fetchAvatar('sebastian', setSebastianAvatar);
}, []);

  // Функция для обновления состояния аватара
  const handleAvatarSave = (avatarPath, specialistId) => {
    if (specialistId === 'natalia') {
      setNataliaAvatar(avatarPath);
    } else if (specialistId === 'sebastian') {
      setSebastianAvatar(avatarPath);
    }
  };

  const handleFileChange = async (event, specialistId) => {
    const files = Array.from(event.target.files);
    const formData = new FormData();

    formData.append('specialistId', specialistId);
    files.forEach((file) => {
      formData.append('certificates', file);  // Здесь 'certificates' должно совпадать с именем поля в multer
    });

    try {
      const response = await fetch('http://localhost:3001/upload-certificate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        const newCertificates = data.filePaths.map(path => path.split('/').pop());
        if (specialistId === 'natalia') {
          setNataliaCertificates([...nataliaCertificates, ...newCertificates]);
        } else if (specialistId === 'sebastian') {
          setSebastianCertificates([...sebastianCertificates, ...newCertificates]);
        }
        setChangesMade(true); // Обновляем состояние при изменениях
      } else {
        console.error('Ошибка при загрузке сертификатов на сервер.');
      }
    } catch (error) {
      console.error('Ошибка при загрузке сертификатов:', error);
    }
  };

  const handleDeleteCertificate = async (index, specialistId) => {
    const certificates = specialistId === 'natalia' ? nataliaCertificates : sebastianCertificates;
    const filePath = certificates[index];

    try {
      const response = await fetch('http://localhost:3001/delete-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath, specialistId }),
      });

      const data = await response.json();

      if (data.success) {
        let updatedCertificates;
        if (specialistId === 'natalia') {
          updatedCertificates = nataliaCertificates.filter((_, i) => i !== index);
          setNataliaCertificates(updatedCertificates);
        } else if (specialistId === 'sebastian') {
          updatedCertificates = sebastianCertificates.filter((_, i) => i !== index);
          setSebastianCertificates(updatedCertificates);
        }

        if (updatedCertificates.length === 0) {
          setCurrentIndex(0); // Сброс индекса, если все сертификаты удалены
        } else if (currentIndex >= updatedCertificates.length) {
          setCurrentIndex(updatedCertificates.length - 1); // Сброс на последний элемент
        }

        setChangesMade(true); // Обновляем состояние при изменениях
      } else {
        console.error('Ошибка при удалении сертификата.');
      }
    } catch (error) {
      console.error('Ошибка при удалении сертификата:', error);
    }
  };

  const handleSaveChanges = async () => {
    // После успешного сохранения всех изменений на сервере
    setChangesMade(false);
    alert('Изменения успешно сохранены');
  };

  const handleImageClick = (index) => {
    setCurrentIndex(index);
  };

  const specialists = [
    {
      id: 'natalia',
      name: t('specialist1.name'),
      photo: `http://localhost:3001${nataliaAvatar}`, // Используем загруженный аватар или дефолтное изображение
      description: `
        <p><strong>${t('specialist1.description.therapy')}</strong></p>
        <p><strong>${t('specialist1.description.experience')}</strong></p>       
        <p><strong>${t('specialist1.description.location')}</strong></p>
      `,
      details: [
        { title: t('specialist1.details.0.title'), content: t('specialist1.details.0.content', { returnObjects: true })  },
        { title: t('specialist1.details.1.title'), content: t('specialist1.details.1.content', { returnObjects: true })},
        { title: t('specialist1.details.2.title'), content: t('specialist1.details.2.content', { returnObjects: true })  },
        { title: t('specialist1.details.3.title'), content: t('specialist1.details.3.content', { returnObjects: true }) },
        { 
          title: t('specialist1.details.4.title'), 
          content: (
            <div>
              {isAdmin && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'natalia')}
                  style={{ marginBottom: '10px' }}
                />
              )}
              <Carousel
                selectedItem={currentIndex}
                onChange={handleImageClick}
                showThumbs={true}
                thumbWidth={100}
                infiniteLoop
                useKeyboardArrows
              >
                {nataliaCertificates.map((src, index) => (
                  <div key={index} className="certificate-slide">
                    <img 
                      src={`/uploads/${src}`} 
                      alt={`Certificate ${index + 1}`} 
                      onClick={() => handleImageClick(index)} 
                      className="certificate-image"
                    />
                  </div>
                ))}
              </Carousel>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteCertificate(currentIndex, 'natalia')}
                  className="delete-button"
                >
                  Удалить выбранное изображение
                </button>
              )}
            </div>
          )
        },
      ],
    },
    {
      id: 'sebastian',
      name: t('specialist2.name'),
      photo: `http://localhost:3001${sebastianAvatar}`, // Используем загруженный аватар или дефолтное изображение
      description: t('specialist2.description'),
      details: [
        { title: t('specialist2.details.0.title'), content: t('specialist2.details.0.content') },
        { title: t('specialist2.details.1.title'), content: t('specialist2.details.1.content') },
        { title: t('specialist2.details.2.title'), content: t('specialist2.details.2.content') },
        { title: t('specialist2.details.3.title'), content: t('specialist2.details.3.content') },
        { 
          title: t('specialist2.details.4.title'), 
          content: (
            <div>
              {isAdmin && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'sebastian')}
                  style={{ marginBottom: '10px' }}
                />
              )}
              <Carousel
                selectedItem={currentIndex}
                onChange={handleImageClick}
                showThumbs={true}
                thumbWidth={100}
                infiniteLoop
                useKeyboardArrows
              >
                {sebastianCertificates.map((src, index) => (
                  <div key={index} className="certificate-slide">
                    <img 
                      src={`/uploads/${src}`} 
                      alt={`Certificate ${index + 1}`} 
                      onClick={() => handleImageClick(index)} 
                      className="certificate-image"
                    />
                  </div>
                ))}
              </Carousel>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteCertificate(currentIndex, 'sebastian')}
                  className="delete-button"
                >
                  Удалить выбранное изображение
                </button>
              )}
            </div>
          )
        },
      ],
    },
  ];

  const settings = {
    dots: liveReviews.length > 1, // Показываем точки только если больше одного отзыва
    infinite: liveReviews.length > 1,
    speed: 500,
    slidesToShow: 3, // Всегда показываем ровно 3 слайда
    slidesToScroll: 1,
    arrows: true, // Всегда показываем стрелки
    autoplay: true, // Добавлено для автоматического переключения
    autoplaySpeed: 3000, // Интервал переключения в миллисекундах (2000 = 2 секунды)
    prevArrow: liveReviews.length > 0 ? <CustomArrow icon={leftArrow} /> : null,
    nextArrow: liveReviews.length > 0 ? <CustomArrow icon={rightArrow} /> : null,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2, // Для планшетов показываем 2 слайда
          slidesToScroll: 1,
          infinite: liveReviews.length > 1,
          dots: liveReviews.length > 1,
          arrows: liveReviews.length > 2, // Стрелки отображаются, если отзывов больше 2
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1, // Для мобильных устройств показываем 1 слайд
          slidesToScroll: 1,
          infinite: liveReviews.length > 1,
          dots: liveReviews.length > 1,
          arrows: false, // На мобильных устройствах стрелки отключены
        },
      },
    ],
  };

  return (
    <div className="team-page">
      {specialists.map((specialist, index) => (
        <div key={index} className="specialist">
          <h2 className="specialist-name">{specialist.name}</h2>
          <div className="specialist-info">
            <img src={specialist.photo} alt={specialist.name} className="specialist-photo" />
            <div className="specialist-description" dangerouslySetInnerHTML={{ __html: specialist.description }}></div>
            {isAdmin && (
              <div className="avatar-uploader">
                <AvatarUploader specialistId={specialist.id} onSave={(avatarPath) => handleAvatarSave(avatarPath, specialist.id)} />
              </div>
            )}
          </div>
          <Accordion items={specialist.details} />
          <div className="specialist-reviews">
            <h3>{t('reviews.title')}</h3>
            {liveReviews.length > 0 && (
  <Slider {...settings}>
    {liveReviews.map((review, index) => (
      <ReviewCardTeam key={`${review.id}-${index}`} review={review} />
    ))}
  </Slider>
)}
          </div>
        </div>
      ))}
      {isAdmin && changesMade && (
        <div className="save-changes-container">
          <SaveButton onClick={handleSaveChanges} />
        </div>
      )}
    </div>
  );
}

export default TeamPage;
