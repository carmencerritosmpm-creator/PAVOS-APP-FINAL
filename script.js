// PA’VO$ PARTE LEI

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTOS BASE ---
  const tabs = document.querySelectorAll(".tab-nav__item");
  const screens = document.querySelectorAll(".screen");
  const fabButton = document.getElementById("fabButton");
  const addFromBalance = document.getElementById("addMovementFromBalance");
  const movementTypeToggle = document.getElementById("movementTypeToggle");
  const movementForm = document.getElementById("movementForm");
  const movementList = document.getElementById("movementList");
  const noMovementsHint = document.getElementById("noMovementsHint");

  const upcomingList = document.getElementById("upcomingList");
  const noUpcomingHint = document.getElementById("noUpcomingHint");

  const notifButton = document.getElementById("notifButton");
  const notifPanel = document.getElementById("notifPanel");
  const notifCloseButton = document.getElementById("notifCloseButton");
  const notifList = document.getElementById("notifList");

  const sideMenuOverlay = document.getElementById("sideMenuOverlay");
  const sideMenu = document.getElementById("sideMenu");
  const settingsButton = document.getElementById("settingsButton");
  const sideMenuAvatar = document.getElementById("sideMenuAvatar");
  const sideMenuNick = document.getElementById("sideMenuNick");
  const sideMenuName = document.getElementById("sideMenuName");

  const balanceEl = document.getElementById("currentBalance");
  const incomeEl = document.getElementById("totalIncome");
  const expensesEl = document.getElementById("totalExpenses");
  const savingsEl = document.getElementById("totalSavings");
  const savingsCurrentEl = document.getElementById("currentSavings");

  const donutCircle = document.getElementById("savingsDonutCircle");
  const donutSavingsEl = document.getElementById("savingsDonutValue");
  const savingsGoalMeta = document.getElementById("savingsGoalMeta");

  const goalList = document.getElementById("goalList");
  const goalField = document.getElementById("goalField");
  const goalSelect = document.getElementById("goalSelect");

  const quickAddSaving = document.getElementById("quickAddSaving");
  const quickViewSavingsHistory = document.getElementById("quickViewSavingsHistory");
  const quickAdjustGoals = document.getElementById("quickAdjustGoals");
  const createGoalButton = document.getElementById("createGoalButton");

  const tipsBubbles = document.getElementById("tipsBubbles");
  const nextTipButton = document.getElementById("nextTipButton");

  const modalOverlay = document.getElementById("modalOverlay");
  const modalContainer = document.getElementById("modalContainer");

  // --- ESTADO ---
  let movements = [];
  let goals = [];
  let nextGoalId = 1;

  // Metas completadas (solo para controlar alertas en esta sesión)
  let completedGoalIds = [];

  // Perfil básico del usuario (demo)
  let profile = {
    name: "Chero de PA’VO$",
    nickname: "@chelodepavos",
    avatarText: "PA",
  };

  let savingsGoal = 3000;
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavings = 0;
  let currentBalance = 0;

  let currentType = "gasto";

  const tips = [
    "Reservá una cantidad fija apenas recibís tu ingreso, como si fuera un recibo más.",
    "Poné un tope semanal para gustitos y respétalo. Así disfrutás sin culpas.",
    "Antes de comprar algo, esperá 24 horas. Si al día siguiente todavía lo querés, lo pensás con cabeza fría.",
    "Separá tus gastos en: básicos, obligaciones y gustitos. Verlo claro te ayuda a decidir mejor.",
    "Usá PA’VO$ todos los días 2 minutos. La constancia importa más que hacerlo perfecto.",
    "Cuando te paguen, ahorrá primero y gastá después, no al revés.",
    "Anotá esos gastos hormiga (cafecitos, snacks) una semana y vas a ver el impacto real.",
  ];
  let currentTipIndex = 0;
  let tipTimeoutId = null;

  // --- UTILS ---
  const formatCurrency = (value, sign = "") => `${sign}$${value.toFixed(2)}`;

  function parseDateStr(dateStr) {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function isFutureDate(dateStr) {
    if (!dateStr) return false;
    const d = parseDateStr(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d > today;
  }

  function toDisplayDate(dateStr) {
    if (!dateStr) return "Hoy";
    const d = parseDateStr(dateStr);
    return d.toLocaleDateString("es-SV", { day: "2-digit", month: "short" });
  }


  function applyProfileUI() {
    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
      userNameEl.textContent = profile.name + " 👋";
    }
    if (sideMenuAvatar) sideMenuAvatar.textContent = profile.avatarText;
    if (sideMenuNick) sideMenuNick.textContent = profile.nickname;
    if (sideMenuName) sideMenuName.textContent = profile.name;
  }

  function openProfileEditorFromSettings() {
    const newName =
      prompt("¿Cómo querés que te llame PA’VO$?", profile.name) || profile.name;
    const newNick =
      prompt("Elegí tu @usuario (nickname):", profile.nickname) || profile.nickname;
    const newAvatar =
      prompt("Poné iniciales o un emoji para tu avatar:", profile.avatarText) ||
      profile.avatarText;

    profile = {
      ...profile,
      name: newName,
      nickname: newNick,
      avatarText: newAvatar,
    };

    applyProfileUI();
  }

  // --- NAVEGACIÓN ---
  function showScreen(screenId) {
    screens.forEach((screen) => {
      screen.classList.toggle("screen--active", screen.id === screenId);
    });
    tabs.forEach((tab) => {
      tab.classList.toggle(
        "tab-nav__item--active",
        `screen-${tab.dataset.screen}` === screenId
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

  // --- TIPO DE MOVIMIENTO ---
  movementTypeToggle.querySelectorAll(".pill-toggle__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      movementTypeToggle
        .querySelectorAll(".pill-toggle__item")
        .forEach((b) => b.classList.remove("pill-toggle__item--active"));
      btn.classList.add("pill-toggle__item--active");
      currentType = btn.dataset.type;

      // Mostrar campo de meta solo si es ahorro
      if (currentType === "ahorro") {
        goalField.classList.add("form-field--goal-visible");
      } else {
        goalField.classList.remove("form-field--goal-visible");
      }
    });
  });

  // --- MODAL GENÉRICO ---
  function closeModal() {
    modalOverlay.classList.add("modal-overlay--hidden");
    modalContainer.innerHTML = "";
  }

  function openModal(title, innerHtmlBuilder) {
    modalOverlay.classList.remove("modal-overlay--hidden");
    modalContainer.innerHTML = `
      <div class="modal__header">
        <h2 class="modal__title">${title}</h2>
        <button class="modal__close" id="modalCloseBtn" aria-label="Cerrar">×</button>
      </div>
      <div class="modal__body" id="modalBody"></div>
    `;
    const body = document.getElementById("modalBody");
    innerHtmlBuilder(body);

    const closeBtn = document.getElementById("modalCloseBtn");
    closeBtn.addEventListener("click", closeModal);
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // --- GOALS ---
  function recalcSavingsGoalFromGoals() {
    if (goals.length === 0) {
      savingsGoal = 3000;
    } else {
      savingsGoal = goals.reduce((sum, g) => sum + g.total, 0);
    }
  }

  function renderGoals() {
    goalList.innerHTML = "";
    if (goals.length === 0) {
      goalList.innerHTML =
        '<p class="empty-hint">Todavía no tenés metas creadas. Empezá con algo pequeño, como $50 pa’ un gusto.</p>';
      return;
    }

    goals.forEach((g) => {
      const percent = g.total > 0 ? Math.round((g.current / g.total) * 100) : 0;
      const card = document.createElement("article");
      card.className = "goal-card";

      const header = document.createElement("div");
      header.className = "goal-card__header";

      const title = document.createElement("h3");
      title.textContent = g.name;

      const percentSpan = document.createElement("span");
      percentSpan.className = "goal-card__percent";
      percentSpan.textContent = `${percent}%`;

      header.appendChild(title);
      header.appendChild(percentSpan);

      const meta = document.createElement("p");
      meta.className = "goal-card__meta";
      meta.textContent = `Llevás $${g.current.toFixed(2)} de $${g.total.toFixed(2)}`;

      const progress = document.createElement("div");
      progress.className = "progress-bar";

      const fill = document.createElement("div");
      fill.className = "progress-bar__fill";
      fill.style.width = `${Math.min(100, percent)}%`;

      progress.appendChild(fill);

      const deadline = document.createElement("p");
      deadline.className = "goal-card__deadline";
      deadline.textContent = `Fecha límite: ${g.deadline || "Meta abierta"}`;

      card.appendChild(header);
      card.appendChild(meta);
      card.appendChild(progress);
      card.appendChild(deadline);

      goalList.appendChild(card);
    });
  }

  function syncGoalSelect() {
    goalSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Ahorro general";
    goalSelect.appendChild(defaultOption);

    goals.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = String(g.id);
      opt.textContent = g.name;
      goalSelect.appendChild(opt);
    });
  }

  // --- TOTALES & TRACKING ---
  function recomputeGoalsCurrentFromMovements() {
    goals.forEach((g) => (g.current = 0));
    movements.forEach((m) => {
      if (m.type === "ahorro" && m.goalId != null) {
        const goal = goals.find((g) => g.id === m.goalId);
        if (goal) {
          goal.current += m.amount;
        }
      }
    });
  }

  function updateTotals() {
    totalIncome = 0;
    totalExpenses = 0;
    totalSavings = 0;
    currentBalance = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    movements.forEach((m) => {
      const d = parseDateStr(m.date);
      d.setHours(0, 0, 0, 0);
      const future = d > today;

      if (m.type === "ingreso" && !future) {
        totalIncome += m.amount;
        currentBalance += m.amount;
      } else if (m.type === "gasto" && !future) {
        totalExpenses += m.amount;
        currentBalance -= m.amount;
      } else if (m.type === "ahorro" && !future) {
        totalSavings += m.amount;
        currentBalance -= m.amount;
      }
    });

    incomeEl.textContent = formatCurrency(totalIncome, "+");
    expensesEl.textContent = formatCurrency(-totalExpenses, "-");
    savingsEl.textContent = formatCurrency(totalSavings, "+");
    savingsCurrentEl.textContent = formatCurrency(totalSavings, "$");
    balanceEl.textContent = formatCurrency(currentBalance, "");

    donutSavingsEl.textContent = `$${totalSavings.toFixed(0)}`;
    savingsGoalMeta.textContent = `Meta total: $${savingsGoal.toFixed(0)}`;

    const percentage = savingsGoal > 0 ? Math.min(1, totalSavings / savingsGoal) : 0;
    const percentStops = percentage * 100;

    donutCircle.style.background = `conic-gradient(
      #0d2f23 0 ${percentStops}%,
      #5cc3b4 ${percentStops}% ${percentStops + 8}%,
      #f4f7eb ${percentStops + 8}% 100%
    )`;
  }

  // --- MOVIMIENTOS & PAGOS FUTUROS ---
  function renderMovements() {
    movementList.innerHTML = "";

    const recent = [...movements]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 10);

    if (recent.length === 0) {
      noMovementsHint.style.display = "block";
      return;
    }
    noMovementsHint.style.display = "none";

    recent.forEach((m) => {
      const li = document.createElement("li");
      li.className = "movement-item";

      const iconDiv = document.createElement("div");
      iconDiv.className = "movement-item__icon";

      if (m.type === "gasto") {
        iconDiv.classList.add("movement-item__icon--food");
        iconDiv.textContent = "💸";
      } else if (m.type === "ingreso") {
        iconDiv.classList.add("movement-item__icon--income");
        iconDiv.textContent = "💰";
      } else {
        iconDiv.classList.add("movement-item__icon--income");
        iconDiv.textContent = "📥";
      }

      const infoDiv = document.createElement("div");
      infoDiv.className = "movement-item__info";

      const titleP = document.createElement("p");
      titleP.className = "movement-item__title";
      titleP.textContent = m.notes || m.category;

      const metaP = document.createElement("p");
      metaP.className = "movement-item__meta";
      const dateLabel = toDisplayDate(m.date);
      const goalLabel =
        m.type === "ahorro" && m.goalId != null
          ? ` · Meta: ${goals.find((g) => g.id === m.goalId)?.name || "General"}`
          : "";
      metaP.textContent = `${dateLabel} · Categoría: ${m.category}${goalLabel}`;

      infoDiv.appendChild(titleP);
      infoDiv.appendChild(metaP);

      const amountP = document.createElement("p");
      amountP.className = "movement-item__amount";

      if (m.type === "ingreso") {
        amountP.classList.add("movement-item__amount--income");
        amountP.textContent = formatCurrency(m.amount, "+");
      } else if (m.type === "gasto") {
        amountP.classList.add("movement-item__amount--expense");
        amountP.textContent = formatCurrency(m.amount, "-");
      } else {
        amountP.classList.add("movement-item__amount--income");
        amountP.textContent = formatCurrency(m.amount, "+");
      }

      li.appendChild(iconDiv);
      li.appendChild(infoDiv);
      li.appendChild(amountP);

      movementList.appendChild(li);
    });
  }

  
  function renderNotifications() {
    if (!notifList) return;
    notifList.innerHTML = "";

    // Próximos pagos (gastos con fecha futura)
    const scheduledPayments = movements
      .filter((m) => m.type === "gasto" && isFutureDate(m.date))
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    // Metas de ahorro cumplidas
    const completed = goals.filter(
      (g) => g.total && g.total > 0 && g.current >= g.total
    );

    if (scheduledPayments.length === 0 && completed.length === 0) {
      const empty = document.createElement("p");
      empty.className = "notif-empty";
      empty.textContent =
        "No tenés notificaciones por ahora. Cuando tengas pagos próximos o cumplás una meta de ahorro, van a aparecer aquí.";
      notifList.appendChild(empty);
      return;
    }

    if (scheduledPayments.length > 0) {
      const label = document.createElement("p");
      label.className = "notif-item__section";
      label.textContent = "Próximos pagos";
      notifList.appendChild(label);

      scheduledPayments.forEach((p) => {
        const item = document.createElement("div");
        item.className = "notif-item notif-item--payment";

        const left = document.createElement("div");
        left.className = "notif-item__left";

        const title = document.createElement("p");
        title.className = "notif-item__title";
        title.textContent = p.notes || p.category || "Pago próximo";

        const meta = document.createElement("p");
        meta.className = "notif-item__meta";
        meta.textContent = `Fecha: ${toDisplayDate(p.date)}`;

        left.appendChild(title);
        left.appendChild(meta);

        const amount = document.createElement("p");
        amount.className = "notif-item__amount";
        amount.textContent = formatCurrency(p.amount, "$");

        item.appendChild(left);
        item.appendChild(amount);
        notifList.appendChild(item);
      });
    }

    if (completed.length > 0) {
      const label = document.createElement("p");
      label.className = "notif-item__section";
      label.textContent = "Metas de ahorro logradas";
      notifList.appendChild(label);

      completed.forEach((g) => {
        const item = document.createElement("div");
        item.className = "notif-item notif-item--goal";

        const left = document.createElement("div");
        left.className = "notif-item__left";

        const title = document.createElement("p");
        title.className = "notif-item__title";
        title.textContent = `🎉 ${g.name}`;

        const meta = document.createElement("p");
        meta.className = "notif-item__meta";
        meta.textContent = `${formatCurrency(g.current || 0, "$")} / ${formatCurrency(
          g.total,
          "$"
        )}`;

        left.appendChild(title);
        left.appendChild(meta);

        const check = document.createElement("p");
        check.className = "notif-item__amount";
        check.textContent = "✔︎";

        item.appendChild(left);
        item.appendChild(check);
        notifList.appendChild(item);
      });
    }

    // Tip del día (opcional)
    const tipP = document.createElement("p");
    tipP.className = "notif-item__tip";
    tipP.textContent = `Tip del día: ${tips[currentTipIndex]}`;
    notifList.appendChild(tipP);
  }


function renderUpcoming() {
    upcomingList.innerHTML = "";

    const scheduledPayments = movements.filter(
      (m) => m.type === "gasto" && isFutureDate(m.date)
    );

    if (scheduledPayments.length === 0) {
      noUpcomingHint.style.display = "block";
      return;
    }
    noUpcomingHint.style.display = "none";

    scheduledPayments
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .forEach((p, index) => {
        const card = document.createElement("article");
        card.className = "mini-card" + (index === 0 ? " mini-card--accent" : "");

        const title = document.createElement("p");
        title.className = "mini-card__title";
        title.textContent = p.notes || p.category;

        const amount = document.createElement("p");
        amount.className = "mini-card__amount";
        amount.textContent = formatCurrency(p.amount, "$");

        const meta = document.createElement("p");
        meta.className = "mini-card__meta";
        meta.textContent = `Fecha: ${toDisplayDate(p.date)}`;

        card.appendChild(title);
        card.appendChild(amount);
        card.appendChild(meta);

        upcomingList.appendChild(card);
      });
  }

  // --- TIPS EN BURBUJAS ---
  function showTip(index) {
    tipsBubbles.innerHTML = "";
    const bubble = document.createElement("div");
    bubble.className = "tip-bubble tip-bubble--active";
    bubble.textContent = tips[index];
    tipsBubbles.appendChild(bubble);
  }

  function nextTip() {
    const currentBubble = tipsBubbles.querySelector(".tip-bubble");
    if (currentBubble) {
      currentBubble.classList.remove("tip-bubble--active");
      currentBubble.classList.add("tip-bubble--out");
      setTimeout(() => {
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        showTip(currentTipIndex);
      }, 200);
    } else {
      currentTipIndex = (currentTipIndex + 1) % tips.length;
      showTip(currentTipIndex);
    }
  }

  nextTipButton.addEventListener("click", () => {
    nextTip();
    if (tipTimeoutId) clearInterval(tipTimeoutId);
    tipTimeoutId = setInterval(nextTip, 10000);
  });

  // --- MODALES ESPECÍFICOS ---
  // Crear nueva meta
  function openCreateGoalModal() {
    openModal("Crear nueva meta", (body) => {
      body.innerHTML = `
        <form class="modal__form" id="createGoalForm">
          <label class="form-field">
            <span>Nombre de la meta</span>
            <input type="text" id="goalNameInput" required placeholder="Ej: Viaje, fondo de emergencia" />
          </label>
          <label class="form-field">
            <span>Monto objetivo</span>
            <input type="number" id="goalTotalInput" min="1" step="0.01" required placeholder="Ej: 300" />
          </label>
          <label class="form-field">
            <span>Fecha límite (opcional)</span>
            <input type="date" id="goalDeadlineInput" />
          </label>
          <div class="modal__footer">
            <button type="button" class="button-secondary" id="cancelCreateGoal">Cancelar</button>
            <button type="submit" class="button-primary">Guardar meta</button>
          </div>
        </form>
      `;

      const form = document.getElementById("createGoalForm");
      const cancelBtn = document.getElementById("cancelCreateGoal");

      cancelBtn.addEventListener("click", closeModal);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("goalNameInput").value.trim();
        const total = Number(document.getElementById("goalTotalInput").value);
        const deadlineRaw = document.getElementById("goalDeadlineInput").value;
        const deadline = deadlineRaw ? toDisplayDate(deadlineRaw) : "Meta abierta";

        if (!name || !total || total <= 0) {
          alert("Revisá el nombre y el monto de la meta 😉");
          return;
        }

        goals.push({
          id: nextGoalId++,
          name,
          total,
          current: 0,
          deadline,
        });

        recalcSavingsGoalFromGoals();
        recomputeGoalsCurrentFromMovements();
        renderGoals();
        syncGoalSelect();
        updateTotals();
        closeModal();
      });
    });
  }

  // Agregar ahorro a meta (desde quick action)
  function openAddSavingToGoalModal() {
    if (goals.length === 0) {
      openModal("Agregá tu primera meta", (body) => {
        body.innerHTML = `
          <p class="modal__body-text">
            Para agregar ahorro a una meta, primero necesitás crear una. 
          </p>
          <div class="modal__footer">
            <button class="button-secondary" id="cancelNoGoal">Cerrar</button>
            <button class="button-primary" id="goCreateGoal">Crear meta</button>
          </div>
        `;
        document.getElementById("cancelNoGoal").addEventListener("click", closeModal);
        document.getElementById("goCreateGoal").addEventListener("click", () => {
          closeModal();
          openCreateGoalModal();
        });
      });
      return;
    }

    openModal("Agregar a una meta", (body) => {
      body.innerHTML = `
        <form class="modal__form" id="addSavingToGoalForm">
          <label class="form-field">
            <span>Meta</span>
            <select id="modalGoalSelect" required></select>
          </label>
          <label class="form-field">
            <span>Monto a ahorrar</span>
            <input type="number" id="modalSavingAmount" min="1" step="0.01" required placeholder="Ej: 25" />
          </label>
          <label class="form-field">
            <span>Fecha</span>
            <input type="date" id="modalSavingDate" />
          </label>
          <div class="modal__footer">
            <button type="button" class="button-secondary" id="cancelAddSaving">Cancelar</button>
            <button type="submit" class="button-primary">Guardar ahorro</button>
          </div>
        </form>
      `;

      const select = document.getElementById("modalGoalSelect");
      goals.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = String(g.id);
        opt.textContent = g.name;
        select.appendChild(opt);
      });

      document.getElementById("cancelAddSaving").addEventListener("click", closeModal);

      const form = document.getElementById("addSavingToGoalForm");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const goalId = Number(select.value);
        const amount = Number(document.getElementById("modalSavingAmount").value);
        const dateStr = document.getElementById("modalSavingDate").value;

        if (!goalId || !amount || amount <= 0) {
          alert("Revisá la meta y el monto 😉");
          return;
        }

        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return;

        // Crear movimiento de ahorro
        movements.push({
          type: "ahorro",
          amount,
          category: "Ahorro",
          date: dateStr || getTodayStr(),
          notes: `Ahorro para ${goal.name}`,
          goalId,
        });

        recomputeGoalsCurrentFromMovements();
        recalcSavingsGoalFromGoals();
        updateTotals();
        renderMovements();
        renderUpcoming();
        renderGoals();
        closeModal();
      });
    });
  }

  // Historial de ahorro
  function openSavingsHistoryModal() {
    openModal("Historial de ahorro", (body) => {
      const savingsMovements = movements.filter((m) => m.type === "ahorro");
      const uniqueGoals = [...new Set(savingsMovements.map((m) => m.goalId))].filter(
        (id) => id != null
      );

      body.innerHTML = `
        <label class="form-field">
          <span>Filtrar por meta</span>
          <select id="historyFilterSelect">
            <option value="">Todas las metas</option>
          </select>
        </label>
        <div class="history-list" id="historyList"></div>
      `;

      const filterSelect = document.getElementById("historyFilterSelect");
      const historyList = document.getElementById("historyList");

      uniqueGoals.forEach((goalId) => {
        const g = goals.find((gg) => gg.id === goalId);
        if (!g) return;
        const opt = document.createElement("option");
        opt.value = String(goalId);
        opt.textContent = g.name;
        filterSelect.appendChild(opt);
      });

      function renderHistory() {
        historyList.innerHTML = "";
        let filtered = savingsMovements;
        const selectedGoalId = filterSelect.value
          ? Number(filterSelect.value)
          : null;

        if (selectedGoalId != null) {
          filtered = savingsMovements.filter((m) => m.goalId === selectedGoalId);
        }

        if (filtered.length === 0) {
          historyList.innerHTML =
            '<p class="empty-hint">Todavía no hay movimientos de ahorro con ese filtro.</p>';
          return;
        }

        filtered
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .forEach((m) => {
            const item = document.createElement("div");
            item.className = "history-item";
            const goalName =
              m.goalId != null
                ? goals.find((g) => g.id === m.goalId)?.name || "General"
                : "General";
            item.textContent = `${toDisplayDate(m.date)} · ${goalName} · ${formatCurrency(
              m.amount,
              "+"
            )}`;
            historyList.appendChild(item);
          });
      }

      filterSelect.addEventListener("change", renderHistory);
      renderHistory();
    });
  }

  // Ajustar metas existentes
  function openAdjustGoalsModal() {
    if (goals.length === 0) {
      openModal("Sin metas para ajustar", (body) => {
        body.innerHTML = `
          <p>No tenés metas creadas aún. Creá una meta primero para poder ajustarla.</p>
          <div class="modal__footer">
            <button class="button-secondary" id="closeAdjustEmpty">Cerrar</button>
            <button class="button-primary" id="goCreateFromAdjust">Crear meta</button>
          </div>
        `;
        document.getElementById("closeAdjustEmpty").addEventListener("click", closeModal);
        document.getElementById("goCreateFromAdjust").addEventListener("click", () => {
          closeModal();
          openCreateGoalModal();
        });
      });
      return;
    }

    openModal("Ajustar metas", (body) => {
      body.innerHTML = `
        <form class="modal__form" id="adjustGoalForm">
          <label class="form-field">
            <span>Seleccioná la meta</span>
            <select id="adjustGoalSelect"></select>
          </label>
          <label class="form-field">
            <span>Nombre</span>
            <input type="text" id="adjustGoalName" required />
          </label>
          <label class="form-field">
            <span>Monto objetivo</span>
            <input type="number" id="adjustGoalTotal" min="1" step="0.01" required />
          </label>
          <label class="form-field">
            <span>Fecha límite</span>
            <input type="text" id="adjustGoalDeadline" />
          </label>
          <div class="modal__footer">
            <button type="button" class="button-secondary" id="cancelAdjustGoal">Cancelar</button>
            <button type="submit" class="button-primary">Guardar cambios</button>
          </div>
        </form>
      `;

      const select = document.getElementById("adjustGoalSelect");
      const nameInput = document.getElementById("adjustGoalName");
      const totalInput = document.getElementById("adjustGoalTotal");
      const deadlineInput = document.getElementById("adjustGoalDeadline");

      goals.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = String(g.id);
        opt.textContent = g.name;
        select.appendChild(opt);
      });

      function fillFormFromGoal() {
        const id = Number(select.value);
        const g = goals.find((gg) => gg.id === id);
        if (!g) return;
        nameInput.value = g.name;
        totalInput.value = g.total;
        deadlineInput.value = g.deadline;
      }

      select.addEventListener("change", fillFormFromGoal);
      fillFormFromGoal();

      document.getElementById("cancelAdjustGoal").addEventListener("click", closeModal);

      const form = document.getElementById("adjustGoalForm");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = Number(select.value);
        const g = goals.find((gg) => gg.id === id);
        if (!g) return;

        const newName = nameInput.value.trim();
        const newTotal = Number(totalInput.value);
        const newDeadline = deadlineInput.value.trim() || "Meta abierta";

        if (!newName || !newTotal || newTotal <= 0) {
          alert("Revisá el nombre y el monto de la meta 😉");
          return;
        }

        g.name = newName;
        g.total = newTotal;
        g.deadline = newDeadline;

        recalcSavingsGoalFromGoals();
        recomputeGoalsCurrentFromMovements();
        syncGoalSelect();
        renderGoals();
        updateTotals();
        closeModal();
      });
    });
  }

  // --- FORMULARIO PRINCIPAL DE MOVIMIENTOS ---
  function getTodayStr() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  movementForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const amountInput = document.getElementById("amountInput");
    const categorySelect = document.getElementById("categorySelect");
    const dateInput = document.getElementById("dateInput");
    const notesInput = document.getElementById("notesInput");

    const amount = Number(amountInput.value);
    const category = categorySelect.value;
    const dateStr = dateInput.value || getTodayStr();
    const notes = notesInput.value;

    if (!amount || amount <= 0) {
      alert("Ingresá un monto válido pa’ continuar 💸");
      return;
    }

    let goalId = null;
    if (currentType === "ahorro" && goals.length > 0) {
      const selectedGoal = goalSelect.value ? Number(goalSelect.value) : null;
      goalId = selectedGoal;
    }

    const movement = {
      type: currentType,
      amount,
      category,
      date: dateStr,
      notes,
      goalId,
    };

    movements.push(movement);

    if (movement.type === "ahorro" && goalId != null) {
      const goal = goals.find((g) => g.id === goalId);
      if (goal) goal.current += amount;
    }

    recomputeGoalsCurrentFromMovements();
    recalcSavingsGoalFromGoals();

    // Detectar metas recién completadas
    const newlyCompleted = goals.filter(
      (g) => g.total && g.total > 0 && g.current >= g.total && !completedGoalIds.includes(g.id)
    );
    if (newlyCompleted.length > 0) {
      newlyCompleted.forEach((g) => completedGoalIds.push(g.id));
      const names = newlyCompleted.map((g) => `• ${g.name}`).join("\n");
      alert(`🎉 ¡Meta de ahorro lograda!\n\n${names}`);
    }

    updateTotals();
    renderMovements();
    renderUpcoming();
    renderGoals();

    movementForm.reset();
  });

  // --- QUICK ACTIONS ---
  createGoalButton.addEventListener("click", openCreateGoalModal);
  quickAddSaving.addEventListener("click", openAddSavingToGoalModal);
  quickViewSavingsHistory.addEventListener("click", openSavingsHistoryModal);
  quickAdjustGoals.addEventListener("click", openAdjustGoalsModal);

  // --- SEED DE DATOS DEMO ---
  function seedDemoData() {
    const todayStr = getTodayStr();

    const future = new Date();
    future.setDate(future.getDate() + 3);
    const fYear = future.getFullYear();
    const fMonth = String(future.getMonth() + 1).padStart(2, "0");
    const fDay = String(future.getDate()).padStart(2, "0");
    const futureStr = `${fYear}-${fMonth}-${fDay}`;

    goals = [
      {
        id: nextGoalId++,
        name: "Viaje a la playa",
        current: 200,
        total: 500,
        deadline: "31 ago",
      },
      {
        id: nextGoalId++,
        name: "Fondo de emergencia",
        current: 150,
        total: 1000,
        deadline: "Meta abierta",
      },
    ];

    movements = [
      {
        type: "ingreso",
        amount: 1200,
        category: "Salario",
        date: todayStr,
        notes: "Pago quincena",
        goalId: null,
      },
      {
        type: "gasto",
        amount: 15.75,
        category: "Comida",
        date: todayStr,
        notes: "Almuerzo con amigis",
        goalId: null,
      },
      {
        type: "ahorro",
        amount: 200,
        category: "Ahorro",
        date: todayStr,
        notes: "Ahorro para viaje",
        goalId: 1,
      },
      {
        type: "ahorro",
        amount: 150,
        category: "Ahorro",
        date: todayStr,
        notes: "Ahorro fondo de emergencia",
        goalId: 2,
      },
      {
        type: "gasto",
        amount: 9.99,
        category: "Streaming",
        date: futureStr,
        notes: "Netflix",
        goalId: null,
      },
    ];

    recalcSavingsGoalFromGoals();
    recomputeGoalsCurrentFromMovements();
    syncGoalSelect();
    renderGoals();
    renderMovements();
    renderUpcoming();
    updateTotals();
  }

  // --- INIT ---
  seedDemoData();
  applyProfileUI();
  showTip(currentTipIndex);
  tipTimeoutId = setInterval(nextTip, 10000);

  // Campanita de notificaciones
  if (notifButton && notifPanel && notifCloseButton) {
    notifButton.addEventListener("click", () => {
      if (notifPanel.classList.contains("notif-panel--hidden")) {
        renderNotifications();
        notifPanel.classList.remove("notif-panel--hidden");
      } else {
        notifPanel.classList.add("notif-panel--hidden");
      }
    });

    notifCloseButton.addEventListener("click", () => {
      notifPanel.classList.add("notif-panel--hidden");
    });
  }

  // Menú lateral (tuerca de ajustes)
  if (settingsButton && sideMenuOverlay) {
    settingsButton.addEventListener("click", () => {
      applyProfileUI();
      sideMenuOverlay.classList.remove("side-menu-overlay--hidden");
    });

    sideMenuOverlay.addEventListener("click", (event) => {
      if (event.target === sideMenuOverlay) {
        sideMenuOverlay.classList.add("side-menu-overlay--hidden");
      }
    });

    if (sideMenu) {
      sideMenu.addEventListener("click", (event) => {
        const target = event.target.closest(".side-menu__item");
        if (!target) return;
        const action = target.dataset.action;

        if (action === "editProfile") {
          openProfileEditorFromSettings();
        } else if (action === "help") {
          alert("PA’VO$: app conceptual para ayudarte a manejar tu pisto sin estrés.");
        } else if (action === "logout") {
          alert("En una versión real aquí cerraríamos sesión. Por ahora, solo es demo ✨");
        }

        sideMenuOverlay.classList.add("side-menu-overlay--hidden");
      });
    }
  }
});
