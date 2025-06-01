const host = "http://localhost:7000"

function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

function logout() {
    deleteCookie("saved_email");
    deleteCookie("saved_password");
    window.location.href = "/login.html";
}