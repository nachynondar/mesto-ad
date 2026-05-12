/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
  deleteCardApi,
  deleteLike,
  getCardList,
  getUserInfo,
  patchAvatar,
  patchUserInfo,
  postCard,
  putLike,
} from "./components/api.js";
import { createCard, deleteCard } from "./components/card.js";
import {
  closeModalWindow,
  openModalWindow,
  setModalWindowEventListeners,
} from "./components/modal.js";
import { clearValidation, enableValidation } from "./components/validation.js";
import { formatDate } from "./utils/formatDate.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  errorSelector: (inputElement) => `#${inputElement.id}-error`,
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
  isFormSubmitAllowed(formElement, inputElements) {
    if (formElement.getAttribute("name") !== "edit-profile") {
      return true;
    }
    const initialName = formElement.dataset.initialUserName ?? "";
    const initialAbout = formElement.dataset.initialUserAbout ?? "";
    const nameInput = inputElements.find((input) => input.name === "user-name");
    const aboutInput = inputElements.find(
      (input) => input.name === "user-description"
    );
    if (!nameInput || !aboutInput) {
      return true;
    }
    return (
      nameInput.value !== initialName || aboutInput.value !== initialAbout
    );
  },
};

let currentUserId = null;
let cardPendingDelete = null;

const placesList = document.querySelector(".places__list");
const popups = Array.from(document.querySelectorAll(".popup"));

const headerLogo = document.querySelector(".header__logo");

const profilePopup = document.querySelector(".popup_type_edit");
const profileForm = profilePopup.querySelector(".popup__form");
const profileNameInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);
const profileSubmitButton = profileForm.querySelector(".popup__button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileEditButton = document.querySelector(".profile__edit-button");

const cardPopup = document.querySelector(".popup_type_new-card");
const cardForm = cardPopup.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");
const cardAddButton = document.querySelector(".profile__add-button");

const removeCardPopup = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardPopup.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");
const profileAvatar = document.querySelector(".profile__image");

const imagePopup = document.querySelector(".popup_type_image");
const popupImage = imagePopup.querySelector(".popup__image");
const popupCaption = imagePopup.querySelector(".popup__caption");

const infoPopup = document.querySelector(".popup_type_info");
const infoPopupTitle = infoPopup.querySelector(".popup__title");
const infoPopupInfoList = infoPopup.querySelector(".popup__info");
const infoPopupText = infoPopup.querySelector(".popup__text");
const infoPopupAuthorsList = infoPopup.querySelector(".popup__list");
const infoDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template"
).content;
const infoUserPreviewTemplate = document.querySelector(
  "#popup-info-user-preview-template"
).content;

const renderLoading = (
  isLoading,
  button,
  initialText = "Сохранить",
  loadingText = "Сохранение..."
) => {
  if (isLoading) {
    button.textContent = loadingText;
    button.disabled = true;
    button.classList.add(validationSettings.inactiveButtonClass);
    return;
  }
  button.textContent = initialText;
  button.disabled = false;
  button.classList.remove(validationSettings.inactiveButtonClass);
};

const updateLikeView = (cardElement, updatedCard) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const likes = Array.isArray(updatedCard.likes) ? updatedCard.likes : [];
  likeCountElement.textContent = String(likes.length);
  const isLikedByUser = likes.some((like) => like._id === currentUserId);
  likeButton.classList.toggle("card__like-button_is-active", isLikedByUser);
};

const handleLikeCard = (cardElement, card, likeButton) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  const likeRequest = isLiked ? deleteLike(card._id) : putLike(card._id);

  likeRequest
    .then((updatedCard) => {
      updateLikeView(cardElement, updatedCard);
    })
    .catch(() => {});
};

const handleDeleteCard = (cardElement, card) => {
  cardPendingDelete = { cardElement, card };
  openModalWindow(removeCardPopup);
};

const handlePreviewPicture = ({ name, link }) => {
  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;
  openModalWindow(imagePopup);
};

const cardHandlers = {
  onDeleteCard: handleDeleteCard,
  onLikeCard: handleLikeCard,
  onPreviewPicture: handlePreviewPicture,
};

const renderCard = (card, insertMethod = "append") => {
  const cardElement = createCard(card, currentUserId, cardHandlers);
  placesList[insertMethod](cardElement);
};

const clearInfoPopupContent = () => {
  while (infoPopupInfoList.firstChild) {
    infoPopupInfoList.removeChild(infoPopupInfoList.firstChild);
  }
  while (infoPopupAuthorsList.firstChild) {
    infoPopupAuthorsList.removeChild(infoPopupAuthorsList.firstChild);
  }
};

const appendDefinitionRow = (termText, descriptionText) => {
  const row = infoDefinitionTemplate.querySelector(".popup__info-item").cloneNode(true);
  const term = row.querySelector(".popup__info-term");
  const description = row.querySelector(".popup__info-description");
  term.textContent = termText;
  description.textContent = descriptionText;
  infoPopupInfoList.append(row);
};

const appendAuthorBadge = (authorName) => {
  const listItem = infoUserPreviewTemplate
    .querySelector(".popup__list-item")
    .cloneNode(true);
  listItem.textContent = authorName;
  infoPopupAuthorsList.append(listItem);
};

const fillInfoPopupWithStats = (cards) => {
  clearInfoPopupContent();

  const totalCards = cards.length;
  const cardsWithDates = cards.filter((card) => card.createdAt);
  const sortedByDate = [...cardsWithDates].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  const firstCreatedAt = sortedByDate[0]?.createdAt;
  const lastCreatedAt = sortedByDate[sortedByDate.length - 1]?.createdAt;

  const uniqueAuthors = [
    ...new Set(
      cards.map((card) => card.owner?.name).filter((name) => Boolean(name))
    ),
  ].sort((a, b) => a.localeCompare(b, "ru"));

  infoPopupTitle.textContent = "Статистика проекта";
  appendDefinitionRow("Всего карточек", String(totalCards));
  appendDefinitionRow(
    "Дата первой публикации",
    firstCreatedAt ? formatDate(firstCreatedAt) : "—"
  );
  appendDefinitionRow(
    "Дата последней публикации",
    lastCreatedAt ? formatDate(lastCreatedAt) : "—"
  );

  infoPopupText.textContent = "Уникальные авторы";
  uniqueAuthors.forEach((authorName) => {
    appendAuthorBadge(authorName);
  });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, profileSubmitButton, "Сохранить", "Сохранение...");

  patchUserInfo({
    name: profileNameInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileForm.dataset.initialUserName = userData.name;
      profileForm.dataset.initialUserAbout = userData.about;
      closeModalWindow(profilePopup);
    })
    .catch(() => {})
    .finally(() => {
      renderLoading(false, profileSubmitButton, "Сохранить", "Сохранение...");
      clearValidation(profileForm, validationSettings);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, cardSubmitButton, "Создать", "Создание...");

  postCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      renderCard(newCard, "prepend");
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
      closeModalWindow(cardPopup);
    })
    .catch(() => {})
    .finally(() => {
      renderLoading(false, cardSubmitButton, "Создать", "Создание...");
      clearValidation(cardForm, validationSettings);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, avatarSubmitButton, "Сохранить", "Сохранение...");

  patchAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
      closeModalWindow(avatarPopup);
    })
    .catch(() => {})
    .finally(() => {
      renderLoading(false, avatarSubmitButton, "Сохранить", "Сохранение...");
      clearValidation(avatarForm, validationSettings);
    });
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  if (!cardPendingDelete) {
    return;
  }

  renderLoading(true, removeCardSubmitButton, "Да", "Удаление...");

  deleteCardApi(cardPendingDelete.card._id)
    .then(() => {
      deleteCard(cardPendingDelete.cardElement);
      closeModalWindow(removeCardPopup);
      cardPendingDelete = null;
    })
    .catch(() => {})
    .finally(() => {
      renderLoading(false, removeCardSubmitButton, "Да", "Удаление...");
    });
};

const handleProfileEditClick = () => {
  const nameFromPage = profileTitle.textContent;
  const aboutFromPage = profileDescription.textContent;
  profileForm.dataset.initialUserName = nameFromPage;
  profileForm.dataset.initialUserAbout = aboutFromPage;
  profileNameInput.value = nameFromPage;
  profileDescriptionInput.value = aboutFromPage;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profilePopup);
};

const handleCardAddClick = () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardPopup);
};

const handleAvatarOpenClick = () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarPopup);
};

const handleHeaderLogoClick = () => {
  getCardList()
    .then((cards) => {
      fillInfoPopupWithStats(cards);
      openModalWindow(infoPopup);
    })
    .catch(() => {});
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

profileEditButton.addEventListener("click", handleProfileEditClick);
cardAddButton.addEventListener("click", handleCardAddClick);
profileAvatar.addEventListener("click", handleAvatarOpenClick);
headerLogo.addEventListener("click", handleHeaderLogoClick);

popups.forEach((popup) => {
  setModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    profileForm.dataset.initialUserName = userData.name;
    profileForm.dataset.initialUserAbout = userData.about;

    cards.forEach((card) => {
      renderCard(card);
    });
  })
  .catch(() => {});
