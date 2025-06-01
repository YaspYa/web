document.addEventListener("DOMContentLoaded", function () {
  fetch("../components/footer.html")
    .then(response => {
      if (!response.ok) {
        throw new Error("");
      }
      return response.text();
    })
    .then(html => {
      document.getElementById("footer-placeholder").innerHTML = html;
    })
    .catch(error => {
      console.error("Помилка при завантаженні footer.html:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("../components/nav.html")
    .then(response => {
      if (!response.ok) {
        throw new Error("");
      }
      return response.text();
    })
    .then(html => {
      document.getElementById("nav-placeholder").innerHTML = html;
      initLoginCheck();
    })
    .catch(error => {
      console.error("Помилка при завантаженні nav.html:", error);
    });
});

function initLoginCheck() {
  const savedEmail = getCookie("saved_email");
  const savedPassword = getCookie("saved_password");
  const loginButton = document.getElementById("login-button");


  if (savedEmail && savedPassword) {
    loginButton.textContent = "Профіль"
    loginButton.href = "profile.html"
    // fetch(host + "/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: savedEmail, password: savedPassword })
    // }).then(async res => {
    //   const result = await res.json();
    //   if (!res.ok) {
    //     loginButton.textContent = "Увійти"
    //     loginButton.href = "login.html"
    //   } else {
    //     loginButton.textContent = "Профіль"
    //     loginButton.href = "profile.html"
    //   }
    // })
    //   .catch(err => {
    //     console.log(err)
    //   }).finally(() => {

    //   });

  } else {
    loginButton.textContent = "Увійти"
    loginButton.href = "login.html"
  }
}
