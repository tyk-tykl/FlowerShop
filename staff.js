const STAFF_KEY = "flowershop_staff";

function getStaff(){
    return JSON.parse(localStorage.getItem(STAFF_KEY)) || [];
}

function saveStaff(data){
    localStorage.setItem(STAFF_KEY, JSON.stringify(data));
}

document.getElementById("staff-form")?.addEventListener("submit", function(e){
    e.preventDefault();

    const role = document.getElementById("role").value;
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    const staff = getStaff();

    staff.push({
        role,
        login,
        password
    });

    saveStaff(staff);

    alert("Сотрудник добавлен");

    window.location.href="staff-login.html";
});