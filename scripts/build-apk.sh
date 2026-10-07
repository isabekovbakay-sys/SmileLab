#!/usr/bin/env bash
# Сборка Android через EAS (облако Expo). Приложение для пациентов и Google Play собирается ТОЛЬКО так:
# EAS хранит ключ подписи, и все обновления будут подписаны тем же ключом.
#
#   bash scripts/build-apk.sh apk         — релизный APK для прямой установки (профиль "apk")
#   bash scripts/build-apk.sh production  — AAB для Google Play (профиль "production")
#   bash scripts/build-apk.sh demo        — демо-APK с примерами услуг и врачей (профиль "demo"), не для пациентов
set -euo pipefail

PROFILE="${1:-apk}"
if [[ "$PROFILE" != "apk" && "$PROFILE" != "production" && "$PROFILE" != "demo" ]]; then
  echo "Использование: bash scripts/build-apk.sh [apk|production|demo]" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "→ Установка зависимостей"
npm install

echo "→ Проверки: типы, линтер, тесты"
npm run check

if [[ "$PROFILE" == "demo" ]]; then
  echo ""
  echo "⚠  Демо-сборка: примерные услуги, цены, врачи и часы, плашка «Демо»."
  echo "   Только для показа владельцу. Пациентам и в Google Play — профили apk / production."
  echo ""
else
  echo "→ Проверка данных клиники (release-check)"
  EXPO_PUBLIC_DEMO=0 npm run release:check
fi

if ! npx eas-cli@latest whoami >/dev/null 2>&1; then
  echo "→ Вход в аккаунт Expo"
  npx eas-cli@latest login
fi

echo "→ Сборка: профиль $PROFILE (на бесплатном тарифе бывает очередь 1–2 часа)"
npx eas-cli@latest build -p android --profile "$PROFILE"

if [[ "$PROFILE" != "demo" ]]; then
  echo ""
  echo "════════════════════════════════════════════════════════════════════"
  echo " ВАЖНО: резервная копия ключа подписи"
  echo " Скачайте копию ключа: eas credentials -p android → Download keystore."
  echo " Храните её у владельца клиники (не в репозитории): без ключа нельзя"
  echo " выпустить обновление APK, которое установится поверх текущего."
  echo "════════════════════════════════════════════════════════════════════"
fi
