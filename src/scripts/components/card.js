const getTemplate = () => {
	return document
		.getElementById('card-template')
		.content.querySelector('.card')
		.cloneNode(true)
}

export const createCardElement = (
	data,
	{ onPreviewPicture, onLikeIcon, onDeleteCard },
	userId
) => {
	const cardElement = getTemplate()
	const likeButton = cardElement.querySelector('.card__like-button')
	const deleteButton = cardElement.querySelector(
		'.card__control-button_type_delete'
	)
	const cardImage = cardElement.querySelector('.card__image')
	const cardLikeCount = cardElement.querySelector('.card__like-count')

	cardLikeCount.textContent = data.likes.length

	if (userId != data.owner._id) {
		deleteButton.remove()
	}

	if (data.likes.find(like => like._id == userId)) {
		likeButton.classList.toggle('card__like-button_is-active')
	}

	cardImage.src = data.link
	cardImage.alt = data.name
	cardElement.querySelector('.card__title').textContent = data.name

	if (onLikeIcon) {
		likeButton.addEventListener('click', () =>
			onLikeIcon(likeButton, cardLikeCount, data._id)
		)
	}

	if (onDeleteCard) {
		deleteButton.addEventListener('click', () =>
			onDeleteCard(cardElement, data._id)
		)
	}

	if (onPreviewPicture) {
		cardImage.addEventListener('click', () =>
			onPreviewPicture({ name: data.name, link: data.link })
		)
	}

	return cardElement
}
