#!/usr/bin/env python3
"""
Smoke-тест APK на эмуляторе (CI): приложение запускается, показывает выбор языка,
главную и первый шаг записи, без падений. Ловит то, что не видно в тестах логики:
ошибки R8, отсутствующие нативные модули, падение JS при старте.

Запуск: python3 scripts/android-smoke-test.py SmileLab.apk smoke-artifacts
"""
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

APK, OUT = sys.argv[1], Path(sys.argv[2])
PKG = 'kg.smilelab.app'
OUT.mkdir(parents=True, exist_ok=True)


def adb(*args, check=True, text=True):
    return subprocess.run(['adb', *args], check=check, capture_output=True, text=text)


def alive():
    return adb('shell', 'pidof', PKG, check=False).stdout.strip() != ''


def screen(name):
    png = subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True).stdout
    (OUT / f'{name}.png').write_bytes(png)


def nodes():
    adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml', check=False)
    xml = adb('shell', 'cat', '/sdcard/ui.xml', check=False).stdout
    try:
        return list(ET.fromstring(xml[xml.find('<'):]).iter('node'))
    except ET.ParseError:
        return []


def wait_text(text, timeout):
    deadline = time.time() + timeout
    while time.time() < deadline:
        for node in nodes():
            if text in (node.get('text') or '') or text in (node.get('content-desc') or ''):
                return node
        if not alive():
            fail(f'приложение закрылось, ожидая «{text}»')
        time.sleep(2)
    fail(f'не дождались «{text}» за {timeout} с')


def tap(node):
    x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds')))
    adb('shell', 'input', 'tap', str((x1 + x2) // 2), str((y1 + y2) // 2))


def fail(reason):
    screen('failure')
    log = adb('logcat', '-d', check=False).stdout
    (OUT / 'logcat.txt').write_text(log)
    print(f'✗ Smoke-тест: {reason}')
    for line in log.splitlines():
        if re.search(r'FATAL EXCEPTION|AndroidRuntime|ReactNativeJS|Cannot find native module', line):
            print('  ' + line)
    sys.exit(1)


adb('install', '-r', APK)
adb('logcat', '-c')
adb('shell', 'am', 'start', '-W', '-n', f'{PKG}/.MainActivity')

# Первый запуск: выбор языка (эмулятор переводит ARM-код в x86 — старт медленный).
tap(wait_text('Русский', 180))
screen('1-onboarding')
book = wait_text('Записаться на приём', 60)
time.sleep(2)
screen('2-home')
tap(book)
wait_text('Какая услуга нужна?', 60)
time.sleep(2)
screen('3-booking-service')

log = adb('logcat', '-d', check=False).stdout
(OUT / 'logcat.txt').write_text(log)
crashes = [l for l in log.splitlines() if re.search(r'FATAL EXCEPTION|Cannot find native module', l)]
if crashes or not alive():
    fail('ошибки в logcat: ' + ' | '.join(crashes[:5]))
print('✓ Smoke-тест: запуск, выбор языка, главная, первый шаг записи — без падений')
