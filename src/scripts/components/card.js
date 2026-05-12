export const isCardLiked = (cardData, userId) => {
  return cardData.likes.some((like) => like._id === userId);
};

export const updateLikeUI = (cardElement, updatedCardData, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  
  likeCountElement.textContent = String(updatedCardData.likes.length);
  
  if (isCardLiked(updatedCardData, userId)) {
    likeButton.classList.add("card__like-button_is-active");
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const createCard = (cardData, userId, handlers) => {
  const cardTemplate = document.querySelector("#card-template").content;
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeButton = cardElement.querySelector(".card__like-button");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  updateLikeUI(cardElement, cardData, userId);

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => handlers.onDeleteCard(cardElement, cardData));
  }

  likeButton.addEventListener("click", () => handlers.onLikeCard(cardElement, cardData, likeButton));
  cardImage.addEventListener("click", () => handlers.onPreviewPicture(cardData));

  return cardElement;
};