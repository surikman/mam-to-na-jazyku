// 📝 Opisy — Krátky opis pojmu.
// Polia karty: c = kategória (id z js/config.js), p = text na karte, h = nápoveda, a = správna odpoveď.
// Voliteľné: ty = viac typov naraz, napr. ["fon","pre"]; lg = jazyk odpovede "sk" / "orig" (inak sa odhadne).
// Pozor: p slúži aj ako ID karty — po zmene p sa stratia úpravy, ktoré si hráč ku karte uložil v aplikácii.
GAME.addCards("opi", [

  // 🎬 Filmy, seriály a postavy
  {c:"film", p:"Žltá huba v nohaviciach, ktorá býva v ananáse pod morom.", h:"Rozprávka, začína na S.", a:"SpongeBob"},
  {c:"film", p:"Zelený zlobor, ktorý žije v močiari s ukecaným somárom.", h:"Rozprávka, začína na S.", a:"Shrek"},
  {c:"film", p:"Loď, ktorá sa na prvej plavbe zrazila s ľadovcom.", h:"Film, začína na T.", a:"Titanic"},
  {c:"film", p:"Chlapec ostane cez Vianoce bez rodiny a bráni dom pred dvoma zlodejmi.", h:"Film, začína na S.", a:"Sám doma"},
  {c:"film", p:"Rybí otec hľadá cez celý oceán strateného syna.", h:"Rozprávka, začína na H.", a:"Hľadá sa Nemo"},
  {c:"film", p:"Štyria chlapi lovia v New Yorku strašidlá.", h:"Film, začína na K.", a:"Krotitelia duchov"},
  {c:"film", p:"Učiteľ chémie začne variť drogy.", h:"Seriál, začína na B.", a:"Breaking Bad"},
  {c:"film", p:"Šiesti kamaráti vysedávajú v kaviarni Central Perk.", h:"Seriál, začína na P.", a:"Priatelia"},
  {c:"film", p:"Žltá rodina zo Springfieldu.", h:"Seriál, začína na S.", a:"Simpsonovci"},
  {c:"film", p:"Malý tvor nesie šperk do sopky.", h:"Film, začína na P.", a:"Pán prsteňov"},
  {c:"film", p:"Archeológ s klobúkom a bičom.", h:"Film, začína na I.", a:"Indiana Jones"},
  {c:"film", p:"Stroj z budúcnosti prišiel zabiť matku budúceho vodcu.", h:"Film, začína na T.", a:"Terminátor"},
  {c:"film", p:"Miliardár v kovovom obleku s reaktorom v hrudi.", h:"Superhrdina, začína na I.", a:"Iron Man"},
  {c:"film", p:"Pravekí jašteri ožijú v zábavnom areáli.", h:"Film, začína na J.", a:"Jurský park"},
  {c:"film", p:"Muž sedí na lavičke s bonboniérou a rozpráva svoj život.", h:"Film, začína na F.", a:"Forrest Gump"},

  // 🌟 Známe osobnosti
  {c:"osob", p:"Rakúsky kulturista, ktorý bol guvernérom Kalifornie.", h:"Herec, začína na A.", a:"Arnold Schwarzenegger"},
  {c:"osob", p:"Spevák v bielej rukavici, ktorý tancoval mesačnú chôdzu.", h:"Spevák, začína na M.", a:"Michael Jackson"},
  {c:"osob", p:"Portugalský futbalista so sedmičkou na chrbte.", h:"Futbalista, začína na C.", a:"Cristiano Ronaldo"},
  {c:"osob", p:"Švédske dievča, ktoré štrajkovalo za klímu.", h:"Aktivistka, začína na G.", a:"Greta Thunberg"},
  {c:"osob", p:"Fyzik s vyplazeným jazykom a strapatými vlasmi.", h:"Vedec, začína na A.", a:"Albert Einstein"},
  {c:"osob", p:"Maliar slnečníc, ktorý si odrezal ucho.", h:"Maliar, začína na V.", a:"Vincent van Gogh"},
  {c:"osob", p:"Britský komik, ktorý takmer nehovorí a má plyšového medvedíka.", h:"Postava, začína na M.", a:"Mr. Bean"},
  {c:"osob", p:"Jamajčan, ktorý zabehol stovku za 9,58 sekundy.", h:"Športovec, začína na U.", a:"Usain Bolt"},
  {c:"osob", p:"Speváčka, ktorá prišla na odovzdávanie cien v šatách z mäsa.", h:"Speváčka, začína na L.", a:"Lady Gaga"},

  // 🏷️ Značky a technológie
  {c:"znac", p:"Švédsky obchod, kde si nábytok skladáš sám.", h:"Obchod, začína na I.", a:"IKEA"},
  {c:"znac", p:"Dánske kocky, na ktoré nechceš stúpiť bosý.", h:"Hračka, začína na L.", a:"Lego"},
  {c:"znac", p:"Hnedý sýtený nápoj v červenej plechovke.", h:"Nápoj, začína na C.", a:"Coca-Cola"},
  {c:"znac", p:"Aplikácia, kde ťaháš prstom doprava alebo doľava.", h:"Aplikácia, začína na T.", a:"Tinder"},
  {c:"znac", p:"Platforma s krátkymi tanečnými videami.", h:"Aplikácia, začína na T.", a:"TikTok"},
  {c:"znac", p:"Elektrické autá s falcon dverami.", h:"Auto, začína na T.", a:"Tesla"},
  {c:"znac", p:"Lieskovoorieškový krém na chlieb.", h:"Jedlo, začína na N.", a:"Nutella"},
  {c:"znac", p:"Fínsky mobil, ktorý prežije aj pád z paneláku.", h:"Telefón, začína na N.", a:"Nokia 3310"},

  // 🗺️ Miesta a krajiny
  {c:"mies", p:"Železná veža v Paríži.", h:"Pamiatka, začína na E.", a:"Eiffelova veža"},
  {c:"mies", p:"Naklonená zvonica v Taliansku.", h:"Pamiatka, začína na Š.", a:"Šikmá veža v Pise"},
  {c:"mies", p:"Mesto na vode s gondolami.", h:"Mesto, začína na B.", a:"Benátky"},
  {c:"mies", p:"Najvyšší vrch sveta.", h:"Hora, začína na M.", a:"Mount Everest"},
  {c:"mies", p:"Dlhé kamenné opevnenie na severe Číny.", h:"Pamiatka, začína na V.", a:"Veľký čínsky múr"},
  {c:"mies", p:"Zelená dáma s pochodňou pri New Yorku.", h:"Pamiatka, začína na S.", a:"Socha slobody"},
  {c:"mies", p:"Trojuholníkové hrobky faraónov.", h:"Pamiatka, začína na P.", a:"Pyramídy v Gíze"},

  // 🎵 Hudba a hry
  {c:"hud", p:"Inštalatér s fúzmi, ktorý skáče na korytnačky.", h:"Hra, začína na S.", a:"Super Mario"},
  {c:"hud", p:"Žltý kruh, ktorý žerie bodky a uteká pred duchmi.", h:"Hra, začína na P.", a:"Pac-Man"},
  {c:"hud", p:"Padajúce kocky, ktoré skladáš do riadkov.", h:"Hra, začína na T.", a:"Tetris"},
  {c:"hud", p:"Modrý ježko, ktorý beží veľmi rýchlo.", h:"Hra, začína na S.", a:"Sonic"},
  {c:"hud", p:"Štyria Švédi, ktorí vyhrali Eurovíziu s piesňou Waterloo.", h:"Kapela, začína na A.", a:"ABBA"},
  {c:"hud", p:"Kórejská pieseň s tancom ako jazda na koni.", h:"Pieseň, začína na G.", a:"Gangnam Style"},
]);
