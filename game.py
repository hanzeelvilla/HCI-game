import pygame
import speech_recognition as sr
import threading
import time

# Agrega un temporizador de enfriamiento para evitar llamadas continuas
cooldown = 3  # Tiempo en segundos entre llamadas de voz
last_called = time.time()

pygame.init()

class Cubo:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.ancho = 50
        self.alto = 50
        self.velocidad = 1
        self.color = "red"
        self.rect = pygame.Rect(self.x, self.y, self.ancho, self.alto)
    
    def dibujar(self, ventana):
        self.rect = pygame.Rect(self.x, self.y, self.ancho, self.alto)
        pygame.draw.rect(ventana, self.color, self.rect)
    
    def mover(self, dx, dy):
        self.x = max(0, min(ANCHO - self.ancho, self.x + dx))
        self.y = max(0, min(ALTO - self.alto, self.y + dy))

ANCHO = 1000
ALTO = 800
VENTANA = pygame.display.set_mode([ANCHO, ALTO])
SPEED_BY_VOICE = 50

cubo = Cubo(100, 300)
font = pygame.font.Font(None, 36)
speech_status = ""

r = sr.Recognizer()
recognizing = False

# Función para ejecutar el reconocimiento de voz en un hilo
def recognize_speech():
    global speech_status, recognizing
    recognizing = True
    with sr.Microphone() as source:
        speech_status = "Recording..."
        print("Listening...")
        try:
            audio_text = r.listen(source, timeout=5)  # Escuchar por 5 segundos
            speech_status = "Processing..."
            print("Processing...")
            text = r.recognize_google(audio_text)
            print("You said: " + text)
            mover_cubo_por_voz(text)
        except sr.UnknownValueError:
            speech_status = "Unknown command"
            print("Sorry, I did not get that")
        except sr.RequestError:
            speech_status = "Error connecting to Google Speech Recognition"
            print("Could not request results from Google Speech Recognition")
    recognizing = False

def mover_cubo_por_voz(comando):
    global speech_status
    if "up" in comando.lower():
        cubo.mover(0, -SPEED_BY_VOICE)
        speech_status = "You said UP"
    elif "down" in comando.lower():
        cubo.mover(0, SPEED_BY_VOICE)
        speech_status = "You said DOWN"
    elif "left" in comando.lower():
        cubo.mover(-SPEED_BY_VOICE, 0)
        speech_status = "You said LEFT"
    elif "right" in comando.lower():
        cubo.mover(SPEED_BY_VOICE, 0)
        speech_status = "You said RIGHT"

def gestionar_teclas(teclas):
    global last_called
    current_time = time.time()
    if teclas[pygame.K_w]:
        cubo.mover(0, -cubo.velocidad)
    if teclas[pygame.K_s]:
        cubo.mover(0, cubo.velocidad)
    if teclas[pygame.K_a]:
        cubo.mover(-cubo.velocidad, 0)
    if teclas[pygame.K_d]:
        cubo.mover(cubo.velocidad, 0)
    if teclas[pygame.K_SPACE] and (current_time - last_called) > cooldown and not recognizing:
        last_called = current_time
        threading.Thread(target=recognize_speech).start()
        
# Variable de control para el bucle del juego
jugando = True
clock = pygame.time.Clock()

while jugando:
    eventos = pygame.event.get()
    teclas = pygame.key.get_pressed()

    # Renderizar el texto en pantalla
    header_text = font.render("Press the 'space' key to start talking", True, (255, 255, 255))
    instructions_text = font.render("Use W, A, S, D or voice ('up', 'down', 'left', 'right') to move", True, (255, 255, 255))
    speech_status_text = font.render(speech_status, True, (255, 255, 255)) 

    gestionar_teclas(teclas)

    for evento in eventos:
        if evento.type == pygame.QUIT:
            jugando = False  # Terminar el bucle si el usuario cierra la ventana

    # Limpiar la pantalla y actualizar
    VENTANA.fill("black")
    VENTANA.blit(header_text, (20, 20))
    VENTANA.blit(instructions_text, (20, 50))
    VENTANA.blit(speech_status_text, (20, 100))
    cubo.dibujar(VENTANA)
    
    pygame.display.update()

    # Controlar la velocidad de actualización del bucle
    clock.tick(120)

# Cerrar Pygame correctamente
pygame.quit()
