// 🔄 Odzadu — Pojem napísaný odzadu.
// Polia karty: c = kategória (id z js/config.js), p = text na karte, h = nápoveda, a = správna odpoveď.
// Voliteľné: ty = viac typov naraz, napr. ["fon","pre"]; lg = jazyk odpovede "sk" / "orig" (inak sa odhadne).
// Pozor: p slúži aj ako ID karty — po zmene p sa stratia úpravy, ktoré si hráč ku karte uložil v aplikácii.
GAME.addCards("rev", [

  // 🎬 Filmy, seriály a postavy
  {c:"film", p:"Namtab", h:"Superhrdina, začína na B.", a:"Batman"},
  {c:"film", p:"Kerhs", h:"Rozprávka, začína na S.", a:"Shrek"},
  {c:"film", p:"Ratava", h:"Film, začína na A.", a:"Avatar"},
  {c:"film", p:"Cinatit", h:"Film, začína na T.", a:"Titanic"},
  {c:"film", p:"Rekoj", h:"Film, začína na J.", a:"Joker"},
  {c:"film", p:"Kluh", h:"Superhrdina, začína na H.", a:"Hulk"},
  {c:"film", p:"Roht", h:"Superhrdina, začína na T.", a:"Thor"},
  {c:"film", p:"Rettop Yrrah", h:"Film, začína na H.", a:"Harry Potter"},
  {c:"film", p:"Obmar", h:"Film, začína na R.", a:"Rambo"},
  {c:"film", p:"Xirtam", h:"Film, začína na M.", a:"Matrix"},

  // 🌟 Známe osobnosti
  {c:"osob", p:"Annodam", h:"Speváčka, začína na M.", a:"Madonna"},
  {c:"osob", p:"Arikahs", h:"Speváčka, začína na S.", a:"Shakira"},
  {c:"osob", p:"Annahir", h:"Speváčka, začína na R.", a:"Rihanna"},
  {c:"osob", p:"Menime", h:"Raper, začína na E.", a:"Eminem"},
  {c:"osob", p:"Eleda", h:"Speváčka, začína na A.", a:"Adele"},
  {c:"osob", p:"Issem", h:"Futbalista, začína na M.", a:"Messi"},
  {c:"osob", p:"Odlanor", h:"Futbalista, začína na R.", a:"Ronaldo"},
  {c:"osob", p:"Ttip Darb", h:"Herec, začína na B.", a:"Brad Pitt"},
  {c:"osob", p:"Agag Ydal", h:"Speváčka, začína na L.", a:"Lady Gaga"},

  // 🏷️ Značky a technológie
  {c:"znac", p:"Alset", h:"Auto, začína na T.", a:"Tesla"},
  {c:"znac", p:"Elgoog", h:"Značka, začína na G.", a:"Google"},
  {c:"znac", p:"Xilften", h:"Značka, začína na N.", a:"Netflix"},
  {c:"znac", p:"Koobecaf", h:"Sociálna sieť, začína na F.", a:"Facebook"},
  {c:"znac", p:"Ebutuoy", h:"Značka, začína na Y.", a:"YouTube"},
  {c:"znac", p:"Margatsni", h:"Sociálna sieť, začína na I.", a:"Instagram"},
  {c:"znac", p:"Nozama", h:"Značka, začína na A.", a:"Amazon"},
  {c:"znac", p:"Aikon", h:"Telefón, začína na N.", a:"Nokia"},
  {c:"znac", p:"Ogel", h:"Hračka, začína na L.", a:"Lego"},
  {c:"znac", p:"Aeki", h:"Obchod, začína na I.", a:"Ikea"},
  {c:"znac", p:"Sadida", h:"Značka, začína na A.", a:"Adidas"},
  {c:"znac", p:"Ispep", h:"Nápoj, začína na P.", a:"Pepsi"},
  {c:"znac", p:"Atnaf", h:"Nápoj, začína na F.", a:"Fanta"},
  {c:"znac", p:"Atoyot", h:"Auto, začína na T.", a:"Toyota"},

  // 🗺️ Miesta a krajiny
  {c:"mies", p:"Žírap", h:"Mesto, začína na P.", a:"Paríž"},
  {c:"mies", p:"Nýdnol", h:"Mesto, začína na L.", a:"Londýn"},
  {c:"mies", p:"Oikot", h:"Mesto, začína na T.", a:"Tokio"},
  {c:"mies", p:"Mír", h:"Mesto, začína na R.", a:"Rím"},
  {c:"mies", p:"Aharp", h:"Mesto, začína na P.", a:"Praha"},
  {c:"mies", p:"Jabud", h:"Mesto, začína na D.", a:"Dubaj"},
  {c:"mies", p:"Dirdam", h:"Mesto, začína na M.", a:"Madrid"},
  {c:"mies", p:"Abuk", h:"Krajina, začína na K.", a:"Kuba"},
  {c:"mies", p:"Tpyge", h:"Krajina, začína na E.", a:"Egypt"},

  // 🎵 Hudba a hry
  {c:"hud", p:"Oiram", h:"Hra, začína na M.", a:"Mario"},
  {c:"hud", p:"Sirtet", h:"Hra, začína na T.", a:"Tetris"},
  {c:"hud", p:"Neeuq", h:"Kapela, začína na Q.", a:"Queen"},
  {c:"hud", p:"Anavrin", h:"Kapela, začína na N.", a:"Nirvana"},
  {c:"hud", p:"Etintrof", h:"Hra, začína na F.", a:"Fortnite"},
]);
