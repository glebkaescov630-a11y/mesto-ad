import {
  addCard,
  changeLikeCardStatus,
  getCardList,
  getUserInfo,
  removeCard,
  setUserAvatar,
  setUserInfo,
} from "./components/api.js";
import {
  createCardElement,
  deleteCard,
  isCardLiked,
  updateLikeState,
} from "./components/card.js";
import {
  closeModalWindow,
  openModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  clearValidation,
  enableValidation,
} from "./components/validation.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");
const infoDefinitionTemplate = document
  .getElementById("popup-info-definition-template")
  .content.querySelector(".popup__info-item");
const userPreviewTemplate = document
  .getElementById("popup-info-user-preview-template")
  .content.querySelector(".popup__list-item");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const logo = document.querySelector(".header__logo");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

let currentUserId = "";
let cardToRemove = null;

const renderLoading = (form, isLoading, loadingText) => {
  const submitButton = form.querySelector(".popup__button");

  if (isLoading) {
    submitButton.dataset.defaultText = submitButton.textContent.trim();
    submitButton.textContent = loadingText;
    return;
  }

  submitButton.textContent = submitButton.dataset.defaultText;
};

const renderUserInfo = ({ name, about, avatar, _id }) => {
  currentUserId = _id;
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const infoItem = infoDefinitionTemplate.cloneNode(true);

  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;

  return infoItem;
};

const createUserPreview = (userName) => {
  const userPreview = userPreviewTemplate.cloneNode(true);

  userPreview.textContent = userName;

  return userPreview;
};

const getUniqueOwners = (cards) => {
  const users = new Map();

  cards.forEach((card) => {
    users.set(card.owner._id, card.owner);
  });

  return Array.from(users.values());
};

const getMaxCardsByOneUser = (cards) => {
  const cardCountByUser = {};

  cards.forEach((card) => {
    cardCountByUser[card.owner._id] = (cardCountByUser[card.owner._id] || 0) + 1;
  });

  return Math.max(0, ...Object.values(cardCountByUser));
};

const getLikesStats = (cards) => {
  const likesByUser = new Map();

  cards.forEach((card) => {
    card.likes.forEach((user) => {
      const userData = likesByUser.get(user._id) || { user, count: 0 };
      userData.count += 1;
      likesByUser.set(user._id, userData);
    });
  });

  return Array.from(likesByUser.values()).sort((firstUser, secondUser) => {
    return secondUser.count - firstUser.count;
  });
};

const getPopularCards = (cards) => {
  return [...cards]
    .sort((firstCard, secondCard) => secondCard.likes.length - firstCard.likes.length)
    .slice(0, 3);
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        return;
      }

      cardInfoModalTitle.textContent = "Информация о карточке";
      cardInfoModalText.textContent = "Поставили лайк:";
      cardInfoModalInfoList.replaceChildren(
        createInfoString("Название:", cardData.name),
        createInfoString("Автор:", cardData.owner.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Количество лайков:", cardData.likes.length)
      );
      cardInfoModalUserList.replaceChildren(
        ...cardData.likes.map((user) => createUserPreview(user.name))
      );

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const users = getUniqueOwners(cards);
      const dates = cards.map((card) => new Date(card.createdAt));
      const firstCardDate = dates.length ? new Date(Math.min(...dates)) : null;
      const lastCardDate = dates.length ? new Date(Math.max(...dates)) : null;
      const likesStats = getLikesStats(cards);
      const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);
      const likesChampion = likesStats[0];
      const popularCards = getPopularCards(cards);

      cardInfoModalTitle.textContent = "Статистика Mesto";
      cardInfoModalText.textContent = "Все пользователи и популярные карточки:";
      cardInfoModalInfoList.replaceChildren(
        createInfoString("Первая создана:", firstCardDate ? formatDate(firstCardDate) : "Нет данных"),
        createInfoString("Последняя создана:", lastCardDate ? formatDate(lastCardDate) : "Нет данных"),
        createInfoString("Всего пользователей:", users.length),
        createInfoString("Максимум карточек от одного:", getMaxCardsByOneUser(cards)),
        createInfoString("Всего лайков:", totalLikes),
        createInfoString("Максимально лайков от одного:", likesChampion ? likesChampion.count : 0),
        createInfoString("Чемпион лайков:", likesChampion ? likesChampion.user.name : "Нет данных")
      );
      cardInfoModalUserList.replaceChildren(
        ...users.map((user) => createUserPreview(`Пользователь: ${user.name}`)),
        ...popularCards.map((card) =>
          createUserPreview(`Популярная карточка: ${card.name} (${card.likes.length})`)
        )
      );

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardElement, cardId) => {
  changeLikeCardStatus(cardId, isCardLiked(cardElement))
    .then((cardData) => {
      updateLikeState(cardElement, cardData.likes, currentUserId);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  cardToRemove = { cardElement, cardId };
  openModalWindow(removeCardModalWindow);
};

const createCard = (data) => {
  return createCardElement(data, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeCard,
    onDeleteCard: handleDeleteCard,
    onInfoClick: handleInfoClick,
  });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileForm, true, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      renderUserInfo(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileForm, false);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarForm, true, "Сохранение...");

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarForm, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(cardForm, true, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(createCard(cardData));
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardForm, false);
    });
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();

  if (!cardToRemove) {
    return;
  }

  renderLoading(removeCardForm, true, "Удаление...");

  removeCard(cardToRemove.cardId)
    .then(() => {
      deleteCard(cardToRemove.cardElement);
      closeModalWindow(removeCardModalWindow);
      cardToRemove = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(removeCardForm, false);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

logo.addEventListener("click", handleLogoClick);

document.querySelectorAll(".popup").forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    renderUserInfo(userData);
    cards.forEach((cardData) => {
      placesWrap.append(createCard(cardData));
    });
  })
  .catch((err) => {
    console.log(err);
  });
