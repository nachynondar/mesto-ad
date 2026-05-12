const handleDocumentKeydown = (evt) => {
  if (evt.key !== "Escape") {
    return;
  }

  const openedPopup = document.querySelector(".popup_is-opened");
  if (openedPopup) {
    closeModalWindow(openedPopup);
  }
};

export const openModalWindow = (popup) => {
  popup.classList.add("popup_is-opened");
  document.addEventListener("keydown", handleDocumentKeydown);
};

export const closeModalWindow = (popup) => {
  popup.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", handleDocumentKeydown);
};

export const setModalWindowEventListeners = (popup) => {
  const closeButton = popup.querySelector(".popup__close");

  closeButton.addEventListener("click", () => {
    closeModalWindow(popup);
  });

  popup.addEventListener("mousedown", (evt) => {
    if (evt.target === popup) {
      closeModalWindow(popup);
    }
  });
};
