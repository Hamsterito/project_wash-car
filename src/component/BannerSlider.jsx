import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import './BannerSlider.css';
import carImage from '../assets/car1.jpg';
import carImage2 from '../assets/car2.jpg';
import carImage3 from '../assets/car3.jpg';

const slides = [
  {
    title: "ЧИСТАЯ МАШИНА — БЕЗ ОЧЕРЕДИ",
    description:
      "Зачем стоять в очереди на мойку?\nТеперь вы можете выбрать удобное время онлайн — просто, быстро и удобно.\nПока вы планируете день, мы уже готовим вашу машину к блеску!",
    text: "Зачем вам грязная машина?",
    image: carImage
  },
  {
    title: "МОЙКА БЕЗ СТРЕССА",
    description:
      "Онлайн-запись избавит вас от долгого ожидания.\nПросто выберите удобное время — и готово!",
    text: "Вы можете легко записаться на мойку!",
    image: carImage2
  },
  {
    title: "ВСЕ ПОД КОНТРОЛЕМ",
    description:
      "Управляйте бронированием прямо с телефона.\nМы ценим ваше время и делаем всё для удобства!",
    text: "Свободные места уже ждут вас 🧽",
    image: carImage3
  }
];

export default function BannerSlider() {
  return (
    <div className="banner-container">
      <Swiper
        loop={true}
        autoplay={{ delay: 3111000, disableOnInteraction: false }}
        modules={[Autoplay]}
        className="swiper-wrapper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="slide"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="overlay">
                <div className="slide-content">
                  <h1 className="slide-title">{slide.title}</h1>
                  <p className="slide-description">{slide.description}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="fixed-booking-button">
        <button className="booking-button">Забронировать</button>
      </div>
    </div>
  );
}
