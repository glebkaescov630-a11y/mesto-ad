const showInputError = (formElement, inputElement, errorMessage, settings) => {
	const errorElement = formElement.querySelector(`#${inputElement.id}-error`)

	inputElement.classList.add(settings.inputErrorClass)
	errorElement.classList.add(settings.errorClass)
	errorElement.textContent = errorMessage
}

const hideInputError = (formElement, inputElement, settings) => {
	const errorElement = formElement.querySelector(`#${inputElement.id}-error`)
	inputElement.classList.remove(settings.inputErrorClass)
	errorElement.classList.remove(settings.errorClass)
	errorElement.textContent = ''
}

const checkInputValidity = (formElement, inputElement, settings) => {
	if (inputElement.validity.valid) {
		hideInputError(formElement, inputElement, settings)
		return true
	} else {
		let errorMessage = inputElement.validationMessage
		if (inputElement.dataset.errorMessage) {
			errorMessage = inputElement.dataset.errorMessage
		}

		showInputError(formElement, inputElement, errorMessage, settings)
		return false
	}
}

const hasInvalidInput = inputList => {
	return inputList.filter(x => !x.validity.valid).length != 0
}

const disableSubmitButton = (buttonElement, settings) => {
	buttonElement.setAttribute('disabled', true)
	buttonElement.classList.add(settings.inactiveButtonClass)
}

const enableSubmitButton = (buttonElement, settings) => {
	buttonElement.removeAttribute('disabled')
	buttonElement.classList.remove(settings.inactiveButtonClass)
}

const toggleButtonState = (inputList, buttonElement, settings) => {
	if (hasInvalidInput(inputList)) {
		disableSubmitButton(buttonElement, settings)
	} else {
		enableSubmitButton(buttonElement, settings)
	}
}

const setEventListeners = (formElement, settings) => {
	const inputList = Array.from(
		formElement.querySelectorAll(settings.inputSelector)
	)
	const buttonElement = formElement.querySelector(settings.submitButtonSelector)

	toggleButtonState(inputList, buttonElement, settings)

	inputList.forEach(inputElement => {
		inputElement.addEventListener('input', () => {
			checkInputValidity(formElement, inputElement, settings)
			toggleButtonState(inputList, buttonElement, settings)
		})
	})
}

export const clearValidation = (formElement, settings) => {
	const inputList = Array.from(
		formElement.querySelectorAll(settings.inputSelector)
	)
	const buttonElement = formElement.querySelector(settings.submitButtonSelector)

	inputList.forEach(inputElement => {
		hideInputError(formElement, inputElement, settings)
	})

	disableSubmitButton(buttonElement, settings)
}

export const enableValidation = settings => {
	const formList = Array.from(document.querySelectorAll(settings.formSelector))

	formList.forEach(formElement => {
		setEventListeners(formElement, settings)
	})
}
