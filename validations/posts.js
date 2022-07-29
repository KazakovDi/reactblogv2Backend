import { body } from "express-validator" 

export const postCreateValidation = [
    body("title", "Название статьи — говно").isLength({min:3}),
    body("text", "Текст статьи — хуйня").isLength({min:10, max:5000}),
    body("tags", "Тэги всрато написаны").optional().isString(),
    body("imageUrl", "Это не ссылка, а хуета").optional().isString(),
]