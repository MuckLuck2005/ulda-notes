# Linting

## Обрані інструменти
- ESLint — перевірка JavaScript-коду
- Stylelint — перевірка CSS
- HTMLHint — перевірка HTML
- TypeScript (checkJs) — статична перевірка JavaScript
- Husky — pre-commit hook для автоматичного запуску перевірок

## Чому обрано саме ці інструменти
Проєкт є статичним вебсайтом на HTML, CSS і JavaScript, тому перевірка має охоплювати всі три типи файлів. ESLint контролює правильність JavaScript-коду, Stylelint забезпечує єдиний стиль CSS, HTMLHint перевіряє базову коректність HTML-розмітки, а TypeScript дозволяє виконувати статичну перевірку JS без переходу на .ts.

## Базові правила
### ESLint
- no-var — заборона var
- prefer-const — використання const, де це можливо
- no-console — попередження про console.log
- eqeqeq — заборона == на користь ===
- curly — обов’язкові фігурні дужки

### Stylelint
- stylelint-config-standard — стандартний набір правил
- selector-class-pattern — kebab-case для CSS-класів
- color-hex-length — скорочення hex-кольорів, де це можливо

### HTMLHint
- doctype-first
- tag-pair
- tagname-lowercase
- attr-lowercase
- attr-value-double-quotes
- attr-no-duplication
- id-unique
- alt-require

## Ігнорування
Лінтери не перевіряють:
- node_modules
- .husky
- dist
- coverage

## Запуск
```bash
npm run lint:js
npm run lint:css
npm run lint:html
npm run typecheck
npm run lint
npm run check