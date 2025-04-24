import React, { useState } from "react";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    email: "",
  });


  return (
    <div class="help">
        <h1 className="need_help_text">Нужна помощь?</h1>
        <p className="contact_us">Свяжитесь<br/>
            с нами! 
            </p>
        <div class="сontacts">
            <h1>Наши контакты</h1>
            <p>+7 777 001 57 43</p>
            <p>kabdrashev111@gmail.com</p>
        </div>
    </div>
  )
};

export default ContactUs;
