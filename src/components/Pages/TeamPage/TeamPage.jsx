import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const API_BASE = 'http://localhost:3001';
const socket = io(API_BASE);

/* ------------ auth helpers ------------ */
const getToken = () => localStorage.getItem('authToken');
const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const ensureAuthOrRedirect = () => {
  const token = getToken();
  if (!token) {
    alert('Сессия истекла. Пожалуйста, войдите заново.');
    window.location.href = '/admin';
    return null;
  }
  return token;
};
const handleUnauthorized = () => {
  localStorage.removeItem('authToken');
  alert('Сессия истекла. Пожалуйста, войдите заново.');
  window.location.href = '/admin';
};
/* ------------------------------------- */

function TeamPage({ reviews, isAdmin, addReview }) {
  const { t, i18n } = useTranslation();

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

  // загрузка текстового контента
  useEffect(() => {
    (async () => {
      try {
        const lang = i18n.language || 'pl';
        const res = await axios.get(`${API_BASE}/specialist/${lang}`);
        if (res.data && res.data.success) {
          setDescriptionData(res.data.data.description);
          setDetailsData(res.data.data.details);
        }
      } catch (e) {
        console.error('Ошибка при загрузке контента:', e);
      }
    })();
  }, [i18n.language]);

  // сохранить текстовый контент
  const handleSaveTextChanges = async () => {
    if (!ensureAuthOrRedirect()) return;
    try {
      const lang = i18n.language || 'pl';

      const certBlock = {
        title: lang === 'pl' ? 'Certyfikaty' : 'Сертифікати',
        content: '',
      };

      const fullDetails = [...detailsData, certBlock];

      const cleanedDescription = {
        therapyLabel: descriptionData.therapyLabel,
        experienceLabel: descriptionData.experienceLabel,
        locationLabel: descriptionData.locationLabel,
      };

      await axios.post(
        `${API_BASE}/specialist/${lang}`,
        { description: cleanedDescription, details: fullDetails },
        { headers: { ...authHeader() } }
      );

      setContentSaved(true);
      setTimeout(() => setContentSaved(false), 3000);
    } catch (error) {
      if (error && error.response && error.response.status === 401) {
        handleUnauthorized();
        return;
      }
      console.error('Ошибка при сохранении контента:', error);
    }
  };

  // live-отзывы
  useEffect(() => setLiveReviews(reviews), [reviews]);

  useEffect(() => {
    socket.on('new_review', (newReview) => {
      setLiveReviews((prev) => [...prev, newReview]);
      if (typeof addReview === 'function') addReview(newReview);
    });

    socket.on('review_deleted', (deletedReviewId) => {
      setLiveReviews((prev) => prev.filter((r) => r.id !== deletedReviewId));
    });

    return () => {
      socket.off('new_review');
      socket.off('review_deleted');
    };
  }, [addReview]);

  // сертификаты
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/certificates/natalia`);
        const data = await res.json();
        if (data.success) {
          setNataliaCertificates(data.certificates || []);
        }
      } catch (e) {
        console.error('Ошибка при загрузке сертификатов:', e);
      }
    })();
  }, []);

  // аватар
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/avatar/natalia`);
        const data = await res.json();
        if (data.success) {
          setNataliaAvatar(`${API_BASE}${data.avatar}`);
        }
      } catch (e) {
        console.error('Ошибка при загрузке аватара:', e);
      }
    })();
  }, []);

  const handleAvatarSave = (avatarPath, specialistId) => {
    if (specialistId === 'natalia') {
      setNataliaAvatar(`${API_BASE}${avatarPath}`);
    }
  };

  const handleFileChange = async (event, specialistId) => {
    if (!ensureAuthOrRedirect()) return;

    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    formData.append('specialistId', specialistId);
    files.forEach((f) => formData.append('certificates', f));

    try {
      const res = await fetch(`${API_BASE}/upload-certificate`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData,
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (data.success) {
        const newNames = (data.filePaths || []).map((p) =>
          (p || '').split('/').pop()
        );
        if (specialistId === 'natalia') {
          setNataliaCertificates((prev) => [...prev, ...newNames]);
        }
        setChangesMade(true);
      } else {
        console.error('Ошибка при загрузке сертификатов на сервер.');
      }
    } catch (e) {
      console.error('Ошибка при загрузке сертификатов:', e);
    }
  };

  const handleDeleteCertificate = async (index, specialistId) => {
    if (!ensureAuthOrRedirect()) return;

    const list = specialistId === 'natalia' ? nataliaCertificates : [];
    const filename = list[index];
    if (!filename) return;

    try {
      const res = await fetch(`${API_BASE}/delete-certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ filePath: `/uploads/${filename}`, specialistId }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (data.success) {
        const updated = list.filter((_, i) => i !== index);
        if (specialistId === 'natalia') setNataliaCertificates(updated);

        if (updated.length === 0) setCurrentIndex(0);
        else if (currentIndex >= updated.length) setCurrentIndex(updated.length - 1);

        setChangesMade(true);
      } else {
        console.error('Ошибка при удалении сертификата.');
      }
    } catch (e) {
      console.error('Ошибка при удалении сертификата:', e);
    }
  };

  const handleSaveChanges = async () => {
    setChangesMade(false);
    alert('Изменения успешно сохранены');
  };

  // Esc для модалки
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && setModalOpen(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [modalOpen]);

  // сброс при открытии
  useEffect(() => {
    if (modalOpen) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [modalOpen]);

  // блокировка скролла под модалкой
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // zoom колесом
  useEffect(() => {
    const container = document.querySelector('.modal-image-container');
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.min(Math.max(prev + delta, 1), 5));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [modalOpen]);

  // drag для изображения
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const maxOffsetX = 500;
      const maxOffsetY = 500;
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setPosition({
        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
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

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // helpers для URL
  const nataliaPhoto = useMemo(
    () => nataliaAvatar || `${API_BASE}/uploads/default-avatar.jpg`,
    [nataliaAvatar]
  );
  const certUrlByIndex = (i) => `${API_BASE}/uploads/${nataliaCertificates[i]}`;

  // специалист
  const specialists = [
    {
      id: 'natalia',
      name: t('specialist1.name'),
      photo: nataliaPhoto,
      description: isAdmin ? (
        <div className="editable-description">
          <label>{t('specialist1.description.therapyLabel')}</label>
          <TiptapEditor
            content={descriptionData.therapyLabel}
            onChange={(val) =>
              setDescriptionData((p) => ({ ...p, therapyLabel: val }))
            }
          />

          <label>{t('specialist1.description.experienceLabel')}</label>
          <TiptapEditor
            content={descriptionData.experienceLabel}
            onChange={(val) =>
              setDescriptionData((p) => ({ ...p, experienceLabel: val }))
            }
          />

          <label>{t('specialist1.description.locationLabel')}</label>
          <TiptapEditor
            content={descriptionData.locationLabel}
            onChange={(val) =>
              setDescriptionData((p) => ({ ...p, locationLabel: val }))
            }
          />
        </div>
      ) : (
        <>
          <div
            dangerouslySetInnerHTML={{
              __html: (descriptionData.therapyLabel || '').replace(/<\/?p>/g, ''),
            }}
          />
          <div
            dangerouslySetInnerHTML={{
              __html: (descriptionData.experienceLabel || '').replace(/<\/?p>/g, ''),
            }}
          />
          <div
            dangerouslySetInnerHTML={{
              __html: (descriptionData.locationLabel || '').replace(/<\/?p>/g, ''),
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
              onChange={(e) => {
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
                    onChange={(val) => {
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
                onChange={(val) => {
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

              {nataliaCertificates.length > 0 ? (
                <div className="custom-carousel">
                  <div
                    className="carousel-main"
                    onClick={() => {
                      setModalImage(certUrlByIndex(currentIndex));
                      setModalOpen(true);
                      setZoomLevel(1);
                    }}
                    title="Нажмите для увеличения"
                  >
                    <img
                      src={certUrlByIndex(currentIndex)}
                      alt={`Certificate ${currentIndex + 1}`}
                      className="certificate-image"
                    />
                  </div>

                  <div className="carousel-thumbs">
                    {nataliaCertificates.map((name, i) => (
                      <img
                        key={name + i}
                        src={`${API_BASE}/uploads/${name}`}
                        alt={`Thumbnail ${i + 1}`}
                        className={`thumb-image ${currentIndex === i ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(i)}
                      />
                    ))}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteCertificate(currentIndex, 'natalia')}
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

  // слайдер отзывов
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
    nextArrow: liveReviews.length > 0 ? <CustomArrow icon={rightArrow} /> : null,
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
            <img src={specialist.photo} alt={specialist.name} className="specialist-photo" />
            <div className="specialist-description">{specialist.description}</div>

            {isAdmin && (
              <div className="avatar-uploader">
                <AvatarUploader
                  specialistId={specialist.id}
                  onSave={(avatarPath) => handleAvatarSave(avatarPath, specialist.id)}
                />
              </div>
            )}
          </div>

          <Accordion items={specialist.details} />

          <div className="specialist-reviews">
            <h3>{t('reviews.title')}</h3>
            {liveReviews.filter((r) => r.specialistId === specialist.id).length > 0 && (
              <Slider {...settings}>
                {liveReviews
                  .filter((r) => r.specialistId === specialist.id)
                  .map((review, idx) => (
                    <ReviewCardTeam key={`${review.id}-${idx}`} review={review} />
                  ))}
              </Slider>
            )}
            {isAdmin && (
              <div className="save-changes-container">
                <SaveButton onClick={handleSaveTextChanges} />
                {contentSaved && <p style={{ color: 'green', marginTop: '10px' }}>Зміни збережені</p>}
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
            onClick={(e) => e.stopPropagation()}
            ref={modalContainerRef}
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <button className="close-button" onClick={() => setModalOpen(false)}>
              ×
            </button>

            <div className="zoom-controls">
              <button onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))} disabled={zoomLevel <= 1}>
                −
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 5))}>+</button>
            </div>

            <div className="modal-image-container" onMouseDown={handleMouseDown} style={{ overflow: 'hidden' }}>
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
