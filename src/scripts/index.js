/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
	addCard,
	changeLikeCardStatus,
	deleteCard,
	getCardList,
	getUserInfo,
	setAvatarInfo,
	setUserInfo,
} from './api.js'
import { createCardElement } from './components/card.js'
import {
	closeModalWindow,
	openModalWindow,
	setCloseModalWindowEventListeners,
} from './components/modal.js'
import { clearValidation, enableValidation } from './components/validation.js'

// DOM узлы
const placesWrap = document.querySelector('.places__list')
const profileFormModalWindow = document.querySelector('.popup_type_edit')
const profileForm = profileFormModalWindow.querySelector('.popup__form')
const profileTitleInput = profileForm.querySelector('.popup__input_type_name')
const profileDescriptionInput = profileForm.querySelector(
	'.popup__input_type_description'
)
const header = document.querySelector('.header')

const cardFormModalWindow = document.querySelector('.popup_type_new-card')
const cardForm = cardFormModalWindow.querySelector('.popup__form')
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name')
const cardLinkInput = cardForm.querySelector('.popup__input_type_url')

const imageModalWindow = document.querySelector('.popup_type_image')
const imageElement = imageModalWindow.querySelector('.popup__image')
const imageCaption = imageModalWindow.querySelector('.popup__caption')

const openProfileFormButton = document.querySelector('.profile__edit-button')
const openCardFormButton = document.querySelector('.profile__add-button')

const profileTitle = document.querySelector('.profile__title')
const profileDescription = document.querySelector('.profile__description')
const profileAvatar = document.querySelector('.profile__image')

const avatarFormModalWindow = document.querySelector('.popup_type_edit-avatar')
const avatarForm = avatarFormModalWindow.querySelector('.popup__form')
const avatarInput = avatarForm.querySelector('.popup__input')

const deleteCardFormModalWindow = document.querySelector(
	'.popup_type_remove-card'
)
const deleteCardForm = deleteCardFormModalWindow.querySelector('.popup__form')

const deleteCardFormButton = deleteCardForm.querySelector('.button')
const profileFormButton = profileForm.querySelector('.button')
const cardFormButton = cardForm.querySelector('.button')
const avatarFormButton = avatarForm.querySelector('.button')

const statisticModalWindow = document.querySelector('.popup_type_info')

const handlePreviewPicture = ({ name, link }) => {
	imageElement.src = link
	imageElement.alt = name
	imageCaption.textContent = name
	openModalWindow(imageModalWindow)
}

const handleProfileFormSubmit = evt => {
	evt.preventDefault()
	profileFormButton.textContent = 'Сохранение...'
	setUserInfo({
		name: profileTitleInput.value,
		about: profileDescriptionInput.value,
	})
		.then(userData => {
			profileTitle.textContent = userData.name
			profileDescription.textContent = userData.about
			closeModalWindow(profileFormModalWindow)
			profileFormButton.textContent = 'Сохранить'
		})
		.catch(err => {
			console.log(err)
		})
}

const handleAvatarFromSubmit = evt => {
	evt.preventDefault()
	avatarFormButton.textContent = 'Сохранение...'
	setAvatarInfo({
		avatar: avatarInput.value,
	})
		.then(avatarData => {
			profileAvatar.style.backgroundImage = `url(${avatarData.avatar})`
			closeModalWindow(avatarFormModalWindow)
			avatarFormButton.textContent = 'Сохранить'
		})
		.catch(err => {
			console.log(err)
		})
}

const handleCardFormSubmit = evt => {
	evt.preventDefault()
	cardFormButton.textContent = 'Создание...'
	addCard({
		name: cardNameInput.value,
		link: cardLinkInput.value,
	})
		.then(cardData => {
			placesWrap.prepend(
				createCardElement(
					cardData,
					{
						onPreviewPicture: handlePreviewPicture,
						onLikeIcon: handleLikeCard,
						onDeleteCard: handleDeleteCard,
					},
					cardData.owner._id
				)
			)
			closeModalWindow(cardFormModalWindow)
			cardFormButton.textContent = 'Создать'
		})
		.catch(err => {
			console.log(err)
		})
}

// Создание объекта с настройками валидации
const validationSettings = {
	formSelector: '.popup__form',
	inputSelector: '.popup__input',
	submitButtonSelector: '.popup__button',
	inactiveButtonClass: 'popup__button_disabled',
	inputErrorClass: 'popup__input_type_error',
	errorClass: 'popup__error_visible',
}

enableValidation(validationSettings)

// EventListeners
profileForm.addEventListener('submit', handleProfileFormSubmit)
cardForm.addEventListener('submit', handleCardFormSubmit)
avatarForm.addEventListener('submit', handleAvatarFromSubmit)

openProfileFormButton.addEventListener('click', () => {
	profileTitleInput.value = profileTitle.textContent
	profileDescriptionInput.value = profileDescription.textContent
	openModalWindow(profileFormModalWindow)
	clearValidation(profileForm, validationSettings)
})

profileAvatar.addEventListener('click', () => {
	avatarForm.reset()
	openModalWindow(avatarFormModalWindow)
	clearValidation(avatarForm, validationSettings)
})

openCardFormButton.addEventListener('click', () => {
	cardForm.reset()
	openModalWindow(cardFormModalWindow)
	clearValidation(cardForm, validationSettings)
})

header.addEventListener('click', () => {
	openStatistic()
})

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll('.popup')
allPopups.forEach(popup => {
	setCloseModalWindowEventListeners(popup)
})

const handleDeleteCard = (cardElement, cardId) => {
	openModalWindow(deleteCardFormModalWindow)

	deleteCardForm.addEventListener('submit', event => {
		event.preventDefault()
		deleteCardFormButton.textContent = 'Удаление...'
		deleteCard(cardId)
			.then(() => {
				cardElement.remove()
				closeModalWindow(deleteCardFormModalWindow)
				deleteCardFormButton.textContent = 'Да'
			})
			.catch(err => {
				console.log(err)
			})
	})
}

const handleLikeCard = (likeButton, cardLikeCount, cardId) => {
	changeLikeCardStatus(
		cardId,
		likeButton.classList.contains('card__like-button_is-active')
	)
		.then(likeData => {
			likeButton.classList.toggle('card__like-button_is-active')
			cardLikeCount.textContent = likeData.likes.length
		})
		.catch(err => {
			console.log(err)
		})
}

Promise.all([getCardList(), getUserInfo()])
	.then(([cards, userData]) => {
		cards.forEach(data => {
			placesWrap.append(
				createCardElement(
					data,
					{
						onPreviewPicture: handlePreviewPicture,
						onLikeIcon: handleLikeCard,
						onDeleteCard: handleDeleteCard,
					},
					userData._id
				)
			)
		})

		profileTitle.textContent = userData.name
		profileDescription.textContent = userData.about
		profileAvatar.style.backgroundImage = `url(${userData.avatar})`
	})
	.catch(err => {
		console.log(err)
	})

// Статистика карточек
const openStatistic = () => {
	openModalWindow(statisticModalWindow)
	getCardList().then(cards => {
		const statistics = calculateStatistics(cards)

		const statiscticContainer = document.querySelector('.popup_type_info')
		const infoContainer = statiscticContainer.querySelector('.popup__info')
		infoContainer.innerHTML = ''

		const statsData = [
			{ term: 'Всего пользователей:', description: statistics.totalUsers },
			{ term: 'Всего лайков:', description: statistics.totalLikes },
			{
				term: 'Максимально лайков от одного:',
				description: statistics.maxLikesFromOne,
			},
			{ term: 'Чемпион лайков:', description: statistics.likeChampion },
		]

		const definitionTemplate = document.querySelector(
			'#popup-info-definition-template'
		)

		statsData.forEach(stat => {
			const definitionElement = definitionTemplate.content.cloneNode(true)
			const termElement = definitionElement.querySelector('.popup__info-term')
			const descriptionElement = definitionElement.querySelector(
				'.popup__info-description'
			)

			termElement.textContent = stat.term
			descriptionElement.textContent = stat.description

			infoContainer.appendChild(definitionElement)
		})

		const popularCardsList = statiscticContainer.querySelector('.popup__list')
		popularCardsList.innerHTML = ''

		const userTemplate = document.querySelector(
			'#popup-info-user-preview-template'
		)

		statistics.popularCards.forEach(card => {
			const userElement = userTemplate.content.cloneNode(true)
			const badgeElement = userElement.querySelector('.popup__list-item')

			badgeElement.textContent = card.name

			popularCardsList.appendChild(userElement)
		})
	})
}

const calculateStatistics = cards => {
	const allUsers = new Set()
	const usersLikeCount = new Map()
	const cardLikeCounts = []
	let totalLikes = 0
	let maxLikesFromOne = 0
	let likeChampion = ''

	cards.forEach(card => {
		allUsers.add(card.owner._id)

		const cardLikes = card.likes.length
		cardLikeCounts.push(cardLikes)
		totalLikes += cardLikes

		card.likes.forEach(user => {
			allUsers.add(user._id)

			const currentCount = usersLikeCount.get(user._id) || 0
			const newCount = currentCount + 1
			usersLikeCount.set(user._id, newCount)

			if (newCount > maxLikesFromOne) {
				maxLikesFromOne = newCount
				likeChampion = user.name
			}
		})
	})

	const sortedCards = [...cards].sort((a, b) => b.likes.length - a.likes.length)
	const popularCards = sortedCards.slice(0, 3)

	return {
		totalUsers: allUsers.size,
		totalLikes: totalLikes,
		maxLikesFromOne: maxLikesFromOne,
		likeChampion: likeChampion,
		popularCards: popularCards,
	}
}
