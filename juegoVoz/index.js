const btnStart = document.getElementById("btnStart")
const resultText = document.getElementById("result")
const gameArea = document.querySelector(".game-area")
const imgViejon = document.getElementById("imgViejon")
const imgCamaViejon = document.getElementById("imgCamaViejon")
const imgViejonDormido = document.getElementById("imgViejonDormido")
const btnReset = document.getElementById("resetBtn");

const soundEffect = new Audio("./sound_effect.mp3")
const soundVictory = new Audio("./victory.mp3")
const soundExplosion = new Audio("./explosion.mp3")

let numMinas = 10
let minas = [] // Arreglo para guardar las minas generadas

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

// Posiciona minas en ubicaciones aleatorias
const setMinasRandomPositions = () => {
    minas = [] // Limpiar minas existentes
    for (let i = 0; i < numMinas; i++) {
        const mina = document.createElement('div')
        mina.classList.add('mina') // Añadir clase para estilos
        gameArea.appendChild(mina)

        let { randomX, randomY } = getRandomPosition(mina)

        // Asegurarse de que la mina no esté en la misma posición que la cama
        const posCama = imgCamaViejon.getBoundingClientRect()
        const posMina = mina.getBoundingClientRect()
        while (
            randomX < posCama.right && randomX + posMina.width > posCama.left &&
            randomY < posCama.bottom && randomY + posMina.height > posCama.top
        ) {
            // Reposicionar si colisiona con la cama
            const newPos = getRandomPosition(mina)
            randomX = newPos.randomX
            randomY = newPos.randomY
        }

        // Establece la posición final de la mina
        mina.style.position = "absolute"
        mina.style.left = `${randomX}px`
        mina.style.top = `${randomY}px`

        minas.push(mina) // Guardar mina en el arreglo
    }
}

// Llama a la función al cargar la página para posicionar la cama
window.onload = () => {
    setCamaRandomPosition()
    setMinasRandomPositions()
}

// Función para verificar si imgViejon está dentro del rango de imgCamaViejon o minas
const checkCollision = (rect1, rect2) => {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    )
}

// Función para verificar colisión con la cama o las minas
const checkCollisions = () => {
    const viejonRect = imgViejon.getBoundingClientRect()
    const camaRect = imgCamaViejon.getBoundingClientRect()

    // Verificar colisión con la cama
    if (checkCollision(viejonRect, camaRect)) {
        return 'cama'
    }

    // Verificar colisión con las minas
    for (let mina of minas) {
        const minaRect = mina.getBoundingClientRect()
        if (checkCollision(viejonRect, minaRect)) {
            return 'mina'
        }
    }
    return null
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

const eventoTeclas = (event) => {

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
    checkBounds()

    // Aplica la nueva posición después de verificar los límites
    imgViejon.style.transform = `translate(${posX}px, ${posY}px)`

    soundEffect.currentTime = 0; // Reinicia el sonido
    soundEffect.play()

    const collision = checkCollisions()

    if (collision === 'cama') {
        imgViejonDormido.style.position = "absolute"
        imgViejonDormido.style.left = imgCamaViejon.style.left
        imgViejonDormido.style.top = imgCamaViejon.style.top

        imgViejon.style.display = "none"
        imgCamaViejon.style.display = "none"
        imgViejonDormido.style.display = "block"
        btnReset.style.display = "block"
        soundVictory.play()
    } else if (collision === 'mina') {
        document.removeEventListener('keydown', eventoTeclas);
        setTimeout(() => {
            alert("Has pisado una mina, el viejón EXPLOTÓ");
        }, 200);
        soundExplosion.play()
        btnReset.style.display = "block";
    }
}

document.addEventListener('keydown', eventoTeclas, false);

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

    const collision = checkCollisions()

    if (collision === 'cama') {
        imgViejonDormido.style.position = "absolute"
        imgViejonDormido.style.left = imgCamaViejon.style.left
        imgViejonDormido.style.top = imgCamaViejon.style.top

        imgViejon.style.display = "none"
        imgCamaViejon.style.display = "none"
        imgViejonDormido.style.display = "block"
        btnReset.style.display = "block"
        soundVictory.play()
    } else if (collision === 'mina') {
        document.removeEventListener('keydown', eventoTeclas);
        setTimeout(() => {
            alert("Has pisado una mina, el viejón EXPLOTÓ");
        }, 200);
        soundExplosion.play()
        btnReset.style.display = "block";
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

btnReset.addEventListener("click", () => {
    posX = 0;
    posY = 0;

    // Restablece la visibilidad de imgViejon y imgCamaViejon
    imgViejon.style.display = "block";
    imgCamaViejon.style.display = "block"; 
    imgViejonDormido.style.display = "none";

    // Restablece la posición inicial de imgViejon usando transform
    imgViejon.style.transform = `translate(${posX}px, ${posY}px)`;

    // Elimina las minas existentes del DOM
    minas.forEach(mina => gameArea.removeChild(mina));
    minas = []; // Limpia el array de minas

    // Reposiciona la cama aleatoriamente
    setCamaRandomPosition();
    setMinasRandomPositions();

    document.addEventListener('keydown', eventoTeclas, false);

    // Oculta el botón de reinicio
    btnReset.style.display = "none";
});