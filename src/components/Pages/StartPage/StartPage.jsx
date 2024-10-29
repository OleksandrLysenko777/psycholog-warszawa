import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import CustomArrow from '../App/Svg/CustomArrow';
import leftArrow from '../App/Svg/leftArrow.svg';
import rightArrow from '../App/Svg/rightArrow.svg';
import './StartPage.css';
import './ReviewCard.css';

const ReviewCard = ({ review, specialist }) => {
  const { t } = useTranslation();  
  return (
    <div className="review-card">
      <div className="specialist-name">
        <p>
          <strong>{specialist.name}</strong>
        </p>
      </div>
      <div className="review-header">
        <p>
          <strong>{review.name}</strong>
        </p>
        <ReactStars
          count={5}
          value={review.rating}
          edit={false}
          size={20}
          activeColor="#ffd700"
        />
      </div>
      <p>{review.reviewText}</p>
      <div className="read-more">
        <Link to="/reviews">{t('reviews.readMore')}</Link>
      </div>
    </div>
  );
};

const StartPage = ({ reviews, specialists }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);
  
    const handleSectionClick = (id) => {
    setActiveSection(prev => (prev === id ? null : id));
  };

  const sections = [
    {
      id: 'section1',
      title: t('start.sections.section1.title'),
      content: [t('start.sections.section1.content')],
      image: process.env.PUBLIC_URL + '/images/15.jpg',
      icon: process.env.PUBLIC_URL + '/images/icon.png',
    },
    {
      id: 'section2',
      title: t('start.sections.section2.title'),
      content: [t('start.sections.section2.content')],
      image: process.env.PUBLIC_URL + '/images/12.jpg',
      icon: process.env.PUBLIC_URL + '/images/icon.png',
    },
     {
      id: 'section7',
    title: t('start.sections.section7.title'),
    content: [
      t('start.sections.section7.content1'),
      t('start.sections.section7.content2')      
    ],
    list: t('start.sections.section7.list', { returnObjects: true }),
    contentAfterList: t('start.sections.section7.content3'),
      image: process.env.PUBLIC_URL + '/images/14.jpg',
      icon: process.env.PUBLIC_URL + '/images/icon.png',
    },
   
    {
      id: 'section4',
      title: t('start.sections.section4.title'),
      content: [
        t('start.sections.section4.content1'),
        t('start.sections.section4.content2'),
      ],
      image: process.env.PUBLIC_URL + '/images/14.jpg',
      icon: process.env.PUBLIC_URL + '/images/icon.png',
    },
    
    {
      id: 'section6',
      title: t('start.sections.section6.title'),
      content: [t('start.sections.section6.content')],
      image: process.env.PUBLIC_URL + '/images/12.jpg',
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
      icon: process.env.PUBLIC_URL + '/images/icon.png',
    },
     {
      id: 'section3',
      title: t('start.sections.section3.title'),
      content: [t('start.sections.section3.content')],
      image: process.env.PUBLIC_URL + '/images/13.jpg',
      icon: process.env.PUBLIC_URL + '/images/icon.png',
    }
   
  ];

  const sliderSettings = {
    dots: true,
    infinite: reviews.length > 1,
    speed: 500,
    slidesToShow: reviews.length < 3 ? 1 : 3,
    slidesToScroll: 1,
    centerMode: reviews.length > 2,
    centerPadding: '1',
    autoplay: true, // Добавлено для автоматического переключения
    autoplaySpeed: 3000, // Интервал переключения в миллисекундах (2000 = 2 секунды)
    prevArrow: reviews.length > 0 ? <CustomArrow icon={leftArrow} /> : null,
    nextArrow: reviews.length > 0 ? <CustomArrow icon={rightArrow} /> : null,
    arrows: reviews.length > 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="start-page">
      <div className="intro-section">
        <div className="intro-card">
          <p>{t('start.text0')}</p>
        </div>
        <div className="intro-card">
          <p>{t('start.text1')}</p>
        </div>
      </div>
      <div className="content">
        {sections.map(section => (
          <div
            key={section.id}
            className={`section ${activeSection === section.id ? 'active' : ''}`} // Добавляем класс для активной карточки
            onClick={() => handleSectionClick(section.id)} // Логика клика для открытия карточки
          >
            <div className="section-image">
              <img src={section.image} alt={section.title} />
            </div>
            <div className="section-text">
              <div className="section-header">
                <img src={section.icon} alt="icon" className="icon" />
                <h2>{section.title}</h2>
              </div>
               {activeSection === section.id && ( // Показываем контент только если карточка активна
                <div className="section-content">
                  {section.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  {section.list && (
                    <ul>
                      {section.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.contentAfterList && <p>{section.contentAfterList}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="reviews-section">
        {reviews.length > 0 && (
  <Slider {...sliderSettings}>
    {reviews.map((review, index) => {
      const specialist = specialists.find(spec => spec.id === review.specialistId);
      return (
        <ReviewCard key={index} review={review} specialist={specialist} />
      );
    })}
  </Slider>
)}
      </div>
    </div>
  );
};

export default StartPage;
