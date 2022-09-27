import { body } from "express-validator"
export const registerValidation = [
    body("email", "Неверный формат email").isEmail(),
    body("password", "Неверный формат пароля").isLength({min:3}),
    body("fullName", "Неверный формат имени").isLength({min:3}),
    body("avatarUrl", "Неверный формат фото").optional().isURL(),
]
export const loginValidation = [
    body("email", "Неверный формат email").isEmail(),
    body("password", "Неверный формат пароля").isLength({min:3})
]