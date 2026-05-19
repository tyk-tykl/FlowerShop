document.getElementById("staff-login-form")
    .addEventListener("submit", function(e){

        e.preventDefault();

        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;

        const staff =
            JSON.parse(localStorage.getItem("flowershop_staff")) || [];

        const user = staff.find(
            x => x.login === login && x.password === password
        );

        if(!user){
            alert("Неверный логин или пароль");
            return;
        }

        if(user.role === "admin")
            window.location.href="admin.html";

        if(user.role === "manager")
            window.location.href="manager.html";

        if(user.role === "courier")
            window.location.href="courier.html";
    });