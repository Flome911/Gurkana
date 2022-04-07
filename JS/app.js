                                                                                    // Alles aus Html anpacken:
const section = document.querySelector('#memory');                                  // Section, in der das Spiel statt findet.
const VersucheCount = document.querySelector("#VersucheCount");                               // VersucheZähler"Anpacker"
let Versuche = 10;                                                                  // der Wert für den VersucheZähler, damit man diese auch runterzählen kann (let: variable)

                                                                                    // Variable an Text binden:
VersucheCount.textContent = Versuche;

                                                                                    // Karten-Daten generieren (Bild und Name). zwei mal, damit Paare entstehen:
const getData = () => [
  { imgSrc: "../images/Banane.svg", name: "Banane" },
  { imgSrc: "../images/Melone.svg", name: "Melone" },
  { imgSrc: "../images/Kartoffel.svg", name: "Kartoffel" },
  { imgSrc: "../images/Erdbeere.svg", name: "Erdbeere" },
  { imgSrc: "../images/Gurke.svg", name: "Gurke" },
  { imgSrc: "../images/Karotte.svg", name: "Karotte" },
  { imgSrc: "../images/Apfel.svg", name: "Apfel" },
  { imgSrc: "../images/Kirsche.svg", name: "Kirsche" },
                                                                                    // Ab hier Kopie
  { imgSrc: "../images/Banane.svg", name: "Banane" },
  { imgSrc: "../images/Melone.svg", name: "Melone" },
  { imgSrc: "../images/Kartoffel.svg", name: "Kartoffel" },
  { imgSrc: "../images/Erdbeere.svg", name: "Erdbeere" },
  { imgSrc: "../images/Gurke.svg", name: "Gurke" },
  { imgSrc: "../images/Karotte.svg", name: "Karotte" },
  { imgSrc: "../images/Apfel.svg", name: "Apfel" },
  { imgSrc: "../images/Kirsche.svg", name: "Kirsche" },
];

                                                                                    // Mischt Karten:
const randomize = () => {
  const cardData = getData();                                                       // Array der Karten-Daten speichern
  cardData.sort(() => Math.random() -0.5);                                          // Math.random spuckt Zahl zwischen 0 und 1 zurück. Davon ziehen wir 0.5 ab. also sind wir zwischen -0.5 und <0.5 (d.h. circa 50% negativ/positiv). .sort sortiert ihren index je nachdem, ob positiv oder negativ.. Positiv b über a, negativ a über b.
  return cardData;                                                                  // Zurückgeben des gemischten Decks
};

                                                                                    // Funktion, um Karten zu generieren:
const cardGenerator= () => {                                                        
  const cardData = randomize ();
                                                                                    // Html generieren:
  const cards = document.querySelectorAll("card");                                  // Alle Karten auswählen und in die Konstante "cards" legen
                                                                                    // forEach-Schleife, um für jedes Element in cardData folgendes zu tun:
  cardData.forEach((item) => {                                                      // item: imgSrC & name werden übergeben
    const card = document.createElement("div");                                     // KartenContainer
    const face = document.createElement("img");                                     // Vorderseite
    const back = document.createElement("back");                                    // Rücken
                                                                                    // Klassen für alle Container erstellen
    card.classList = "card";
    face.classList = "face";
    back.classlist = "back";
                                                                                    // Daten an die Karten binden
    face.src = item.imgSrc;                                                         // Vorderseitenquelle entspricht Kartenquelle
    card.setAttribute("name", item.name)                                            // übergibt dem erstellten Html-Objekt "card" den Namen der Quelldatei im Ordner images
                                                                                    // Karten an die Section binden:
    section.appendChild(card);
    card.appendChild(face);                                                         // Vorder- und Rückseite an die Karte binden
    card.appendChild(back);

                                                                                    // bei einem "Klick" soll die Funktion toggleCard (die Karte um 180 Grad rotieren) ausgeführt werden:
    card.addEventListener("click", (e) => {                                         // e übergibt die angeklickte Karte
      card.classList.toggle("toggleCard");
      checkCards(e);                                                                // Anwenden der Funktion checkCards
    })
  });
};

                                                                                    // Überprüfen, ob zwei Karten gleich sind:
const checkCards = (e) => {                                                         // 
  const clickedCard = e.target;                                                     // Angeklickte Karte wird "clickedCard" hinzugefügt
  clickedCard.classList.add("flipped");                                             // gibt der angeklickten Karte das Attribut "flipped"
  const flippedCards = document.querySelectorAll(".flipped");                       // fügt geflippte Karten dem Array "flippedCards" zu
  const toggleCard = document.querySelectorAll(".toggleCard");                      // fügt getoggelte Karte dem Array "toggleCards" zu
  if (flippedCards.length === 2) {                                                  // wenn es zwei geflippte Karten gibt...
    if (
      flippedCards[0].getAttribute("name") ===
      flippedCards[1].getAttribute("name")                                          // wenn der Name beider geflippten Karten der gleiche ist...
    ){
      flippedCards.forEach((card) => {                                              // für alle geflippten Karten
        card.classList.remove("flipped");                                           // wenn Match, Attribut "flipped" entfernen, damit dort immer nur max. 2 Karten sind
        card.style.pointerEvents = "none";                                          // Karte nicht mehr anklickbar
      });
    } else {
      flippedCards.forEach((card) => {                                              // für alle geflippten Karten
        card.classList.remove("flipped");                                           // wenn kein Match, Attribut "flipped" entfernen sprich wieder verdecken
        setTimeout(() => card.classList.remove("toggleCard"), 1000);                // Karte zurück rotieren; Delay, damit die Karte nicht direkt nach Anklicken zurückrotiert wird
        });
        Versuche--;                                                                 // Zieht einen Versuch ab
        setTimeout(() => VersucheCount.textContent = Versuche, 1000);               // Updated die grafische Oberfläche | Update, wenn Karten umgedreht sind
        if(Versuche === 0) {                                                        // Wenn Versuche erschöpft
        setTimeout(() => restart("You lose!"), 1000);                               // Aufruf der Funktion restart mit der Meldung "You lose!" | Delay für flüssigeres Spielerlebnis
        }
      }
  }
                                                                                    // Gewonnen? Check:
 if(toggleCard.length === 16) {                                                     // Abfrage, ob alle 16 Karten aufgedeckt sind
  restart("You win!");                                                              // Aufruf der Funktion restart mit der Meldung "You win!"
 }
};

                                                                                    // Restarter
const restart = (text) => {                                                         // Übergibt Platzhalter: "text"
  let cardData = randomize ();                                                      // mischt das Deck
  let faces = document.querySelectorAll(".face");                                   // aktualisiert Vorderseite
  let cards = document.querySelectorAll(".card");                                   // aktualisiert Karte
  //section.style.pointerEvents = "none";                                           // entfernt "Griffe" || Sektion hat keine Griffe?
  cardData.forEach((item,index) => {                                                // für jede Karte werden Attribute übergeben
    cards[index].classList.remove("toggleCard");                                    // Alle Karten werden umgedreht
                                                                                    // Mischen
    setTimeout(() => {                                                              // wird NACH dem umdrehen gemacht (Dauer 1s)
       cards[index].style.pointerEvents = " all";                                   // "Griffe" werden wieder angebracht
      faces[index].src = item.imgSrc;                                               // Vorderseite wird von der Karte geholt
      cards[index].setAttribute("name", item.name);                                 // Attribut "Name" wird gesetzt
      //section.style.pointerEvents = "all";                                        // Sektion hat keine Griffe?
    }, 1000);
  });
  Versuche = 10;                                                                    // Setzt Versuche wieder auf 10
  VersucheCount.textContent = Versuche;                                             // aktualisiert UI
  setTimeout(() => window.alert(text), 100);                                        // Textmitteilung mit Platzhalter (Gewonnen/Verloren)
};

cardGenerator();                                                                    // Funktionsaufruf