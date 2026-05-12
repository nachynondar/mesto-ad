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
import { createCard, deleteCard, isCardLiked, updateLikeUI } from "./components/card.js"; 
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
  inactiveButtonClass: "popup__button_disabled", 
  inputErrorClass: "popup__input_type_error", 
  errorClass: "popup__error_visible", 
}; 
 
let currentUserId = null; 
let cardPendingDelete = null; 
 
const placesList = document.querySelector(".places__list"); 
const popups = document.querySelectorAll(".popup"); 
const headerLogo = document.querySelector(".header__logo"); 
 
const profilePopup = document.querySelector(".popup_type_edit"); 
const profileForm = profilePopup.querySelector(".popup__form"); 
const profileNameInput = profileForm.querySelector(".popup__input_type_name"); 
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description"); 
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
const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template").content; 
const infoUserPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content; 
 
const renderLoading = (isLoading, button, initialText = "Сохранить", loadingText = "Сохранение...") => { 
  button.textContent = isLoading ? loadingText : initialText; 
}; 
 
const handleLikeCard = (cardElement, card, likeButton) => { 
  const isLiked = isCardLiked(card, currentUserId); 
  const likeRequest = isLiked ? deleteLike(card._id) : putLike(card._id); 
 
  likeRequest 
    .then((updatedCard) => { 
      updateLikeUI(cardElement, updatedCard, currentUserId); 
      card.likes = updatedCard.likes; 
    }) 
    .catch((err) => console.log(err)); 
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
  infoPopupInfoList.innerHTML = ''; 
  infoPopupAuthorsList.innerHTML = ''; 
}; 
 
const appendDefinitionRow = (termText, descriptionText) => { 
  const row = infoDefinitionTemplate.querySelector(".popup__info-item").cloneNode(true); 
  row.querySelector(".popup__info-term").textContent = termText; 
  row.querySelector(".popup__info-description").textContent = descriptionText; 
  infoPopupInfoList.append(row); 
}; 
 
const appendAuthorBadge = (authorName) => { 
  const listItem = infoUserPreviewTemplate.querySelector(".popup__list-item").cloneNode(true); 
  listItem.textContent = authorName; 
  infoPopupAuthorsList.append(listItem); 
}; 
 
const fillInfoPopupWithStats = (cards) => { 
  clearInfoPopupContent(); 
 
  const totalCards = cards.length; 
  const myCardsCount = cards.filter(card => card.owner?._id === currentUserId).length; 
  const totalLikes = cards.reduce((acc, card) => acc + (card.likes?.length || 0), 0); 
 
  const sortedByDate = [...cards].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); 
  const firstCreatedAt = sortedByDate[0]?.createdAt; 
  const lastCreatedAt = sortedByDate[sortedByDate.length - 1]?.createdAt; 
 
  const uniqueAuthors = [...new Set(cards.map((card) => card.owner?.name).filter(Boolean))].sort(); 
 
  infoPopupTitle.textContent = "Статистика пользователей"; 
  appendDefinitionRow("Всего карточек", String(totalCards)); 
  appendDefinitionRow("Ваших карточек", String(myCardsCount)); 
  appendDefinitionRow("Всего лайков", String(totalLikes)); 
  appendDefinitionRow("Первая создана", firstCreatedAt ? formatDate(new Date(firstCreatedAt)) : "—"); 
  appendDefinitionRow("Последняя создана", lastCreatedAt ? formatDate(new Date(lastCreatedAt)) : "—"); 
 
  infoPopupText.textContent = "Список всех авторов:"; 
  uniqueAuthors.forEach(appendAuthorBadge); 
}; 
 
const handleProfileFormSubmit = (evt) => { 
  evt.preventDefault(); 
  renderLoading(true, profileSubmitButton); 
 
  patchUserInfo({ 
    name: profileNameInput.value, 
    about: profileDescriptionInput.value, 
  }) 
    .then((userData) => { 
      profileTitle.textContent = userData.name; 
      profileDescription.textContent = userData.about; 
      closeModalWindow(profilePopup); 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => renderLoading(false, profileSubmitButton)); 
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
      closeModalWindow(cardPopup); 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => renderLoading(false, cardSubmitButton, "Создать")); 
}; 
 
const handleAvatarFormSubmit = (evt) => { 
  evt.preventDefault(); 
  renderLoading(true, avatarSubmitButton); 
 
  patchAvatar({ avatar: avatarInput.value }) 
    .then((userData) => { 
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`; 
      avatarForm.reset(); 
      closeModalWindow(avatarPopup); 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => renderLoading(false, avatarSubmitButton)); 
}; 
 
const handleRemoveCardFormSubmit = (evt) => { 
  evt.preventDefault(); 
  if (!cardPendingDelete) return; 
  renderLoading(true, removeCardSubmitButton, "Да", "Удаление..."); 
 
  deleteCardApi(cardPendingDelete.card._id) 
    .then(() => { 
      deleteCard(cardPendingDelete.cardElement); 
      closeModalWindow(removeCardPopup); 
      cardPendingDelete = null; 
    }) 
    .catch((err) => console.log(err)) 
    .finally(() => renderLoading(false, removeCardSubmitButton, "Да")); 
}; 
 
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
 
headerLogo.addEventListener("click", () => { 
  getCardList() 
    .then((cards) => { 
      fillInfoPopupWithStats(cards); 
      openModalWindow(infoPopup); 
    }) 
    .catch((err) => console.log(err)); 
}); 
 
profileForm.addEventListener("submit", handleProfileFormSubmit); 
cardForm.addEventListener("submit", handleCardFormSubmit); 
avatarForm.addEventListener("submit", handleAvatarFormSubmit); 
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit); 
 
popups.forEach((popup) => setModalWindowEventListeners(popup)); 
enableValidation(validationSettings); 
 
Promise.all([getUserInfo(), getCardList()]) 
  .then(([userData, cards]) => { 
    currentUserId = userData._id; 
    profileTitle.textContent = userData.name; 
    profileDescription.textContent = userData.about; 
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`; 
 
    cards.forEach(card => renderCard(card)); 
  }) 
  .catch((err) => console.log(err));