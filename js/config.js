// Spoločné dáta hry: kategórie, typy kariet a pravidlá pre jazyk odpovede.
// Kartičky sú v js/cards/*.js — každý súbor je jeden typ a volá GAME.addCards(typ, [...]).
var GAME = {
  cards: [],
  addCards: function(type, list){
    list.forEach(function(c){
      if(!c.ty) c.ty = [type];
      GAME.cards.push(c);
    });
  }
};

// Kategórie (c v karte = id)
GAME.categories = [
  {id:"film", name:"🎬 Filmy, seriály a postavy"},
  {id:"osob", name:"🌟 Známe osobnosti"},
  {id:"znac", name:"🏷️ Značky a technológie"},
  {id:"mies", name:"🗺️ Miesta a krajiny"},
  {id:"hud", name:"🎵 Hudba a hry"},
  {id:"slov", name:"📚 Slová a mená"}
];

// Typy kariet (ty v karte = id). tag = text nad frázou, hintTag = text nad nápovedou.
GAME.types = [
  {id:"fon", icon:"🔊", name:"Fonetické", tag:"Čítaj nahlas, rýchlo za sebou", hintTag:"Čo to znamená"},
  {id:"pre", icon:"🌐", name:"Doslovné preklady", tag:"Doslovný preklad. Aký je originál?", hintTag:"Nápoveda"},
  {id:"sla", icon:"🗣️", name:"Prezývky a slang", tag:"Prezývka alebo slang. Kto alebo čo to je?", hintTag:"Nápoveda"},
  {id:"opi", icon:"📝", name:"Opisy", tag:"Opis. O čom je reč?", hintTag:"Nápoveda"},
  {id:"emo", icon:"😀", name:"Emoji hádanky", tag:"Emoji hádanka. Opíš ich alebo ukáž.", hintTag:"Nápoveda"},
  {id:"rev", icon:"🔄", name:"Odzadu", tag:"Napísané odzadu. Prečítaj to nahlas.", hintTag:"Nápoveda"},
  {id:"reb", icon:"🧩", name:"Obrázkogramy", tag:"Obrázkogram. Poskladaj slovo z obrázkov a písmen.", hintTag:"Nápoveda"}
];
// Text nad kartou, ktorá patrí do viacerých typov naraz
GAME.typeMixTag = "Čítaj nahlas. Zvuk alebo preklad?";

// Jazyk odpovede sa odhaduje: diakritika alebo kategória "slov" = po slovensky, inak originál.
// Výnimky, ktoré sú po slovensky, hoci nemajú diakritiku:
GAME.skPlain = ["Praha","Bratislava","Japonsko","Taliansko","Kanada","Tibet","Afrika","Holandsko","Simpsonovci","Priatelia","Island","Singapur","Hongkong","Tokio","Peking","Bahamy","Kapverdy","Kostarika","Portoriko","Kuba","Egypt","Dubaj","Mexiko","Rusko","India","Slovensko","Hore","Kruh","To","Had","Aladin","Mimoni","Osvietenie","Tri prasiatka","Vlk a sedem kozliatok","Snehulienka","Krotitelia duchov","Socha slobody","Tom a Jerry","Irak","Levice","Mostar","Belehrad","Sedmohradsko","Venezuela","Barbados","Pakistan"];
// Výnimky, ktoré sú v origináli, hoci majú diakritiku:
GAME.origForce = ["Beyoncé","Sagrada Família","Pokémon","Nescafé","Škoda Octavia","Côte d'Azur"];
