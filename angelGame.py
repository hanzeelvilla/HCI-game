import pygame

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

ANCHO = 1000
ALTO = 800
VENTANA = pygame.display.set_mode([ANCHO, ALTO])

jugando = True

cubo = Cubo(100,100)

def gestionar_teclas(teclas):
    if teclas[pygame.K_w]:
        cubo.y -= cubo.velocidad
    if teclas[pygame.K_s]:
        cubo.y += cubo.velocidad
    if teclas[pygame.K_a]:
        cubo.x -= cubo.velocidad
    if teclas[pygame.K_d]:
        cubo.x += cubo.velocidad

while jugando:
    eventos = pygame.event.get()
    teclas = pygame.key.get_pressed()

    gestionar_teclas(teclas)

    for evento in eventos:
        if evento.type == pygame.QUIT:
            jugando = False
    
    VENTANA.fill("black")
    cubo.dibujar(VENTANA)
    pygame.display.update()

quit()