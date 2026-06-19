let activeLoadingModal = null;

const createModal = ({
  type,
  title,
  message,
  showCancel = false,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  confirmColor = "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 focus:ring-blue-500",
  cancelColor = "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-slate-300 dark:focus:ring-slate-700",
}) => {
  return new Promise((resolve) => {
    // Crear contenedor de fondo con opacidad y desenfoque
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 opacity-0";

    // Mapeo de iconos a Bootstrap Icons estilizados
    let iconHTML = "";
    if (type === "error") {
      iconHTML = `
        <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
          <i class="bi bi-x-circle text-2xl"></i>
        </div>
      `;
    } else if (type === "success") {
      iconHTML = `
        <div class="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
          <i class="bi bi-check-circle text-2xl"></i>
        </div>
      `;
    } else if (type === "question") {
      iconHTML = `
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
          <i class="bi bi-question-circle text-2xl"></i>
        </div>
      `;
    }

    // Estructuracion de botones segun tipo de dialogo
    const buttonsHTML = showCancel
      ? `
        <button id="modal-cancel-btn" class="swal2-cancel px-5 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${cancelColor}">
          ${cancelText}
        </button>
        <button id="modal-confirm-btn" class="swal2-confirm px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${confirmColor}">
          ${confirmText}
        </button>
      `
      : `
        <button id="modal-confirm-btn" class="swal2-confirm px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 w-full ${confirmColor}">
          ${confirmText}
        </button>
      `;

    overlay.innerHTML = `
      <div class="swal2-popup bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden transform scale-95 transition-all duration-300 opacity-0 flex flex-col p-6 gap-4">
        <div class="flex items-start gap-4">
          ${iconHTML}
          <div class="flex-1 min-w-0">
            <h3 class="swal2-title text-lg font-bold text-slate-900 dark:text-white truncate">${title}</h3>
            <p class="swal2-html-container mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">${message}</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-2">
          ${buttonsHTML}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Reflow
    overlay.offsetHeight;

    // Transicion de entrada
    overlay.classList.remove("opacity-0");
    const modalBox = overlay.querySelector("div");
    modalBox.classList.remove("opacity-0", "scale-95");

    const closeModal = (result) => {
      // Transicion de salida
      overlay.classList.add("opacity-0");
      modalBox.classList.add("scale-95", "opacity-0");

      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
        resolve({ isConfirmed: result });
      }, 300);
    };

    const confirmBtn = overlay.querySelector("#modal-confirm-btn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => closeModal(true));
    }

    const cancelBtn = overlay.querySelector("#modal-cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => closeModal(false));
    }
  });
};

export const showError = (message, icon = "error") => {
  return createModal({
    type: "error",
    title: "Error",
    message: message,
    confirmText: "Aceptar",
    confirmColor: "bg-red-600 hover:bg-red-700 shadow-red-500/10 focus:ring-red-500",
  });
};

export const showSuccess = (message) => {
  return createModal({
    type: "success",
    title: "Exito",
    message: message,
    confirmText: "Aceptar",
    confirmColor: "bg-green-600 hover:bg-green-700 shadow-green-500/10 focus:ring-green-500",
  });
};

export const showLoading = (mostrar = true, message = "Cargando") => {
  if (mostrar) {
    if (activeLoadingModal) return;

    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 opacity-0";

    overlay.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full overflow-hidden transform scale-95 transition-all duration-300 flex flex-col p-6 items-center text-center gap-4">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
          <div class="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">${message}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Esto puede tomar unos momentos</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.offsetHeight; // Reflow
    overlay.classList.remove("opacity-0");
    overlay.querySelector("div").classList.remove("scale-95");

    activeLoadingModal = overlay;
  } else {
    if (activeLoadingModal) {
      const overlay = activeLoadingModal;
      activeLoadingModal = null;
      overlay.classList.add("opacity-0");
      overlay.querySelector("div").classList.add("scale-95");
      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
      }, 300);
    }
  }
};

export const showQuestion = (message, title = "¿Estas seguro?") => {
  return createModal({
    type: "question",
    title: title,
    message: message,
    showCancel: true,
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    confirmColor: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 focus:ring-blue-500",
  });
};
