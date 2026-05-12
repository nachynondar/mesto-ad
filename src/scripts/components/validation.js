const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(
    settings.errorSelector(inputElement)
  );
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(
    settings.errorSelector(inputElement)
  );
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  } else {
    inputElement.setCustomValidity("");
  }

  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    return;
  }

  hideInputError(formElement, inputElement, settings);
};

const hasInvalidInput = (inputElements) => {
  return inputElements.some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (formElement, inputElements, buttonElement, settings) => {
  if (hasInvalidInput(inputElements)) {
    disableSubmitButton(buttonElement, settings);
    return;
  }

  if (
    typeof settings.isFormSubmitAllowed === "function" &&
    !settings.isFormSubmitAllowed(formElement, inputElements)
  ) {
    disableSubmitButton(buttonElement, settings);
    return;
  }

  enableSubmitButton(buttonElement, settings);
};

const setEventListeners = (formElement, settings) => {
  const inputElements = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(formElement, inputElements, buttonElement, settings);

  inputElements.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(formElement, inputElements, buttonElement, settings);
    });
  });
};

export const enableValidation = (settings) => {
  const formElements = Array.from(document.querySelectorAll(settings.formSelector));
  formElements.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};

export const clearValidation = (formElement, settings) => {
  const inputElements = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputElements.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
    inputElement.setCustomValidity("");
  });
  toggleButtonState(formElement, inputElements, buttonElement, settings);
};
