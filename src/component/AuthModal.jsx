import React, { useState } from "react";
import "./AuthModal.css";
import CodeVerification from "./CodeVerification";

const AuthModal = ({ onClose }) => {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    code: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const isPhone = formData.phone !== "";
  const isEmail = formData.email !== "";

  const validate = () => {
    let newErrors = {};

    if (mode === "login" || mode === "register") {
      if (!isPhone && !isEmail) {
        newErrors.contact = "Введите номер или почту";
      }

      if (isPhone && !/^(?:\+7|8)[0-9]{9}$/.test(formData.phone)) {
        newErrors.phone =
          "Неверный формат номера KZ (+7XXXXXXXXX или 8XXXXXXXXX)";
      }

      if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Введите корректную почту";
      }

      if (!/^[a-zA-Z0-9]+$/.test(formData.password)) {
        newErrors.password = "Пароль должен содержать только буквы и цифры";
      }
    }

    if (mode === "code") {
      if (!/^\d{6}$/.test(formData.code)) {
        newErrors.code = "Введите 6-значный код";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("handleSubmit сработал");
    if (!validate()) return;

    if (mode === "register") {
      console.log("Регистрируемся");
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: isPhone ? formData.phone : formData.email,
          password: formData.password,
        }),
      });
      if (formData.password !== confirmPassword) {
        newErrors.passwordConfirmation = "Пароли не совпадают";
      }
      const data = await response.json();
      console.log("Полученные данные", data);
      if (data.success) {
        setMode("code");
      } else {
        setErrors({ contact: data.message || "Ошибка при отправке кода" });
      }
    } else if (mode === "login") {
      const newErrors = {};
      if (!formData.email && !formData.phone) {
        errors.contact = "Введите email или номер";
      }
      if (!formData.password) {
        errors.password = "Введите пароль";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: isPhone ? formData.phone : formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();

      if (data.success) {
        alert("Вход выполнен успешно");
        onClose();
      } else {
        setErrors({ contact: data.message || "Неверный логин или пароль" });
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        {mode === "login" && (
          <>
            <h2>Войти в учётную запись</h2>
            <input
              type="text"
              placeholder="Номер телефона или почта"
              value={isPhone ? formData.phone : formData.email}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes("@")) {
                  setFormData({ ...formData, email: val, phone: "" });
                } else {
                  setFormData({ ...formData, phone: val, email: "" });
                }
              }}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
            {errors.email && <span className="error">{errors.email}</span>}
            {errors.contact && <span className="error">{errors.contact}</span>}

            <input
              type="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}

            <button className="button-enter" onClick={handleSubmit}>
              Войти
            </button>
            <p>
              Нет учётной записи?{" "}
              <span onClick={() => setMode("register")}>создай её</span>
            </p>
          </>
        )}

        {mode === "register" && (
          <>
            <h2>Создать учётную запись</h2>
            <input
              type="text"
              placeholder="Номер телефона или почта"
              value={isPhone ? formData.phone : formData.email}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes("@")) {
                  setFormData({ ...formData, email: val, phone: "" });
                } else {
                  setFormData({ ...formData, phone: val, email: "" });
                }
              }}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
            {errors.email && <span className="error">{errors.email}</span>}
            {errors.contact && <span className="error">{errors.contact}</span>}

            <input
              type="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}

            <input
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.passwordConfirmation ? "input-error" : ""}
            />
            {errors.passwordConfirmation && (
              <span className="error">{errors.passwordConfirmation}</span>
            )}

            {errors.passwordConfirmation && (
              <span className="error-text">{errors.passwordConfirmation}</span>
            )}

            {errors.password && (
              <span className="error">{errors.password}</span>
            )}

            <button className="button-enter" onClick={handleSubmit}>
              Зарегистрироваться
            </button>
            <p>
              Уже есть аккаунт?{" "}
              <span onClick={() => setMode("login")}>Войти</span>
            </p>
          </>
        )}

        {mode === "code" && (
          <CodeVerification
            isPhone={isPhone}
            contact={isPhone ? formData.phone : formData.email}
            code={formData.code}
            setCode={(newCode) => setFormData({ ...formData, code: newCode })}
            password={formData.password}
            onSuccess={() => {
              alert("Регистрация завершена!");
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
