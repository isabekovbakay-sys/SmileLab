/**
 * Проверка перед релизной сборкой (профили EAS "apk" и "production").
 * Запуск: npm run release:check. Падает с понятным списком, если данные клиники не заполнены:
 * релиз с пустым телефоном, адресом или юрлицом в политике публиковать нельзя.
 * Для демо-сборки (EXPO_PUBLIC_DEMO=1) проверка не нужна и пропускается.
 */
import { clinicConfig } from '../src/config/clinic';
import { clinicDoctors } from '../src/data/clinic/doctors';
import { clinicServices } from '../src/data/clinic/services';
import { releaseProblems } from './releaseRules';

if (process.env.EXPO_PUBLIC_DEMO === '1') {
  console.log('Демо-сборка (EXPO_PUBLIC_DEMO=1): проверка данных клиники пропущена.');
  process.exit(0);
}

const problems = releaseProblems({ config: clinicConfig, services: clinicServices, doctors: clinicDoctors });

if (problems.length > 0) {
  console.error('\n✗ Релизную сборку собирать нельзя — не заполнены данные клиники:\n');
  for (const problem of problems) console.error(`  • ${problem}`);
  console.error('\nЗаполните данные (комментарии в файлах подскажут формат) и запустите проверку снова.');
  console.error('Для показа без реальных данных соберите демо: bash scripts/build-apk.sh demo\n');
  process.exit(1);
}

console.log('✓ Данные клиники заполнены — можно собирать релиз.');
