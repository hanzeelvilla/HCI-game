const btnStart = document.getElementById("btnStart")
const resultText = document.getElementById("result")

let posX = 0; 
let posY = 0; 
const step = 20; 

const recognition = new webkitSpeechRecognition()
recognition.interimResults = false // Resultados parciales desactivados
recognition.lang = "es-ES"
recognition.maxAlternatives = 1

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;  // Captura el texto reconocido
    resultText.textContent = `Resultado: ${transcript}`

    // Lógica para mover la imagen según el comando de voz
    if (transcript.includes("arriba")) {
        posY -= step;
    } else if (transcript.includes("abajo")) {
        posY += step;
    } else if (transcript.includes("izquierda")) {
        posX -= step;
    } else if (transcript.includes("derecha")) {
        posX += step;
    }

    // Aplica la nueva posición a la imagen
    imgViejon.style.transform = `translate(${posX}px, ${posY}px)`;
}

recognition.onend = () => {
    btnStart.disabled = false
    btnStart.textContent = "Iniciar"
    btnStart.className = "btn-success"
};

// Evento para manejar errores
recognition.onerror = (event) => {
    resultText.textContent = `Error: ${event.error}`
};

btnStart.addEventListener("click", ()=>{
    btnStart.disabled = true
    btnStart.textContent = "Procesando..."
    btnStart.className = "btn-danger"

    recognition.start()
})