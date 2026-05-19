const users =
    JSON.parse(localStorage.getItem("users")) || [];

const staff =
    JSON.parse(localStorage.getItem("flowershop_staff")) || [];

const orders =
    JSON.parse(localStorage.getItem("murmur_orders")) || {};

document.getElementById("users-count").textContent =
    users.length;

document.getElementById("staff-count").textContent =
    staff.length;

document.getElementById("orders-count").textContent =
    Object.values(orders).flat().length;

const list = document.getElementById("staff-list");

list.innerHTML = staff.map((user, i)=>`
<div class="card p-3 mb-3">

    <h5>${user.login}</h5>

    <select onchange="changeRole(${i}, this.value)"
            class="form-control mb-3">
        <option ${user.role==="admin"?"selected":""}>admin</option>
        <option ${user.role==="manager"?"selected":""}>manager</option>
        <option ${user.role==="courier"?"selected":""}>courier</option>
    </select>

    <button
        onclick="deleteUser(${i})"
        class="btn btn-danger">
        Удалить
    </button>

</div>
`).join("");

function changeRole(i,newRole){
    staff[i].role=newRole;
    localStorage.setItem(
        "flowershop_staff",
        JSON.stringify(staff)
    );
    alert("Роль изменена");
}

function deleteUser(index){

    if(!confirm("Удалить сотрудника?"))
        return;

    staff.splice(index, 1);

    localStorage.setItem(
        "flowershop_staff",
        JSON.stringify(staff)
    );

    location.reload();
}