#!/usr/bin/env bash
# Сборка Android через EAS.
#   bash scripts/build-apk.sh apk         — APK для прямой установки (profile "apk")
#   bash scripts/build-apk.sh production  — AAB для Google Play (profile "production")
set -euo pipefail

PROFILE="${1:-apk}"
if [[ "$PROFILE" != "apk" && "$PROFILE" != "production" ]]; then
  echo "Использование: bash scripts/build-apk.sh [apk|production]" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "→ Установка зависимостей"
npm install

echo "→ Проверки: типы, линтер, тесты"
npm run check

if grep -Eq "^\s*isDemo:\s*true" src/config/clinic.ts; then
  echo ""
  echo "⚠  ВНИМАНИЕ: в src/config/clinic.ts стоит isDemo: true."
  echo "   Приложение соберётся с демо-данными и плашкой «Демо»."
  echo "   Для публикации замените данные клиники и выставьте isDemo: false."
  echo ""
  if [[ "$PROFILE" == "production" ]]; then
    read -r -p "Всё равно продолжить сборку для Google Play? [y/N] " answer
    [[ "$answer" == "y" || "$answer" == "Y" ]] || exit 1
  fi
fi

if ! npx eas-cli@latest whoami >/dev/null 2>&1; then
  echo "→ Вход в аккаунт Expo"
  npx eas-cli@latest login
fi

echo "→ Сборка: профиль $PROFILE (на бесплатном тарифе бывает очередь 1–2 часа)"
npx eas-cli@latest build -p android --profile "$PROFILE"
