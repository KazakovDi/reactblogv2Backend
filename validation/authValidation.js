import { body } from "express-validator"
const registerValidation = [
    body("email", "Неверный формат email").isEmail(),
    body("password", "Неверный формат пароля").isLength({min:3}),
    body("fullName", "Неверный формат имени").isLength({min:3}),
    body("avatarUrl", "Неверный формат фото").optional().isURL(),
]
const loginValidation = [
    body("email", "Неверный формат email").isEmail(),
    body("password", "Неверный формат пароля").isLength({min:3})
]
export default {
    registerValidation: registerValidation,
    loginValidation:loginValidation
};