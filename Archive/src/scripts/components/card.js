export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const cardTemplateContent = document.querySelector("#card-template").content;

export const createCard = (card, userId, handlers) => {
  const { onDeleteCard, onLikeCard, onPreviewPicture } = handlers;
  const cardElement = cardTemplateContent.querySelector(".card").cloneNode(true);
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardElement.dataset.cardId = card._id;

  cardImage.src = card.link;
  cardImage.alt = card.name;
  cardTitle.textContent = card.name;

  const likes = Array.isArray(card.likes) ? card.likes : [];
  likeCountElement.textContent = String(likes.length);

  const isLikedByUser = likes.some((like) => like._id === userId);
  if (isLikedByUser) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (card.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardElement, card);
    });
  }

  if (onLikeCard) {
    likeButton.addEventListener("click", () => {
      onLikeCard(cardElement, card, likeButton);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      onPreviewPicture({ name: card.name, link: card.link });
    });
  }

  return cardElement;
};
