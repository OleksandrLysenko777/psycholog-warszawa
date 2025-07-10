import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Slider from 'react-slick';
import io from 'socket.io-client';
import Accordion from './Accordion';
import ReviewCardTeam from './ReviewCardTeam';
import CustomArrow from '../App/Svg/CustomArrow';
import SaveButton from '../../SaveButton/SaveButton';
import leftArrow from '../App/Svg/leftArrow.svg';
import rightArrow from '../App/Svg/rightArrow.svg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './TeamPage.css';
import AvatarUploader from './AvatarUploader/AvatarUploader';
import TiptapEditor from '../../TiptapEditor/TiptapEditor';

const socket = io('http://localhost:3001');

function TeamPage({ reviews, isAdmin, addReview }) {
  const { t } = useTranslation();

  const [nataliaCertificates, setNataliaCertificates] = useState([]);
  const [nataliaAvatar, setNataliaAvatar] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [changesMade, setChangesMade] = useState(false);
  const [liveReviews, setLiveReviews] = useState(reviews);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const modalImageRef = useRef(null);
  const modalContainerRef = useRef(null);

  const { i18n } = useTranslation();

  const [contentSaved, setContentSaved] = useState(false);

  const [descriptionData, setDescriptionData] = useState({
    therapyLabel: '',
    experienceLabel: '',
    locationLabel: '',
  });
  const [detailsData, setDetailsData] = useState([
    { title: '', content: [''] },
    { title: '', content: [''] },
    { title: '', content: [''] },
    { title: '', content: [''] },
  ]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const lang = i18n.language || 'pl';
        const res = await axios.get(`http://localhost:3001/specialist/${lang}`);
        if (res.data.success) {
          setDescriptionData(res.data.data.description);
          setDetailsData(res.data.data.details);
        }
      } catch (error) {
        console.error('Ошибка при загрузке контента:', error);
      }
    };
    fetchContent();
  }, [i18n.language]);

  console.log('Отправляем на сервер:');
  console.log('description:', descriptionData);
  console.log('details:', detailsData);

  // Сохранение на сервер
  const handleSaveTextChanges = async () => {
    try {
      const lang = i18n.language || 'pl';

      const certBlock = {
        title: lang === 'pl' ? 'Certyfikaty' : 'Сертифікати',
        content: '',
      };

      const fullDetails = [...detailsData, certBlock];

      // 🔧 Формируем только нужные поля для сохранения
      const cleanedDescription = {
        therapyLabel: descriptionData.therapyLabel,
        experienceLabel: descriptionData.experienceLabel,
        locationLabel: descriptionData.locationLabel,
      };

      await axios.post(
        `http://localhost:3001/specialist/${lang}`,
        {
          description: cleanedDescription,
          details: fullDetails,
        },
        {
          headers: {
            Authorization: 'Bearer admin-token-123',
          },
        }
      );

      setContentSaved(true);
      setTimeout(() => setContentSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка при сохранении контента:', error);
    }
  };

  useEffect(() => {
    setLiveReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    socket.on('new_review', newReview => {
      setLiveReviews(prevReviews => [...prevReviews, newReview]);
    });

    socket.on('review_deleted', deletedReviewId => {
      setLiveReviews(prevReviews =>
        prevReviews.filter(review => review.id !== deletedReviewId)
      );
    });

    return () => {
      socket.off('new_review');
      socket.off('review_deleted');
    };
  }, []);

  useEffect(() => {
    const fetchCertificates = async (specialistId, setCertificates) => {
      try {
        const response = await fetch(
          `http://localhost:3001/certificates/${specialistId}`
        );
        const data = await response.json();
        console.log('Certificates:', data);
        if (data.success) {
          setCertificates(data.certificates);
        }
      } catch (error) {
        console.error('Ошибка при загрузке сертификатов:', error);
      }
    };

    fetchCertificates('natalia', setNataliaCertificates);
  }, []);

  useEffect(() => {
    const fetchAvatar = async (specialistId, setAvatar) => {
      try {
        const response = await fetch(
          `http://localhost:3001/avatar/${specialistId}`
        );
        const data = await response.json();
        if (data.success) {
          setAvatar(data.avatar);
        }
      } catch (error) {
        console.error('Ошибка при загрузке аватара:', error);
      }
    };

    fetchAvatar('natalia', setNataliaAvatar);
  }, []);

  const handleAvatarSave = (avatarPath, specialistId) => {
    if (specialistId === 'natalia') {
      setNataliaAvatar(avatarPath);
    }
  };

  const handleFileChange = async (event, specialistId) => {
    const files = Array.from(event.target.files);
    const formData = new FormData();

    formData.append('specialistId', specialistId);
    files.forEach(file => {
      formData.append('certificates', file);
    });

    try {
      const response = await fetch('http://localhost:3001/upload-certificate', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: 'Bearer admin-token-123', // ✅ только это!
        },
      });
      const data = await response.json();

      if (data.success) {
        const newCertificates = data.filePaths.map(path =>
          path.split('/').pop()
        );
        if (specialistId === 'natalia') {
          setNataliaCertificates([...nataliaCertificates, ...newCertificates]);
        }
        setChangesMade(true);
      } else {
        console.error('Ошибка при загрузке сертификатов на сервер.');
      }
    } catch (error) {
      console.error('Ошибка при загрузке сертификатов:', error);
    }
  };

  const handleDeleteCertificate = async (index, specialistId) => {
    const certificates = specialistId === 'natalia' ? nataliaCertificates : [];
    const filePath = certificates[index];

    try {
      const response = await fetch('http://localhost:3001/delete-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token-123',
        },
        body: JSON.stringify({ filePath, specialistId }),
      });

      const data = await response.json();

      if (data.success) {
        let updatedCertificates;
        if (specialistId === 'natalia') {
          updatedCertificates = nataliaCertificates.filter(
            (_, i) => i !== index
          );
          setNataliaCertificates(updatedCertificates);
        }

        if (updatedCertificates.length === 0) {
          setCurrentIndex(0);
        } else if (currentIndex >= updatedCertificates.length) {
          setCurrentIndex(updatedCertificates.length - 1);
        }

        setChangesMade(true);
      } else {
        console.error('Ошибка при удалении сертификата.');
      }
    } catch (error) {
      console.error('Ошибка при удалении сертификата:', error);
    }
  };

  const handleSaveChanges = async () => {
    setChangesMade(false);
    alert('Изменения успешно сохранены');
  };

  useEffect(() => {
    const handleEsc = event => {
      if (event.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [modalOpen]);

  useEffect(() => {
    if (modalOpen) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [modalOpen]);

  // Блокировка скролла страницы при открытой модалке
  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // Зум колесом мыши
  useEffect(() => {
    const container = document.querySelector('.modal-image-container');
    if (!container) return;

    const handleWheel = e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 5));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => container.removeEventListener('wheel', handleWheel);
  }, [modalOpen]);

  // Обработчики перетаскивания

  useEffect(() => {
    const handleMouseMove = e => {
      if (!dragging) return;

      // Задаём пределы сдвига, подбери значения под себя
      const maxOffsetX = 500;
      const maxOffsetY = 500;

      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;

      setPosition({
        x: clamp(newX, -maxOffsetX, maxOffsetX),
        y: clamp(newY, -maxOffsetY, maxOffsetY),
      });
    };

    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, startPos]);

  const handleMouseDown = e => {
    if (e.button !== 0) return; // только левая кнопка
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Ограничение позиции (например, чтоб нельзя было сильно сдвинуть картинку)
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  // Автоматический расчет начального зума при открытии модалки
  useEffect(() => {
    if (modalOpen && modalImageRef.current && modalContainerRef.current) {
      const img = modalImageRef.current;
      const container = modalContainerRef.current;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const imgNaturalWidth = img.naturalWidth;
      const imgNaturalHeight = img.naturalHeight;

      const scaleX = containerWidth / imgNaturalWidth;
      const scaleY = containerHeight / imgNaturalHeight;

      const fittedScale = Math.min(scaleX, scaleY, 2);

      setZoomLevel(fittedScale);
      setPosition({ x: 0, y: 0 });
    }
  }, [modalOpen, modalImage]);

  const specialists = [
    {
      id: 'natalia',
      name: t('specialist1.name'),
      photo: `http://localhost:3001${nataliaAvatar}`,
      description: isAdmin ? (
        <div className="editable-description">
          <label>{t('specialist1.description.therapyLabel')}</label>
          <TiptapEditor
            content={descriptionData.therapyLabel}
            onChange={val =>
              setDescriptionData({
                ...descriptionData,
                therapyLabel: val,
              })
            }
          />

          <label>{t('specialist1.description.experienceLabel')}</label>
          <TiptapEditor
            content={descriptionData.experienceLabel}
            onChange={val =>
              setDescriptionData({
                ...descriptionData,
                experienceLabel: val,
              })
            }
          />

          <label>{t('specialist1.description.locationLabel')}</label>
          <TiptapEditor
            content={descriptionData.locationLabel}
            onChange={val =>
              setDescriptionData({
                ...descriptionData,
                locationLabel: val,
              })
            }
          />
        </div>
      ) : (
        <>
          <div
            dangerouslySetInnerHTML={{
              __html: descriptionData.therapyLabel.replace(/<\/?p>/g, ''),
            }}
          />
          <div
            dangerouslySetInnerHTML={{
              __html: descriptionData.experienceLabel.replace(/<\/?p>/g, ''),
            }}
          />
          <div
            dangerouslySetInnerHTML={{
              __html: descriptionData.locationLabel.replace(/<\/?p>/g, ''),
            }}
          />
        </>
      ),

      details: [
        ...detailsData.map((detail, index) => ({
          title: isAdmin ? (
            <input
              type="text"
              value={detail.title}
              onChange={e => {
                const updated = [...detailsData];
                updated[index].title = e.target.value;
                setDetailsData(updated);
              }}
            />
          ) : (
            detail.title
          ),
          content: isAdmin ? (
            Array.isArray(detail.content) ? (
              <div>
                {detail.content.map((para, i) => (
                  <TiptapEditor
                    key={i}
                    content={para}
                    onChange={val => {
                      const updated = [...detailsData];
                      updated[index].content[i] = val;
                      setDetailsData(updated);
                    }}
                  />
                ))}
              </div>
            ) : (
              <TiptapEditor
                content={detail.content}
                onChange={val => {
                  const updated = [...detailsData];
                  updated[index].content = [val];
                  setDetailsData(updated);
                }}
              />
            )
          ) : (
            detail.content
          ),
        })),

        // Оставляем сертификаты без изменений
        {
          title: t('specialist1.details.4.title'),
          content: (
            <div>
              {isAdmin && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleFileChange(e, 'natalia')}
                  style={{ marginBottom: '10px' }}
                />
              )}

              {nataliaCertificates.length > 0 ? (
                <div className="custom-carousel">
                  <div
                    className="carousel-main"
                    onClick={() => {
                      setModalImage(
                        `/uploads/${nataliaCertificates[currentIndex]}`
                      );
                      setModalOpen(true);
                      setZoomLevel(1);
                    }}
                    title="Нажмите для увеличения"
                  >
                    <img
                      src={`/uploads/${nataliaCertificates[currentIndex]}`}
                      alt={`Certificate ${currentIndex + 1}`}
                      className="certificate-image"
                    />
                  </div>

                  <div className="carousel-thumbs">
                    {nataliaCertificates.map((src, i) => (
                      <img
                        key={i}
                        src={`/uploads/${src}`}
                        alt={`Thumbnail ${i + 1}`}
                        className={`thumb-image ${
                          currentIndex === i ? 'active' : ''
                        }`}
                        onClick={() => setCurrentIndex(i)}
                      />
                    ))}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() =>
                        handleDeleteCertificate(currentIndex, 'natalia')
                      }
                      className="delete-button"
                    >
                      Удалить выбранное изображение
                    </button>
                  )}
                </div>
              ) : (
                <p>Сертификаты отсутствуют.</p>
              )}
            </div>
          ),
        },
      ],
    },
  ];

  const settings = {
    dots: liveReviews.length > 1,
    infinite: liveReviews.length > 1,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: liveReviews.length > 0 ? <CustomArrow icon={leftArrow} /> : null,
    nextArrow:
      liveReviews.length > 0 ? <CustomArrow icon={rightArrow} /> : null,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: liveReviews.length > 1,
          dots: liveReviews.length > 1,
          arrows: liveReviews.length > 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: liveReviews.length > 1,
          dots: liveReviews.length > 1,
          arrows: false,
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
            <img
              src={specialist.photo}
              alt={specialist.name}
              className="specialist-photo"
            />
            <div className="specialist-description">
              {specialist.description}
            </div>

            {isAdmin && (
              <div className="avatar-uploader">
                <AvatarUploader
                  specialistId={specialist.id}
                  onSave={avatarPath =>
                    handleAvatarSave(avatarPath, specialist.id)
                  }
                />
              </div>
            )}
          </div>
          <Accordion items={specialist.details} />
          <div className="specialist-reviews">
            <h3>{t('reviews.title')}</h3>
            {liveReviews.filter(review => review.specialistId === specialist.id)
              .length > 0 && (
              <Slider {...settings}>
                {liveReviews
                  .filter(review => review.specialistId === specialist.id)
                  .map((review, index) => (
                    <ReviewCardTeam
                      key={`${review.id}-${index}`}
                      review={review}
                    />
                  ))}
              </Slider>
            )}
            {isAdmin && (
              <div className="save-changes-container">
                <SaveButton onClick={handleSaveTextChanges} />
                {contentSaved && (
                  <p style={{ color: 'green', marginTop: '10px' }}>
                    Зміни збережені
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      {isAdmin && changesMade && (
        <div className="save-changes-container">
          <SaveButton onClick={handleSaveChanges} />
        </div>
      )}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            ref={modalContainerRef}
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <button
              className="close-button"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>

            <div className="zoom-controls">
              <button
                onClick={() => setZoomLevel(z => Math.max(z - 0.25, 1))}
                disabled={zoomLevel <= 1}
              >
                −
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(z => Math.min(z + 0.25, 5))}>
                +
              </button>
            </div>

            <div
              className="modal-image-container"
              onMouseDown={handleMouseDown}
              style={{ overflow: 'hidden' }}
            >
              <img
                src={modalImage}
                alt="certificate"
                className="modal-image-zoomable"
                ref={modalImageRef}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                  transition: dragging ? 'none' : 'transform 0.25s ease-out',
                  cursor: dragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',
                  margin: '0 auto',
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamPage;
