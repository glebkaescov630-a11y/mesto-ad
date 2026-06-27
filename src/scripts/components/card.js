export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const updateLikeState = (cardElement, likes, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  likeButton.classList.toggle(
    "card__like-button_is-active",
    likes.some((user) => user._id === userId)
  );
  likeCount.textContent = likes.length;
};

export const isCardLiked = (cardElement) => {
  return cardElement
    .querySelector(".card__like-button")
    .classList.contains("card__like-button_is-active");
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  updateLikeState(cardElement, data.likes, userId);

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(cardElement, data._id));
  }

  if (data.owner._id === userId) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  } else {
    deleteButton.remove();
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  if (onInfoClick) {
    infoButton.addEventListener("click", () => onInfoClick(data._id));
  }

  return cardElement;
};
