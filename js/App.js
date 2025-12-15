document.addEventListener("DOMContentLoaded", () => {

    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (!email || !password) {
                alert("Please fill all fields");
                return;
            }

            console.log("Login Submitted:", { email, password });
            alert("Login submitted (connect to PHP backend next)");
        });
    }

    // Register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const phone = document.getElementById("phone").value;

            if (!name || !email || !password || !phone) {
                alert("Please fill all fields");
                return;
            }

            console.log("Register Submitted:", { name, email, password, phone });
            alert("Registration submitted (connect to PHP backend next)");
        });
    }

});
