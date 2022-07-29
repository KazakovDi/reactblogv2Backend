import { body } from "express-validator" 

export const registerValidation = [
    body("email", "Корявое мыло").isEmail(),
    body("password", "Всратый пароль").isLength({min:3}),
    body("fullName", "Некрасивое имя").isLength({min:3}),
    body("avatarUrl", "Мать чекай").optional().isURL(),
]
export const loginValidation = [
    body("email", "Корявое мыло").isEmail(),
    body("password", "Всратый пароль").isLength({min:3})
]