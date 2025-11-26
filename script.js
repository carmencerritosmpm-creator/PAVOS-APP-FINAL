// PA’VO$ - lógica básica de navegación y registro en front

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-nav__item");
  const screens = document.querySelectorAll(".screen");
  const fabButton = document.getElementById("fabButton");
  const addFromBalance = document.getElementById("addMovementFromBalance");
  const movementTypeToggle = document.getElementById("movementTypeToggle");
  const movementForm = document.getElementById("movementForm");
  const movementList = document.getElementById("movementList");

  const balanceEl = document.getElementById("currentBalance");
  const incomeEl = document.getElementById("totalIncome");
  const expensesEl = document.getElementById("totalExpenses");
  const savingsEl = document.getElementById("totalSavings");
  const donutSavingsEl = document.getElementById("savingsDonutValue");

  let currentType = "gasto";

  function showScreen(screenId) {
    screens.forEach((screen) => {
      screen.classList.toggle("screen--active", screen.id === screenId);
    });
    tabs.forEach((tab) => {
      tab.classList.toggle(
        "tab-nav__item--active",
        tab.dataset.screen === screenId.replace("screen-", "")
      );
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const screenKey = tab.dataset.screen;
      showScreen(`screen-${screenKey}`);
    });
  });

  const goToMovements = () => showScreen("screen-movements");

  fabButton.addEventListener("click", goToMovements);
  addFromBalance.addEventListener("click", goToMovements);

  // Toggle tipo de movimiento
  movementTypeToggle.querySelectorAll(".pill-toggle__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      movementTypeToggle
        .querySelectorAll(".pill-toggle__item")
        .forEach((b) => b.classList.remove("pill-toggle__item--active"));
      btn.classList.add("pill-toggle__item--active");
      currentType = btn.dataset.type;
    });
  });

  // Helpers para parsear montos
  const parseAmount = (text) =>
    Number(String(text).replace(/[^0-9.-]+/g, "")) || 0;

  const formatCurrency = (value, sign = "") =>
    `${sign}$${value.toFixed(2)}`;

  // Valores iniciales ficticios
  let totalIncome = parseAmount(incomeEl.textContent);
  let totalExpenses = parseAmount(expensesEl.textContent);
  let totalSavings = parseAmount(savingsEl.textContent);
  let currentBalance = parseAmount(balanceEl.textContent);

  function updateUI() {
    incomeEl.textContent = formatCurrency(totalIncome, "+");
    expensesEl.textContent = formatCurrency(-totalExpenses, "-");
    savingsEl.textContent = formatCurrency(totalSavings, "+");
    balanceEl.textContent = formatCurrency(currentBalance, "");
    donutSavingsEl.textContent = `$${totalSavings.toFixed(0)}`;
  }

  // Manejo del formulario
  movementForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const amountInput = document.getElementById("amountInput");
    const categorySelect = document.getElementById("categorySelect");
    const dateInput = document.getElementById("dateInput");
    const notesInput = document.getElementById("notesInput");

    const amount = Number(amountInput.value);
    const category = categorySelect.value;
    const date = dateInput.value || "Hoy";
    const notes = notesInput.value;

    if (!amount || amount <= 0) {
      alert("Ingresá un monto válido pa’ continuar 💸");
      return;
    }

    // Actualizar totales según tipo
    let amountText = "";
    let amountClass = "";

    if (currentType === "ingreso") {
      totalIncome += amount;
      currentBalance += amount;
      amountText = formatCurrency(amount, "+");
      amountClass = "movement-item__amount--income";
    } else if (currentType === "gasto") {
      totalExpenses += amount;
      currentBalance -= amount;
      amountText = formatCurrency(amount, "-");
      amountClass = "movement-item__amount--expense";
    } else if (currentType === "ahorro") {
      totalSavings += amount;
      currentBalance -= amount;
      amountText = formatCurrency(amount, "+");
      amountClass = "movement-item__amount--income";
    }

    updateUI();

    // Crear item en movimientos recientes
    const li = document.createElement("li");
    li.className = "movement-item";

    const iconDiv = document.createElement("div");
    iconDiv.className = "movement-item__icon movement-item__icon--income";
    iconDiv.textContent = currentType === "gasto" ? "💸" : "💰";

    const infoDiv = document.createElement("div");
    infoDiv.className = "movement-item__info";

    const titleP = document.createElement("p");
    titleP.className = "movement-item__title";
    titleP.textContent = notes || category;

    const metaP = document.createElement("p");
    metaP.className = "movement-item__meta";
    metaP.textContent = `${date} · Categoría: ${category}`;

    infoDiv.appendChild(titleP);
    infoDiv.appendChild(metaP);

    const amountP = document.createElement("p");
    amountP.className = `movement-item__amount ${amountClass}`;
    amountP.textContent = amountText;

    li.appendChild(iconDiv);
    li.appendChild(infoDiv);
    li.appendChild(amountP);

    movementList.prepend(li);

    movementForm.reset();
  });

  updateUI();
});
