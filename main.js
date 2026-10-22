const h1 = document.getElementById("h1");
const allMoney = document.getElementById("all_money");
const exp = document.getElementById("exp");
const clientForm = document.getElementById("client");
const clientName = document.getElementById("client_name");
const clientTel = document.getElementById("client_tel");
const usluga = document.getElementById("usluga");
const data = document.getElementById("data");
const poisk = document.getElementById("poisk");
const spis = document.getElementById("spis");

const saved = localStorage.getItem("clients");
const clients = saved ? JSON.parse(saved) : [];

function saveClients() {
    localStorage.setItem("clients", JSON.stringify(clients));
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

function renderClients(items) {
    spis.innerHTML = "";

    items.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("client-card");

        const info = document.createElement("div");
        info.classList.add("client-card__info");

        const name = document.createElement("span");
        name.classList.add("client-card__name");
        name.textContent = item.name;

        const phone = document.createElement("span");
        phone.classList.add("client-card__phone");
        phone.textContent = item.phone;

        const date = document.createElement("span");
        date.classList.add("client-card__date");
        date.textContent = item.date;

        info.append(name, phone, date);

        const status = document.createElement("span");
        status.classList.add("client-card__status", "status--" + item.status);

        if (item.status === "new") status.textContent = "Новый";
        else if (item.status === "inprogress") status.textContent = "В работе";
        else if (item.status === "paid") status.textContent = "Оплачен";

        status.dataset.id = item.id;

        const delBtn = document.createElement("button");
        delBtn.classList.add("danger");
        delBtn.textContent = "Удалить";
        delBtn.dataset.id = item.id;

        card.append(info, status, delBtn);
        spis.append(card);
    });
}


function addClient(event) {
    event.preventDefault();

    const name = clientName.value.trim();
    const phone = clientTel.value.trim();
    const service = usluga.value;
    const date = data.value;

    if (!name || !phone || !date) return;

    const newClient = {
        id: Date.now(),
        name: name,
        phone: phone,
        service: service,
        date: formatDate(date),
        status: "new"
    };

    clients.push(newClient);
    renderClients(clients);
    clientForm.reset();
}

spis.addEventListener("click", (event) => {
    const id = Number(event.target.dataset.id);
    if (!id) return;

    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) return;

    if (event.target.classList.contains("danger")) {
        clients.splice(index, 1);
        renderClients(clients);
        updateRevenue();
    }
    else if (event.target.classList.contains("client-card__status")) {
        const currentStatus = clients[index].status;
        if (currentStatus === "new") {
            clients[index].status = "inprogress";
        } else if (currentStatus === "inprogress") {
            clients[index].status = "paid";
        } else {
            clients[index].status = "new";
        }
        renderClients(clients);
    }
});

function updateRevenue() {
    const servicePrices = {
        "Стрижка": 1500,
        "Маникюр": 2000,
        "Массаж": 2500,
        "Консультация": 1000
    };

    const total = clients
        .filter(c => c.status === "paid")
        .reduce((sum, c) => sum + (servicePrices[c.service] || 0), 0);

    allMoney.textContent = `Выручка: ${total} ₽`;
}

poisk.addEventListener("input", () => {
    const text = poisk.value.toLowerCase().trim();

    const filtered = clients.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(text);
        const phoneMatch = c.phone.includes(text);
        return nameMatch || phoneMatch;
    });

    renderClients(filtered);
});

clientTel.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);

    let formatted = "";
    if (value.length > 0) {
        formatted = "+7";
        if (value.length > 1) formatted += " (" + value.slice(1, 4);
        if (value.length > 4) formatted += ") " + value.slice(4, 7);
        if (value.length > 7) formatted += "-" + value.slice(7, 9);
        if (value.length > 9) formatted += "-" + value.slice(9, 11);
    }

    e.target.value = formatted;
});

exp.addEventListener("click", () => {
    if (clients.length === 0) {
        alert("Список клиентов пуст!");
        return;
    }

    let csvContent = "Имя;Телефон;Услуга;Дата;Статус\n";

    clients.forEach((c) => {
        let statusText = c.status === "paid" ? "Оплачен" : c.status === "inprogress" ? "В работе" : "Новый";
        csvContent += `${c.name};${c.phone};${c.service};${c.date};${statusText}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
renderClients(clients);
updateRevenue();
clientForm.addEventListener("submit", addClient);
