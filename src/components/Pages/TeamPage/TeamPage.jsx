import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import Accordion from './Accordion';
import ReviewCardTeam from './ReviewCardTeam';
import CustomArrow from '../App/Svg/CustomArrow';
import leftArrow from '../App/Svg/leftArrow.svg';
import rightArrow from '../App/Svg/rightArrow.svg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './TeamPage.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

function TeamPage({ reviews, isAdmin }) {  // Добавляем isAdmin как пропс
  const { t } = useTranslation();

  const [nataliaCertificates, setNataliaCertificates] = useState([]);
  const [sebastianCertificates, setSebastianCertificates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileChange = (event, specialistId) => {
    const files = Array.from(event.target.files);
    const newCertificates = files.map(file => URL.createObjectURL(file));

    if (specialistId === 'natalia') {
      setNataliaCertificates([...nataliaCertificates, ...newCertificates]);
    } else if (specialistId === 'sebastian') {
      setSebastianCertificates([...sebastianCertificates, ...newCertificates]);
    }
  };

  const handleDeleteCertificate = (index, specialistId) => {
    if (specialistId === 'natalia') {
      setNataliaCertificates(nataliaCertificates.filter((_, i) => i !== index));
    } else if (specialistId === 'sebastian') {
      setSebastianCertificates(sebastianCertificates.filter((_, i) => i !== index));
    }
  };

  const handleImageClick = (index) => {
    setCurrentIndex(index);
  };

  const specialists = [
    {
      id: 'natalia',
      name: t('specialist1.name'),
      photo: process.env.PUBLIC_URL + '/images/17.jpg',
      description: `
        <p><strong>${t('specialist1.description.therapy')}</strong></p>
        <p><strong>${t('specialist1.description.experience')}</strong></p>       
        <p><strong>${t('specialist1.description.location')}</strong></p>
      `,
      details: [
        { title: t('specialist1.details.0.title'), content: t('specialist1.details.0.content') },
        { title: t('specialist1.details.1.title'), content: t('specialist1.details.1.content') },
        { title: t('specialist1.details.2.title'), content: t('specialist1.details.2.content') },
        { title: t('specialist1.details.3.title'), content: t('specialist1.details.3.content') },
        { 
          title: t('specialist1.details.4.title'), 
          content: (
            <div>
              {isAdmin && (  // Показываем только администратору
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
                      src={src} 
                      alt={`Certificate ${index + 1}`} 
                      onClick={() => handleImageClick(index)} 
                      className="certificate-image"
                    />
                  </div>
                ))}
              </Carousel>
              {isAdmin && (  // Показываем только администратору
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
      photo: process.env.PUBLIC_URL + '/images/sebastian.jpg',
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
              {isAdmin && (  // Показываем только администратору
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
                      src={src} 
                      alt={`Certificate ${index + 1}`} 
                      onClick={() => handleImageClick(index)} 
                      className="certificate-image"
                    />
                  </div>
                ))}
              </Carousel>
              {isAdmin && (  // Показываем только администратору
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
    dots: true,
    infinite: reviews.length > 1,
    speed: 500,
    slidesToShow: reviews.length < 3 ? 1 : 3,
    slidesToScroll: 1,
    centerMode: reviews.length > 2,
    centerPadding: '1',
    prevArrow: reviews.length > 0 ? <CustomArrow icon={leftArrow} /> : null,
    nextArrow: reviews.length > 0 ? <CustomArrow icon={rightArrow} /> : null,
    arrows: reviews.length > 1, 
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className="team-page">
      {specialists.map((specialist, index) => (
        <div key={index} className="specialist">
          <h2 className="specialist-name">{specialist.name}</h2>
          <div className="specialist-info">
            <img src={specialist.photo} alt={specialist.name} className="specialist-photo" />
            <div className="specialist-description" dangerouslySetInnerHTML={{ __html: specialist.description }}></div>
          </div>
          <Accordion items={specialist.details} />
          <div className="specialist-reviews">
            <h3>{t('reviews.title')}</h3>
            <Slider {...settings}>
              {reviews
                .filter((review) => review.specialistId === specialist.id)
                .map((review, index) => (
                  <ReviewCardTeam key={index} review={review} />
                ))}
            </Slider>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TeamPage;
