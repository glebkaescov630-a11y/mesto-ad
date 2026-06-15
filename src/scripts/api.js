import axios from 'axios'

const api = axios.create({
	baseURL: `https://mesto.nomoreparties.co/v1/${
		import.meta.env.VITE_TOKEN_GROUP
	}`,
	headers: {
		authorization: import.meta.env.VITE_TOKEN,
		'Content-Type': 'application/json',
	},
})

api.interceptors.response.use(
	response => response.data,
	error => {
		if (error.response) {
			return Promise.reject(`Ошибка: ${error.response.status}`)
		}
	}
)

export const getUserInfo = () => {
	return api.get('/users/me')
}

export const getCardList = () => {
	return api.get('/cards')
}

export const setUserInfo = ({ name, about }) => {
	return api.patch('/users/me', {
		name,
		about,
	})
}

export const setAvatarInfo = ({ avatar }) => {
	return api.patch('/users/me/avatar', {
		avatar,
	})
}

export const addCard = ({ name, link }) => {
	return api.post('/cards', {
		name,
		link,
	})
}

export const deleteCard = cardId => {
	return api.delete(`/cards/${cardId}`)
}

export const changeLikeCardStatus = (cardId, isLiked) => {
	return isLiked
		? api.delete(`/cards/likes/${cardId}`)
		: api.put(`/cards/likes/${cardId}`)
}
