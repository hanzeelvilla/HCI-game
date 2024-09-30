const btnStart = document.getElementById("btnStart")
const resultText = document.getElementById("result")
const gameArea = document.querySelector(".game-area")
const imgViejon = document.getElementById("imgViejon")
const imgCamaViejon = document.getElementById("imgCamaViejon")
const imgViejonDormido = document.getElementById("imgViejonDormido")

const soundEffect = new Audio("./sound_effect.mp3")
const soundVictory = new Audio("./victory.mp3")

let posX = 0
let posY = 0
const step = 100

// Función para obtener posición aleatoria dentro del game-area
const getRandomPosition = (element) => {
    const containerWidth = gameArea.offsetWidth
    const containerHeight = gameArea.offsetHeight
    const elementWidth = element.offsetWidth
    const elementHeight = element.offsetHeight

    const randomX = Math.floor(Math.random() * (containerWidth - elementWidth))
    const randomY = Math.floor(Math.random() * (containerHeight - elementHeight))

    return { randomX, randomY }
}

// Posiciona la cama en una ubicación aleatoria dentro del área de juego
const setCamaRandomPosition = () => {
    const { randomX, randomY } = getRandomPosition(imgCamaViejon)
    imgCamaViejon.style.position = "absolute"
    imgCamaViejon.style.left = `${randomX}px`
    imgCamaViejon.style.top = `${randomY}px`
}

// Llama a la función al cargar la página para posicionar la cama
window.onload = () => {
    setCamaRandomPosition()
}

// Función para verificar si imgViejon está dentro del rango de imgCamaViejon
const checkCollision = () => {
    const viejonRect = imgViejon.getBoundingClientRect()
    const camaRect = imgCamaViejon.getBoundingClientRect()

    // Definimos un rango adicional para la colisión (puedes ajustarlo)
    return (
        viejonRect.left < camaRect.right &&
        viejonRect.right > camaRect.left &&
        viejonRect.top < camaRect.bottom &&
        viejonRect.bottom > camaRect.top
    )
}

const recognition = new webkitSpeechRecognition()
recognition.interimResults = false // Resultados parciales desactivados
recognition.lang = "es-ES"
recognition.maxAlternatives = 1

// Función para verificar los límites dentro del contenedor
const checkBounds = () => {
    const imgWidth = imgViejon.offsetWidth
    const imgHeight = imgViejon.offsetHeight
    const containerWidth = gameArea.offsetWidth
    const containerHeight = gameArea.offsetHeight

    // Limitar posición horizontal
    if (posX < 0) posX = 0 // No salir por la izquierda
    if (posX + imgWidth > containerWidth) posX = containerWidth - imgWidth // No salir por la derecha

    // Limitar posición vertical
    if (posY < 0) posY = 0 // No salir por arriba
    if (posY + imgHeight > containerHeight) posY = containerHeight - imgHeight // No salir por abajo
}

document.addEventListener('keydown', (event) => {

    event.preventDefault()

    var keyValue = event.key;

    if (keyValue == " ") {
        btnStart.disabled = true
        btnStart.textContent = "Procesando..."
        btnStart.className = "btn-danger"

        recognition.start()
    }
    
    // Actualiza las posiciones primero
    switch (keyValue) {
        case "w": {
            posY -= step;
            break;
        }
        case "s": {
            posY += step;
            break;
        }
        case "a": {
            posX -= step;
            break;
        }
        case "d": {
            posX += step;
            break;
        }
    }

    // Verifica los límites antes de aplicar el movimiento
    checkBounds();

    // Aplica la nueva posición después de verificar los límites
    imgViejon.style.transform = `translate(${posX}px, ${posY}px)`;

    soundEffect.currentTime = 0; // Reinicia el sonido
    soundEffect.play();

    if (checkCollision()) {
        imgViejonDormido.style.position = "absolute";
        imgViejonDormido.style.left = imgCamaViejon.style.left;
        imgViejonDormido.style.top = imgCamaViejon.style.top;

        imgViejon.style.display = "none";
        imgCamaViejon.style.display = "none";
        imgViejonDormido.style.display = "block";
        soundVictory.play();
    }
}, false);

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    resultText.textContent = `Resultado: ${transcript}`;

    let moved = false; // Variable para detectar si se ha movido el personaje

    // Mueve el viejon según el comando de voz
    if (transcript.includes("arriba")) {
        posY -= step;
        moved = true;
    } else if (transcript.includes("abajo")) {
        posY += step;
        moved = true;
    } else if (transcript.includes("izquierda")) {
        posX -= step;
        moved = true;
    } else if (transcript.includes("derecha")) {
        posX += step;
        moved = true;
    }

    // Si se ha movido, reproduce el sonido
    if (moved) {
        soundEffect.currentTime = 0; // Reinicia el sonido para que se reproduzca de nuevo
        soundEffect.play();
    }

    checkBounds(); // Verifica los límites

    // Aplica la nueva posición a imgViejon usando transform (coherente con el teclado)
    imgViejon.style.transform = `translate(${posX}px, ${posY}px)`;

    if (checkCollision()) {
        imgViejonDormido.style.position = "absolute";
        imgViejonDormido.style.left = imgCamaViejon.style.left;
        imgViejonDormido.style.top = imgCamaViejon.style.top;

        imgViejon.style.display = "none";
        imgCamaViejon.style.display = "none";
        imgViejonDormido.style.display = "block";
        soundVictory.play();

    }   
}


recognition.onend = () => {
    btnStart.disabled = false
    btnStart.textContent = "Iniciar"
    btnStart.className = "btn-success"
}

// Evento para manejar errores
recognition.onerror = (event) => {
    resultText.textContent = `Error: ${event.error}`
}

btnStart.addEventListener("click", () => {
    btnStart.disabled = true
    btnStart.textContent = "Procesando..."
    btnStart.className = "btn-danger"

    recognition.start()
})