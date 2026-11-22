# Mám to na jazyku!

Párty hra: uhádni známy pojem v prestrojení. Pojmy sú zamaskované zvukom (fonetické frázy), doslovným prekladom, slangom, opisom, emoji, zápisom odzadu alebo obrázkogramom.

Hrať: https://surikman.github.io/mam-to-na-jazyku/. Je to PWA, takže sa dá pridať na plochu (iPhone: Zdieľať → Pridať na plochu) a funguje aj offline.

Nie je tu žiadny build ani server, sú to len statické súbory. Push do `main` stránku nasadí cez GitHub Pages.

## Štruktúra

| Súbor | Obsah |
|---|---|
| `index.html` | Kostra stránky (obrazovky Nastavenia, Karty, Hra, Výsledky) |
| `css/styles.css` | Vzhľad, vrátane tmavého režimu |
| `js/config.js` | Kategórie, typy kariet a pravidlá pre jazyk odpovede. Definuje `GAME.addCards` |
| `js/cards/*.js` | Kartičky. Jeden súbor = jeden typ |
| `js/app.js` | Logika hry |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA |

### Súbory s kartičkami

| Súbor | Typ |
|---|---|
| `phonetic.js` | 🔊 Fonetické |
| `translations.js` | 🌐 Doslovné preklady |
| `slang.js` | 🗣️ Prezývky a slang |
| `descriptions.js` | 📝 Opisy |
| `emoji.js` | 😀 Emoji hádanky |
| `reversed.js` | 🔄 Odzadu |
| `rebus.js` | 🧩 Obrázkogramy |

Karta vyzerá takto:

```js
{c:"film", p:"Dedo pľul", h:"Konštatovanie o neslušnom dedkovi.", a:"Deadpool"},
```

- `c`: kategória (`film`, `osob`, `znac`, `mies`, `hud`, `slov`)
- `p`: text na karte
- `h`: nápoveda
- `a`: správna odpoveď
- `ty` (voliteľné): ak karta patrí do viacerých typov, napr. `ty:["fon","pre"]`
- `lg` (voliteľné): jazyk odpovede, `"sk"` alebo `"orig"`. Inak sa odhadne podľa diakritiky.

`p` slúži aj ako ID karty. Úpravy a vypnutie karty, ktoré si hráč spraví v aplikácii, sa viažu naň.

## Pridanie nového typu alebo súboru

1. Pridaj typ do `GAME.types` v `js/config.js`.
2. Vytvor `js/cards/<nazov>.js` s `GAME.addCards("<id>", [...])`.
3. Pridaj `<script>` do `index.html` (pred `js/app.js`).
4. Pridaj súbor do `ASSETS` v `sw.js` a zvýš `CACHE` (napr. `mtnj-v2`).

Pri bežných úpravách existujúcich súborov netreba v `sw.js` nič meniť. Online sa vždy načíta čerstvá verzia a cache sa používa len offline.
