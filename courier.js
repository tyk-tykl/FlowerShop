const orders =
    JSON.parse(localStorage.getItem("murmur_orders")) || {};

const allOrders =
    Object.values(orders).flat();

const container =
    document.getElementById("courier-orders");

container.innerHTML =
    allOrders
        .filter(o=>o.status==="delivering")
        .map(order=>`
<div class="card p-4 mb-3">
    <h5>${order.title}</h5>
    <p>Адрес: ${order.address}</p>
    <p>Дата: ${order.deliveryDate}</p>
    <p>Время: ${order.deliveryTime}</p>

    <button class="btn btn-primary"
            onclick="takeOrder('${order.id}')">
        Взять доставку
    </button>
</div>
`).join("");

function takeOrder(id){
    alert("Заказ " + id + " назначен вам");
}