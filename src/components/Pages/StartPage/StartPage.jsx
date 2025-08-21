import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import CustomArrow from '../App/Svg/CustomArrow';
import leftArrow from '../App/Svg/leftArrow.svg';
import rightArrow from '../App/Svg/rightArrow.svg';
import './StartPage.css';
import './ReviewCard.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

// хелпер для заголовка авторизации
const authHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ReviewCard = ({ review, specialist }) => {
  const { t } = useTranslation();
  return (
    <div className="review-card">
      <div className="specialist-name">
        <p><strong>{specialist?.name}</strong></p>
      </div>
      <div className="review-header">
        <p><strong>{review.name}</strong></p>
        <ReactStars count={5} value={review.rating} edit={false} size={20} activeColor="#ffd700" />
      </div>
      <p>{review.reviewText}</p>
      <div className="read-more">
        <Link to={`/reviews#review-${review.id}`}>{t('reviews.readMore')}</Link>
      </div>
    </div>
  );
};

const StartPage = ({ reviews, specialists, isAdmin }) => {
  const { t } = useTranslation();

  const [sectionImages, setSectionImages] = useState([]); // [{id, image:'/uploads/...'}]
  const [hoveredId, setHoveredId] = useState(null);
  const sectionsSliderRef = useRef(null);

  // загрузить список картинок секций
  useEffect(() => {
    axios
      .get(`${API_BASE}/sections`)
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.sections)) {
          setSectionImages(res.data.sections);
        }
      })
      .catch(err => console.error('Error loading sections:', err));
  }, []);

  // дефолтные секции
  const sections = useMemo(
    () => [
      {
        id: 'section1',
        title: t('start.sections.section1.title'),
        content: [t('start.sections.section1.content')],
        image: process.env.PUBLIC_URL + '/images/15.jpg',
        defaultImage: process.env.PUBLIC_URL + '/images/15.jpg',
        icon: process.env.PUBLIC_URL + '/images/icon.png',
      },
      {
        id: 'section2',
        title: t('start.sections.section2.title'),
        content: [t('start.sections.section2.content')],
        image: process.env.PUBLIC_URL + '/images/12.jpg',
        defaultImage: process.env.PUBLIC_URL + '/images/12.jpg',
        icon: process.env.PUBLIC_URL + '/images/icon.png',
      },
      {
        id: 'section7',
        title: t('start.sections.section7.title'),
        content: [t('start.sections.section7.content1'), t('start.sections.section7.content2')],
        list: t('start.sections.section7.list', { returnObjects: true }),
        contentAfterList: t('start.sections.section7.content3'),
        image: process.env.PUBLIC_URL + '/images/14.jpg',
        defaultImage: process.env.PUBLIC_URL + '/images/14.jpg',
        icon: process.env.PUBLIC_URL + '/images/icon.png',
      },
      {
        id: 'section4',
        title: t('start.sections.section4.title'),
        content: [t('start.sections.section4.content1'), t('start.sections.section4.content2')],
        image: process.env.PUBLIC_URL + '/images/14.jpg',
        defaultImage: process.env.PUBLIC_URL + '/images/14.jpg',
        icon: process.env.PUBLIC_URL + '/images/icon.png',
      },
      {
        id: 'section6',
        title: t('start.sections.section6.title'),
        content: [t('start.sections.section6.content')],
        image: process.env.PUBLIC_URL + '/images/12.jpg',
        defaultImage: process.env.PUBLIC_URL + '/images/12.jpg',
        icon: process.env.PUBLIC_URL + '/images/icon.png',
      },
      {
        id: 'section5',
        title: t('start.sections.section5.title'),
        content: [
          t('start.sections.section5.content1'),
          t('start.sections.section5.content2'),
          t('start.sections.section5.content3'),
        ],
        image: process.env.PUBLIC_URL + '/images/15.jpg',
        defaultImage: process.env.PUBLIC_URL + '/images/15.jpg',
        icon: process.env.PUBLIC_URL + '/images/icon.png',
      },
      {
        id: 'section3',
        title: t('start.sections.section3.title'),
        content: [t('start.sections.section3.content')],
        image: process.env.PUBLIC_URL + '/images/13.jpg',
        defaultImage: process.env.PUBLIC_URL + '/images/13.jpg',
        icon: process.env.PUBLIC_URL + '/images/icon.png',
      },
    ],
    [t]
  );

  // подменить изображения секций на серверные (если есть)
  const mergedSections = useMemo(() => {
    return sections.map(sec => {
      const serverItem = sectionImages.find(s => s.id === sec.id);
      if (serverItem?.image) {
        const isAbsolute = /^https?:\/\//i.test(serverItem.image);
        return { ...sec, image: isAbsolute ? serverItem.image : `${API_BASE}${serverItem.image}` };
      }
      return sec;
    });
  }, [sections, sectionImages]);

  // загрузка новой картинки секции
  const handleFileSelectAndUpload = async (file, sectionId) => {
    if (!file || !sectionId) return;

    const formData = new FormData();
    formData.append('sectionId', sectionId);
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE}/upload-section-image`, formData, {
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && res.data.imagePath) {
        const versionedPath = `${res.data.imagePath}?v=${Date.now()}`;
        setSectionImages(prev => {
          const exists = prev.some(s => s.id === sectionId);
          return exists
            ? prev.map(s => (s.id === sectionId ? { ...s, image: versionedPath } : s))
            : [...prev, { id: sectionId, image: versionedPath }];
        });
      } else if (res.status === 401) {
        alert('Нет токена. Войдите как администратор.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      if (err?.response?.status === 401) {
        alert('Нет токена. Войдите как администратор.');
      }
    }
  };

  // управление паузой/возобновлением автопрокрутки
  const pause = () => sectionsSliderRef.current?.slickPause();
  const resume = () => sectionsSliderRef.current?.slickPlay();

  // настройки карусели секций
  const sectionSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomArrow icon={leftArrow} />,
    nextArrow: <CustomArrow icon={rightArrow} />,
    autoplay: true,
    autoplaySpeed: 7000,
    pauseOnHover: false, // управляем вручную
    pauseOnFocus: false,
    swipeToSlide: true,
    waitForAnimate: true,
    touchThreshold: 12,
    slidesToShow: 3,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  // настройки карусели отзывов
  const reviewsSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: <CustomArrow icon={leftArrow} />,
    nextArrow: <CustomArrow icon={rightArrow} />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const renderImage = (section) => (
    <img
      src={section.image}
      alt={section.title}
      onError={(e) => {
        if (e.currentTarget.src !== section.defaultImage) {
          e.currentTarget.src = section.defaultImage;
        }
      }}
    />
  );

  return (
    <div className="start-page">
      <div className="intro-section">
        <div className="intro-card"><p>{t('start.text0')}</p></div>
        <div className="intro-card"><p>{t('start.text1')}</p></div>
      </div>

      <Slider ref={sectionsSliderRef} {...sectionSliderSettings}>
        {mergedSections.map(section => {
          const isHovered = hoveredId === section.id;
          return (
            <div key={section.id}>
              <div
                className={`section ${isHovered ? 'is-hovered' : ''}`}
                onMouseEnter={() => { setHoveredId(section.id); pause(); }}
                onMouseLeave={() => { setHoveredId(null); resume(); }}
                onTouchStart={() => { setHoveredId(section.id); pause(); }}
                onTouchEnd={() => { setHoveredId(null); setTimeout(resume, 700); }}
              >
                <div className="section-image section-image-editable">
                  {renderImage(section)}
                  {isAdmin && (
                    <label className="edit-overlay" onClick={e => e.stopPropagation()}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          handleFileSelectAndUpload(file, section.id);
                          e.target.value = '';
                        }}
                      />
                      <span className="edit-button">Заменить</span>
                    </label>
                  )}
                </div>

                <div className="section-text">
                  <div className="section-header">
                    <img src={section.icon} alt="icon" className="icon" />
                    <h2>{section.title}</h2>
                  </div>

                  <div className="section-content">
                    {section.content.map((p, i) => <p key={i}>{p}</p>)}
                    {section.list && <ul>{section.list.map((it, i) => <li key={i}>{it}</li>)}</ul>}
                    {section.contentAfterList && <p>{section.contentAfterList}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>

      <div className="reviews-section">
        {reviews.length > 0 && (
          < div className="sections-carousel">
          <Slider {...reviewsSliderSettings}>
            {reviews.map((review, index) => {
              const specialist = specialists.find(s => s.id === review.specialistId) || {};
              return (
                <div key={index} className="review-slide">
                  <ReviewCard review={review} specialist={specialist} />
                </div>
              );
            })}
            </Slider>
            </div>
        )}
      </div>
    </div>
  );
};

export default StartPage;
