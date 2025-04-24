import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./BannerSlider.css";
import carImage from "../assets/car1.jpg";
import carImage2 from "../assets/car2.jpg";
import carImage3 from "../assets/car3.jpg";

const slides = [
  {
    title: "ЧИСТАЯ МАШИНА — БЕЗ ОЧЕРЕДИ",
    description:
      "Зачем стоять в очереди на мойку?\nТеперь вы можете выбрать удобное время онлайн — просто, быстро и удобно.\nПока вы планируете день, мы уже готовим вашу машину к блеску!",
    text: "Зачем вам грязная машина?",
    image: carImage,
  },
  {
    title: "МОЙКА БЕЗ СТРЕССА",
    description:
      "Онлайн-запись избавит вас от долгого ожидания.\nПросто выберите удобное время — и готово!\nНикаких очередей, только комфорт и чистая машина.",
    text: "Записывайтесь заранее и приезжайте без суеты!",
    image: carImage2,
  },
  {
    title: "ВСЕ ПОД КОНТРОЛЕМ",
    description:
      "Управляйте бронированием прямо с телефона.\nМы ценим ваше время и делаем всё для удобства!\nЛичный кабинет всегда под рукой — всё просто и понятно.",
    text: "Удобное управление и свободные места уже ждут 🧽",
    image: carImage3,
  },
];

export default function BannerSlider() {
  const handleScroll = () => {
    const target = document.getElementById("car-wash-grid");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="banner-container" id="home">
      <Swiper
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Autoplay]}
        slidesPerView={1}
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
        <button className="booking-button" onClick={handleScroll}>
          Забронировать
        </button>
      </div>
    </div>
  );
}
