
document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // 1. MENÚ ADAPTABLE PARA CELULARES
  // =========================================
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú"
      );
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  // =========================================
  // 2. ANIMACIONES AL DESPLAZARSE
  // =========================================
  const revealElements = document.querySelectorAll(
    ".reveal, .feature-card, .news-card, .upcoming-card"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // =========================================
  // 3. BUSCADOR MEJORADO DE NOTICIAS
  // =========================================
  const searchInput = document.querySelector("#news-search");
  const newsCards = Array.from(
    document.querySelectorAll("#news-grid .news-card")
  );
  const newsCount = document.querySelector("#news-count");
  const newsEmpty = document.querySelector("#news-empty");

  const normalizeText = (text) => {
    return text
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const filterNews = () => {
    if (!searchInput || newsCards.length === 0) return;

    const query = normalizeText(searchInput.value);
    const words = query.split(/\s+/).filter(Boolean);
    let visibleCount = 0;

    newsCards.forEach((card) => {
      const searchableText = normalizeText(
        card.textContent + " " + (card.dataset.search || "")
      );

      const matches = words.every((word) =>
        searchableText.includes(word)
      );

      card.hidden = !matches;

      if (matches) {
        visibleCount++;
      }
    });

    if (newsCount) {
      newsCount.textContent =
        `${visibleCount} ${visibleCount === 1 ? "publicación" : "publicaciones"}`;
    }

    if (newsEmpty) {
      newsEmpty.hidden = visibleCount !== 0;
    }
  };

  if (searchInput) {
    searchInput.addEventListener("input", filterNews);

    // Atajo: Ctrl + K o / para ir al buscador
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchInput.focus();
      } else if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInput.focus();
      } else if (
        event.key === "Escape" &&
        document.activeElement === searchInput
      ) {
        searchInput.value = "";
        filterNews();
        searchInput.blur();
      }
    });

    filterNews();
  }

  // =========================================
  // 4. CALENDARIO INTERACTIVO
  // =========================================
  const calendarTitle = document.querySelector(
    "#calendar-month-label"
  );
  const calendarGrid = document.querySelector("#calendar-days");
  const previousButton = document.querySelector("#prev-month");
  const nextButton = document.querySelector("#next-month");

  if (
    calendarTitle &&
    calendarGrid &&
    previousButton &&
    nextButton
  ) {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    
    const events = {
      "2026-10-15": {
        title: "Actividad de aula",
        type: "activity"
      },
      "2026-10-21": {
        title: "Fecha importante",
        type: "special"
      },
      "2026-10-30": {
        title: "Cierre de actividades",
        type: "activity"
      }
    };

    const renderCalendar = () => {
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto",
        "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];

      calendarTitle.textContent =
        `${monthNames[currentMonth]} ${currentYear}`;

      calendarGrid.replaceChildren();

      const firstDay = new Date(
        currentYear,
        currentMonth,
        1
      ).getDay();

      const daysInMonth = new Date(
        currentYear,
        currentMonth + 1,
        0
      ).getDate();

      const offset = (firstDay + 6) % 7;

      for (let i = 0; i < offset; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day is-empty";
        emptyDay.setAttribute("aria-hidden", "true");
        calendarGrid.appendChild(emptyDay);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = [
          currentYear,
          String(currentMonth + 1).padStart(2, "0"),
          String(day).padStart(2, "0")
        ].join("-");

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.className = "calendar-day";
        dayButton.textContent = day;

        const isToday =
          day === today.getDate() &&
          currentMonth === today.getMonth() &&
          currentYear === today.getFullYear();

        if (isToday) {
          dayButton.classList.add("is-today");
        }

        const eventInfo = events[dateKey];

        if (eventInfo) {
          dayButton.classList.add("has-event");
          dayButton.title = eventInfo.title;

          if (eventInfo.type === "special") {
            dayButton.classList.add("is-special");
          }

          dayButton.setAttribute(
            "aria-label",
            `${day} de ${monthNames[currentMonth]}: ${eventInfo.title}`
          );
        } else {
          dayButton.setAttribute(
            "aria-label",
            `${day} de ${monthNames[currentMonth]}`
          );
        }

        dayButton.addEventListener("click", () => {
          if (eventInfo) {
            calendarTitle.textContent =
              `${day} de ${monthNames[currentMonth]}: ${eventInfo.title}`;
          } else {
            calendarTitle.textContent =
              `${day} de ${monthNames[currentMonth]} de ${currentYear}`;
          }
        });

        calendarGrid.appendChild(dayButton);
      }
    };

    previousButton.addEventListener("click", () => {
      currentMonth--;

      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }

      renderCalendar();
    });

    nextButton.addEventListener("click", () => {
      currentMonth++;

      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }

      renderCalendar();
    });

    renderCalendar();
  }

  // =========================================
  // 5. FORMULARIO DE PUBLICACIONES
  // =========================================
  const publishForm = document.querySelector("#publish-form");
  const detailsInput = document.querySelector("#details");
  const charCount = document.querySelector("#char-count");
  const feedback = document.querySelector("#form-feedback");

  const updateCharacterCount = () => {
    if (!detailsInput || !charCount) return;

    charCount.textContent =
      `${detailsInput.value.length}/700 caracteres`;
  };

  if (detailsInput) {
    detailsInput.addEventListener("input", updateCharacterCount);
    updateCharacterCount();
  }

  if (publishForm) {
    publishForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!publishForm.checkValidity()) {
        publishForm.reportValidity();
        return;
      }

      if (feedback) {
        feedback.textContent =
          "¡Formulario completado! Esta es una demostración: " +
          "la publicación no se ha enviado ni guardado.";
      }

      // No se borran los datos escritos para que puedan revisarse.
    });
  }

  // =========================================
  // 6. AÑO AUTOMÁTICO DEL PIE DE PÁGINA
  // =========================================
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
});

/* =========================================
   ANIMACIONES DEL INICIO
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const inicio = document.querySelector(".home-content");
  const botonParticipar = document.querySelector(".home-cta");

  // Mostrar suavemente el contenido del inicio
  if (inicio) {
    inicio.classList.add("home-ready");
  }

  // Efecto al pulsar "Participa ya"
  if (botonParticipar) {
    botonParticipar.addEventListener("click", () => {
      botonParticipar.style.transform = "scale(0.97)";
    });
  }
});
