document.addEventListener("DOMContentLoaded", function () {
  const errorMsg = document.getElementById("error-msg");
  const checkbox = document.getElementById("toggle-form");

  const loginForm = document.getElementById("login-form");
  const emailLoginInput = document.getElementById("login-email");
  const passwordLoginInput = document.getElementById("login-password");

  const regForm = document.getElementById("register-form");
  const nameInput = document.getElementById("name");
  const surnameInput = document.getElementById("surname");
  const phoneInput = document.getElementById("phone");
  const emailRegInput = document.getElementById("reg-email");
  const passwordRegInput = document.getElementById("reg-password");

  const btnReg = document.getElementById("btn-reg");
  const btnLogin = document.getElementById("btn-login");

  const spinner = document.getElementById("spinner-wrapper");

  const savedEmail = getCookie("saved_email");
  const savedPassword = getCookie("saved_password");

  if (savedEmail && savedPassword) {
    emailLoginInput.value = savedEmail;
    passwordLoginInput.value = savedPassword;
    window.location.href = "/profile.html";
  }

  function checkEmail(input) {
    var emailText = input.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailText !== "" && !regex.test(emailText)) {
      input.style.borderColor = "red";
    } else {
      input.style.borderColor = "#1e7379";
    }
  }

  function minInputLengtn(input, minLen) {
    var text = input.value.trim();
    if (text.length < minLen) {
      input.style.borderColor = "red";
      var symbols = minLen < 5 ? " символа" : " символів"
      input.title = "Мінімальна довжина поля " + minLen + symbols;
    } else {
      input.style.borderColor = "#1e7379";
      input.title = "";
    }
  }

  emailLoginInput.addEventListener("blur", function () { checkEmail(emailLoginInput) });
  emailRegInput.addEventListener("blur", function () { checkEmail(emailRegInput) });

  nameInput.addEventListener("blur", function () { minInputLengtn(nameInput, 2) });
  surnameInput.addEventListener("blur", function () { minInputLengtn(surnameInput, 2) });
  passwordRegInput.addEventListener("blur", function () { minInputLengtn(passwordRegInput, 6) });

  phoneInput.addEventListener("blur", function () {
    var text = phoneInput.value.trim();
    if (text.length != 13) {
      phoneInput.style.borderColor = "red";
    } else {
      phoneInput.style.borderColor = "#1e7379";
    }
  });

  phoneInput.addEventListener("input", function (e) {
    let value = phoneInput.value.replace(/\D/g, "");

    phoneInput.value = "+" + value;
  });


  regForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailRegInput.value.trim();
    const password = passwordRegInput.value;
    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const phone = phoneInput.value.trim();

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email) && email != "") {
      errorMsg.textContent = "Некоректний формат email.";
    } else if (email == "" || password == "" || name == "" || surname == "") {
      if (email == "") {
        emailRegInput.style.borderColor = "red";
      }
      minInputLengtn(nameInput, 2);
      minInputLengtn(surnameInput, 2);
      minInputLengtn(passwordRegInput, 6);
      errorMsg.textContent = "Заповніть пусті поля!";
    } else if (phone.length != 13) {
      phoneInput.style.borderColor = "red";
      errorMsg.textContent = "Введіть номер телефону!";
    } else {
      errorMsg.textContent = "";
      btnReg.disabled = true;
      spinner.style.display = "flex";

      const data = {
        name: name,
        surname: surname,
        email: email,
        phone: phone,
        password: password
      };

      fetch(host + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(async res => {
        const result = await res.json();
        if (!res.ok) {
          errorMsg.textContent = result.error;
        } else {
          btnReg.value = "Зареєстровано"
          document.cookie = `saved_email=${encodeURIComponent(email)}; path=/`;
          document.cookie = `saved_password=${encodeURIComponent(password)}; path=/`;
          window.location.href = "/profile.html";
        }
      })
        .catch(err => {
          errorMsg.textContent = "Помилка: " + err.error;
        }).finally(() => {
          spinner.style.display = "none";
          btnReg.disabled = false;
        });
    }
  });


  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailLoginInput.value.trim();
    const password = passwordLoginInput.value;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email) && email != "") {
      errorMsg.textContent = "Некоректний формат email.";
    } else if (email == "" || password == "") {
      errorMsg.textContent = "Заповніть пусті поля!";
    } else {
      errorMsg.textContent = "";
      btnLogin.disabled = true;
      const data = {
        email: email,
        password: password
      };
      fetch(host + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(async res => {
        const result = await res.json();
        if (!res.ok) {
          errorMsg.textContent = result.error;
        } else {
          btnLogin.value = 'Ви увійшли'
          document.cookie = `saved_email=${encodeURIComponent(email)}; path=/`;
          document.cookie = `saved_password=${encodeURIComponent(password)}; path=/`;
          window.location.href = "/profile.html";
        }
      })
        .catch(err => {
          errorMsg.textContent = "Помилка: " + err.error;
        }).finally(() => {
          spinner.style.display = "none";
          btnLogin.disabled = false;
        });

    }
  });


  checkbox.addEventListener('change', function () {
    errorMsg.textContent = "";
  });

});
