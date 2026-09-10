# FrontScout CLI 🔍

> Autonomiczny agent CLI audytujący techniczne usterki frontendowe oraz wady wizualne (UX/Design) stron WWW do celów cold outreachu.

## 🚀 Możliwości modułu technicznego (v0.1.0)

- **Headless Playwright**: Automatyczna emulacja dwóch środowisk:
  - **Desktop**: 1920x1080
  - **Mobile**: Pixel 7 (412x839)
- **Zbieranie usterek technicznych w locie**:
  - `console.error` i `console.warn` z dokładną lokalizacją w kodzie strony.
  - Nieobsłużone wyjątki JavaScript (`pageerror`).
  - Nieudane żądania sieciowe HTTP (`status >= 400`).
- **Precyzyjna detekcja błędów responsywności (Layout Overflow)**:
  - Wykrywanie poziomego paska przewijania na urządzeniach mobilnych (`scrollWidth > viewportWidth`).
  - Automatyczna identyfikacja elementów przelewających się poza ekran (selektory CSS, tagi, wymiary w px).
- **Komplet zrzutów ekranu**:
  - Above-the-fold (pierwszy widoczny ekran) dla desktopu i mobile.
  - Pełna strona (`fullPage: true`) dla desktopu i mobile.
- **Struktura raportu**:
  - Automatyczny zapis w `output/<host_timestamp>/technical-audit.json` przygotowany do bezpośredniego przekazania do multimodalnego modelu LLM (GPT-4o / Claude 3.5 Sonnet).

---

## 📦 Instalacja

Wymagane środowisko: Node.js (v18+)

```bash
# Instalacja zależności
npm install

# Instalacja przeglądarki Chromium dla Playwright (jednorazowo)
npx playwright install chromium
```

---

## 💻 Użycie

### Podstawowe wywołanie:
```bash
npm run audit https://twojastrona.pl
```
lub bezpośrednio przez CLI:
```bash
npx tsx src/audit.ts https://example.com
```

### Opcje CLI:
```text
Usage: frontscout [options] <url>

Arguments:
  url                 Adres URL strony do audytu (np. example.com lub https://example.com)

Options:
  -o, --output <dir>  Ścieżka do katalogu wyjściowego (default: "output")
  -t, --timeout <ms>  Maksymalny czas oczekiwania na załadowanie strony w ms (default: "30000")
  -h, --help          Wyświetlenie pomocy
```

---

## 📁 Struktura katalogu wyjściowego (`output/`)

Po każdym audycie generowany jest unikalny katalog sesji:
```text
output/
└── example.com_2026-09-10T09-15-02-189Z/
    ├── screenshots/
    │   ├── desktop-fold.png   # Zrzut widoku Desktop (above the fold)
    │   ├── desktop-full.png   # Zrzut widoku Desktop (pełna długość)
    │   ├── mobile-fold.png    # Zrzut widoku Mobile Pixel 7 (above the fold)
    │   └── mobile-full.png    # Zrzut widoku Mobile Pixel 7 (pełna długość)
    └── technical-audit.json   # Szczegółowe podsumowanie techniczne
```
