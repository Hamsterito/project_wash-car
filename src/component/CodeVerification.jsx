import React, { useState } from "react";

const CodeVerification = ({
  isPhone,
  contact,
  code,
  setCode,
  password,
  onSuccess,
}) => {
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (code.trim().length !== 6) {
      setErrors({ code: "Введите 6-значный код" });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          [isPhone ? "phone" : "email"]: contact,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Код подтверждён!");

        await fetch("http://localhost:5000/api/save-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact,
            password,
            type: isPhone ? "phone" : "email",
          }),
        });

        setTimeout(() => onSuccess(), 1000);
      } else {
        setErrors({ code: data.error || "Неправильный код" });
      }
    } catch (err) {
      setErrors({ code: "Ошибка соединения с сервером" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Введите код</h2>
      <p>Код отправлен на ваш {isPhone ? "номер" : "email"}</p>
      <input
        type="text"
        placeholder="6-значный код"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={loading}
      />
      {errors.code && <span className="error">{errors.code}</span>}
      {successMessage && <span className="success">{successMessage}</span>}

      <button
        className="button-enter"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Проверка..." : "Подтвердить"}
      </button>
    </>
  );
};

export default CodeVerification;
