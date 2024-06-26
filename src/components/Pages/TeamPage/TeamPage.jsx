import React from 'react';
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

function TeamPage({ reviews }) {
  const { t } = useTranslation();

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
        { title: t('specialist1.details.4.title'), content: t('specialist1.details.4.content') },
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
        { title: t('specialist2.details.4.title'), content: t('specialist2.details.4.content') },
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
