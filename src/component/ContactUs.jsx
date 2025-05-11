import React, { useState } from "react";
import "./ContactUs.css";
import logo from "../assets/logo_contact.png";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    email: "",
  });

  return (
    <div className="help">
      <div className="overlay_contact"></div>
      <div className="help_text">
        <h1 className="need_help_text">Нужна помощь?</h1>
        <p className="contact_us">Свяжитесь с нами!</p>
      </div>

      <div className="logo" id="logo_contact">
        <img src={logo} alt="Логотип" />
      </div>

      <div className="сontacts">
        <h1>Наши контакты</h1>
        <div className="text_contact">
          <p>- +7 777 001 57 43</p>
          <p>- kabdrashev111@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
