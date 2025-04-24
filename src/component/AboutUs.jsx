import "./AboutUs.css";
import AUs1 from "../assets/AUs1.png";
import AUs2 from "../assets/AUs2.png";
import AUs3 from "../assets/AUs3.png";

const AboutUs = () => {
  return (
    <div className="about-us" id="about">
      <h2 className="about-us__title">Наши возможности:</h2>

      <div className="about-us__blocks">
        <div className="about-us__block">
          <img src={AUs1} alt="Иконка 1" className="about-us__image" />
          <p className="about-us__text">Предоставления удобной записи для клиентов.</p>
        </div>

        <div className="about-us__block">
          <img src={AUs2} alt="Иконка 2" className="about-us__image" id="center_img" />
          <p className="about-us__text">Современные средства для удаления грязи и полировки машины.</p>
        </div>

        <div className="about-us__block">
          <img src={AUs3} alt="Иконка 3" className="about-us__image" />
          <p className="about-us__text">Хорошее качество помывки машины!</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
