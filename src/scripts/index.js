/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { initialCards } from "./cards.js";
import { createCard, deleteCard, likeCard } from "./components/card.js";
import {
  closeModalWindow,
  openModalWindow,
  setModalWindowEventListeners,
} from "./components/modal.js";
import { clearValidation, enableValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  errorSelector: (inputElement) => `#${inputElement.id}-error`,
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesList = document.querySelector(".places__list");
const cardTemplate = document.querySelector("#card-template").content;
const popups = Array.from(document.querySelectorAll(".popup"));

const profilePopup = document.querySelector(".popup_type_edit");
const profileForm = profilePopup.querySelector(".popup__form");
const profileNameInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileEditButton = document.querySelector(".profile__edit-button");

const cardPopup = document.querySelector(".popup_type_new-card");
const cardForm = cardPopup.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardAddButton = document.querySelector(".profile__add-button");

const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");
const profileAvatar = document.querySelector(".profile__image");

const imagePopup = document.querySelector(".popup_type_image");
const popupImage = imagePopup.querySelector(".popup__image");
const popupCaption = imagePopup.querySelector(".popup__caption");

const cardHandlers = {
  onPreviewPicture: ({ name, link }) => {
    popupImage.src = link;
    popupImage.alt = name;
    popupCaption.textContent = name;
    openModalWindow(imagePopup);
  },
  onLikeIcon: likeCard,
  onDeleteCard: deleteCard,
};

const renderCard = (cardData, insertMethod = "append") => {
  const cardElement = createCard(cardData, cardHandlers, cardTemplate);
  placesList[insertMethod](cardElement);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileTitle.textContent = profileNameInput.value;
  profileDescription.textContent = profileDescriptionInput.value;
  closeModalWindow(profilePopup);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderCard(
    {
      name: cardNameInput.value,
      link: cardLinkInput.value,
    },
    "prepend"
  );
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  closeModalWindow(cardPopup);
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  profileAvatar.style.backgroundImage = `url(${avatarInput.value})`;
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  closeModalWindow(avatarPopup);
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

profileEditButton.addEventListener("click", () => {
  profileNameInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profilePopup);
});

cardAddButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardPopup);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarPopup);
});

initialCards.forEach((cardData) => {
  renderCard(cardData);
});

popups.forEach((popup) => {
  setModalWindowEventListeners(popup);
});

enableValidation(validationSettings);
