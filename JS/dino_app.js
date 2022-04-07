// Welt
const WORLD_WIDTH = 100 //verhältnis von width 
const WORLD_HEIGHT = 30 // zu height 100/30
const worldElem = document.querySelector('[data-world]')
const SPEED = .05
const groundElems = document.querySelectorAll("[data-ground]")
const speedScaleIncrease = 0.00001
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-startScreen]")
const dinoElem = document.querySelector("[data-character]")


const jump_Speed = .45
const gravity = .002
const dinoFrameCount = 2
const frameTime = 100
const cactusIntervalMin = 500
const cactusIntervalMax = 2000

var delta
var yVelocity
var isJumping
var dinoFrame
var currentFrameTime
var lastTime
var speedScale
var score
var nextCactusTime


setPixelToWorldScale() // passt Worldgroeße direkt beim start an
window.addEventListener("resize" , setPixelToWorldScale) // pass Worldgroeße bei resize an
document.addEventListener("keydown", handleStart, {once: true}) //bei Tastendruck wird die function handleStart abgerufen umd das Spiel zu starten


function update(time) { //damit das Bild geupdated wird
    if (lastTime == null) { //bei Spielstart
        lastTime = time     
        window.requestAnimationFrame(update) //Animation wird abgespielt
        return
    }
    delta = time - lastTime; //abstand zwischen frames wird berechnet
    
    updateGround(delta, speedScale) //die bewegungsgeschwindigkeit des bodens wird mithilfe der Frames berechnet damit keine Ruckler entstehen
    updateSpeedScale(delta) // updated Speedscale, damit das spiel schneller wird
    updateScore(delta)
    updateDino(delta, speedScale)
    updateCactus(delta, speedScale)
    if (checkLose()) return handleLose() //beendet die updateSchleife bei lose
    lastTime = time //lastTime 
    window.requestAnimationFrame(update) // loop, ruft sich selbst auf
}

function updateSpeedScale(delta) { // Speedscale wird angepasst damit das spiel immer schneller wird
    speedScale += delta * speedScaleIncrease
}

function updateScore(delta) {
    score += delta * 0.01
    scoreElem.textContent = Math.floor(score); // Math.floor gibt Integer value zurück (keine großen 0.000000 Zahlen)
}

function handleStart() { // funktion um bei tastendruck zu starten
    lastTime = null
    setupGround() 
    setupDino()
    setupCactus()
    speedScale = 1
    score = 0
    startScreenElem.classList.add("hide")
    window.requestAnimationFrame(update)
}

function setPixelToWorldScale() {
    let worldToPixelScale
    if(window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) // Falls das Verhältnis kleiner als 100/30 ist 
    {                                                                       // d.h. Height zu groß oder width zu klein
        worldToPixelScale = window.innerWidth / WORLD_WIDTH                 // wird worldToPixelScale zu
    } else {
        worldToPixelScale = window.innerHeight/WORLD_HEIGHT                 //Falls görßer gleich 3.33 d.h. height kleiner oder width größer
    }

    var W_WIDTH = WORLD_WIDTH * worldToPixelScale                           // neue width und height werden berechnet
    var W_HEIGHT = WORLD_HEIGHT * worldToPixelScale
    worldElem.style.width = W_WIDTH+'px'                                    // width und height werden angepasst
    worldElem.style.height = W_HEIGHT+'px'
}

// Bodenbewegung

function setupGround() {
    setCustomProperty(groundElems[0], "--left", 0) // erstes Groundelement startet bei 0
    setCustomProperty(groundElems[1], "--left", 300) //2. startet bei 300 (300*1%)
}

function updateGround(delta , speedScale) {
    groundElems.forEach(ground => {
        incrementCustomProperty(ground, "--left", delta * speedScale * SPEED * -1) // boden läuft nach links (-1 weil negativ)

        if (getCustomProperty(ground, "--left") <= -300)  {//wenn das Bodenelement komplett durchgelaufen ist
            incrementCustomProperty(ground, "--left", 600) //setzt ground wieder an den start (-300 -> 300)
        }
    })
}

// Hilfsfunktionen (Getter und Setter)

function getCustomProperty(elem, prop) { //getter für position
    return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0
}

function setCustomProperty(elem, prop, value) { // setter für position
    elem.style.setProperty(prop, value)
}

function incrementCustomProperty(elem, prop, inc) { // Wert wird um bestimmten wert (inc) erhöht
    setCustomProperty(elem,prop, getCustomProperty(elem, prop) + inc)
}

// Dino


function setupDino() {  //die Startkriterien für Dino
    isJumping = false
    dinoFrame = 0
    currentFrameTime = 0
    yVelocity = 0
    setCustomProperty(dinoElem, "--bottom", 2)
    document.removeEventListener("keydown", onJump)
    document.addEventListener("keydown", onJump)
}

function updateDino(delta, speedScale) { //funktion damit character durchgehend udpated
    handleRun(delta, speedScale)
    handleJump(delta)
}

function handleRun() { //in updateDino permanent aufgerufen
    if (isJumping) { // falls er springt, wird die rennanimation nicht durchgeführt
        dinoElem.src = '../images/Kartoffel_stehend.svg'
        return
    }

    if (currentFrameTime >= frameTime) {
        dinoFrame = (dinoFrame + 1) % dinoFrameCount //dinoFrameCount = 2, d.h. % ergibt immer 0 oder 1, damit sich bild ändert
        if (dinoFrame === 1) {
            dinoElem.src = '../images/Kartoffel_gehend.svg'
        } else if (dinoFrame === 0) {
            dinoElem.src = '../images/Kartoffel_stehend.svg'
        }
        currentFrameTime -= frameTime
    }
    currentFrameTime += delta * speedScale // Der Charakter bewegt sich schneller mit erhöhtem speed
}

function handleJump(delta) {  //in updateDino permanent aufgerufen
    if (!isJumping) return //falls isJumping = false, wird handleJump nicht durchgeführt

    incrementCustomProperty(dinoElem, "--bottom", yVelocity * delta) // der bottom wert wird erhöht um yVelocity * delta
    
    if (getCustomProperty (dinoElem, "--bottom") <= 2) { // damit der character nicht weiter runter fällt
        setCustomProperty(dinoElem, "--bottom", 2)
        isJumping = false
    }

    yVelocity -= gravity * delta // reduziert yvelocity um gravity * delta d.h. der dino bewegt sich immer langsamer hoch und dann runter
}

function onJump(e) { //setzt yvelocity auf 0.45 und isJumping = true bei tastendruck, also funktioniert jetzt handleJump
    if (e.code !== "Space" || isJumping) return

    yVelocity = jump_Speed
    isJumping = true
}

function getDinoRect() {
    return dinoElem.getBoundingClientRect() // gibt die Werte des Rectangle von Dino wieder (also left, right, bottom, top)
}

function setDinoLose() {
    dinoElem.src = "../images/Kartoffel_tot.svg"
}


// cactus

function setupCactus() { //Startkriterien für Cactus, alle Cactus werden entfernt
    nextCactusTime = cactusIntervalMin
    document.querySelectorAll("[data-cactus]").forEach(cactus => {
      cactus.remove()
    })
}
  
 function updateCactus(delta, speedScale) { // läuft permanent und updated Cactus
    document.querySelectorAll("[data-cactus]").forEach(cactus => { // für jeden erstellten Cactus
      incrementCustomProperty(cactus, "--left", delta * speedScale * SPEED * -1) // Cactus bewegt sich nach links wie ground
      if (getCustomProperty(cactus, "--left") <= -100) { // falls Cactus -100 links aus dem bild,wird er gelöscht
        cactus.remove()
      }
    })
  
    if (nextCactusTime <= 0) { //der nächste Cactus wird erzeugt wenn der Zähler 0 (oder weniger) erreicht
      createCactus()
      nextCactusTime = randomNumberBetween(cactusIntervalMin, cactusIntervalMax) / speedScale //randomized number für den nächsten cactus
    }
    nextCactusTime -= delta //die randomized number wird runtergezählt in abhängigkeit von der Framezeit
}

function createCactus() { //cactus wird erzeugt
    const cactus = document.createElement("img")
    cactus.dataset.cactus = true
    cactus.src = "../images/cactus.svg"
    cactus.classList.add("cactus")
    setCustomProperty(cactus, "--left", 100)
    worldElem.append(cactus) //cactus wird an das World-Element rangehängt
}

function randomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max-min+1) +min) // math.random gibt zahl zwischen 0 und 1, math.floor macht es zu integer
}

function getCactusRects() {
    return [...document.querySelectorAll("[data-cactus]")].map(cactus =>// ...= Spread Operator: die einzelnen Elemente des Arrays werden abgerufen
    {
        return cactus.getBoundingClientRect() //gibt den left right top und bottom von jedem cactus zurück (Rect für Rectangle)
    })
}

// verloren?

function checkLose() {
    const dinoRect = getDinoRect()
    return getCactusRects().some(rect => isCollision(rect, dinoRect)) //schaut ob irgendeins der CactusRects mit dem DinoRect übereinstimmen
}

function isCollision(rect1, rect2) {
    return rect1.left < rect2.right // falls cactus rect1 links von dino rect2 ist
    && rect1.top < rect2.bottom // falls cactus rect1 top über dino rect2 bottom
    && rect1.right > rect2.left // wenn cactus rect1 right rechts von dino rect2 links ist
    && rect1.bottom > rect2.top
    
}

function handleLose() {
    setDinoLose() //ändert das bild des characters
    setTimeout(() => { //damit tastendrücke nicht das spiel sofort wieder starten
        document.addEventListener("keydown", handleStart, {once: true})
        startScreenElem.classList.remove("hide") //startscreen wird wieder angezeigt
    }, 100)
}