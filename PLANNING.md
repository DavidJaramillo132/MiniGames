# Planning Plataforma de Minijuegos

## 1. Vision del producto

Construir una plataforma de minijuegos competitiva, moderna y muy visual donde los jugadores puedan entrar rapido, elegir un juego, competir contra otras personas en tiempo real y seguir su progreso con estadisticas claras, rankings y recompensas visibles.

La experiencia debe sentirse:

- Rapida para entrar a jugar
- Social y competitiva
- Clara en mobile y desktop
- Mas cercana a una plataforma de esports casual que a una web de utilidades

## 2. Pilar principal de diseno

El diseno debe ser una prioridad del producto, no una capa final.

Direccion visual propuesta:

- Estetica arcade moderna
- Fondos con profundidad, gradientes y luces suaves
- Tarjetas grandes para juegos y modos
- Mucha jerarquia visual en rankings, estados de partida y progreso
- Colores por juego para crear identidad propia
- Motion sutil en hover, matchmaking, victoria y cambio de turno

Objetivo visual:

- Que la landing invite a jugar en menos de 5 segundos
- Que cada juego se sienta como una "arena" propia
- Que las estadisticas motiven a volver

## 3. Juegos iniciales

### TicTacToe

- 1v1 en tiempo real
- Sistema de salas privadas y publicas
- Revancha rapida
- Historial de partidas
- Elo o puntuacion competitiva simple

### Trivia / Quiz en tiempo real

- 1v1 o salas multijugador
- Preguntas por categorias
- Tiempo limite por ronda
- Puntos por velocidad y precision
- Ranking diario, semanal y global

### Memory / Parejas

- 1v1 por turnos o por tiempo
- Tableros con distintos niveles de dificultad
- Bonus por racha
- Modo ranked y casual
- Estadisticas de precision y tiempo medio

## 4. Modos de juego

- Casual: entrar rapido sin presion competitiva
- Ranked: afecta ranking, elo y division
- Privado: sala con codigo para amigos
- Evento: torneos, desafios diarios o temporadas

## 5. Estructura de paginas

### Landing / Home publica

Objetivo:
Presentar la marca, los juegos y el valor competitivo.

Secciones:

- Hero potente con CTA "Jugar ahora"
- Preview visual de los 3 juegos
- Estadisticas globales en vivo
- Explicacion de como funciona
- Ranking destacado
- Beneficios de crear cuenta

Notas de diseno:

- Tipografia grande y atrevida
- Fondo con atmosfera arcade
- Cards de juegos con color propio
- Animaciones de entrada cuidadas

### Dashboard del jugador

Objetivo:
Dar una vista general del progreso y accesos rapidos.

Bloques:

- Perfil resumido
- Ranking actual
- Historial reciente
- Juegos favoritos
- Misiones o retos diarios
- CTA para seguir jugando

### Lobby / Seleccion de juego

Objetivo:
Elegir rapido un juego y modo.

Bloques:

- Grid de juegos
- Filtros por modo
- Estado de jugadores en linea
- Salas activas
- Amigos conectados

### Pagina por juego

Objetivo:
Convertirse en el "hub" de cada juego.

Bloques:

- Banner del juego
- Modos disponibles
- Reglas rapidas
- Ranking especifico
- Estadisticas personales
- Lista de salas / boton crear sala

### Sala / Matchmaking

Objetivo:
Hacer clara la espera y la preparacion antes de jugar.

Bloques:

- Estado de jugadores listos
- Codigo de sala
- Chat o mensajes rapidos
- Configuracion basica
- Confirmacion visual de inicio

### Pantalla de partida

Objetivo:
Maxima claridad y tension competitiva.

Bloques base:

- Marcador superior
- Estado del turno o ronda
- Timer visible
- Area principal del juego
- Panel lateral con jugadores y stats
- Feedback fuerte en victoria, derrota o empate

### Pagina de estadisticas

Objetivo:
Volver el progreso tangible y adictivo.

Bloques:

- Win rate
- Partidas jugadas
- Racha maxima
- Tiempo medio por partida
- Precision o rendimiento por juego
- Evolucion en ranking

### Leaderboard

Objetivo:
Reforzar la competencia entre jugadores.

Bloques:

- Top global
- Top semanal
- Top por juego
- Filtros por amigos / region
- Posicion personal destacada

## 6. Sistema de identidad por juego

Cada juego debe tener su propia micro identidad visual:

- TicTacToe: minimal, geometrico, contrastes limpios
- Trivia: energia, color, ritmo y timers muy visibles
- Memory: mas dinamico, ludico y con enfasis en cartas y combos

Esto ayuda a que la plataforma se sienta variada sin perder coherencia.

## 7. Sistema de estadisticas

### Globales

- Partidas totales
- Victorias y derrotas
- Win rate
- Tiempo total jugado
- Ranking general
- Racha actual

### Por juego

#### TicTacToe

- Win rate
- Aperturas mas usadas
- Tiempo medio por jugada
- Empates
- Racha de victorias

#### Trivia

- Precision de respuestas
- Tiempo medio de respuesta
- Categoria mas fuerte
- Puntos medios por partida
- Mejor racha de aciertos

#### Memory

- Parejas encontradas por minuto
- Precision de intentos
- Tiempo medio de finalizacion
- Mejor combo
- Nivel de dificultad mas jugado

## 8. Competencia entre jugadores

Funciones clave:

- Matchmaking rapido
- Salas privadas con codigo
- Sistema de amigos a futuro
- Ranking por temporadas
- Historial de enfrentamientos
- Recompensas cosmeticas o insignias

Sistemas recomendados:

- Elo global ligero para lanzamiento
- Elo por juego en fase 2
- Ligas visuales: Bronce, Plata, Oro, Platino

## 9. Roadmap por fases

### Fase 1 - Base jugable y visual

- Landing atractiva
- Registro y login
- Lobby general
- TicTacToe online funcional
- Leaderboard inicial
- Perfil simple con estadisticas basicas

### Fase 2 - Expansion de contenido

- Trivia en tiempo real
- Memory / Parejas
- Salas privadas y publicas mas robustas
- Historial de partidas
- Dashboard completo
- Estadisticas por juego

### Fase 3 - Capa competitiva

- Ranked formal
- Elo por juego
- Temporadas
- Insignias y logros
- Mejor matchmaking
- Retos diarios y semanales

### Fase 4 - Retencion y comunidad

- Amigos
- Invitaciones directas
- Torneos
- Notificaciones
- Recompensas visuales

## 10. Prioridades UX

- Entrar a una partida en pocos clics
- Nunca perder claridad sobre turno, timer o estado
- Hacer muy visibles progreso, ranking y recompensas
- Mantener consistencia visual entre cliente, lobby y partida
- Diseñar primero mobile responsive y luego escalar a desktop

## 11. Recomendaciones tecnicas ligadas al diseno

- Definir tokens visuales globales: color, radios, sombras, espaciado, tipografia
- Crear variantes visuales reutilizables para cards, badges, buttons y panels
- Usar SignalR para eventos visuales en tiempo real
- Preparar estructura para leaderboards y stats por juego desde backend
- Separar layout general de layout por juego

## 12. Alineacion con la arquitectura actual

La base actual del proyecto ya tiene una estructura bastante compatible con la plataforma propuesta. No se parte desde cero: ya existe una separacion razonable entre catalogo de juegos, salas, partidas, movimientos y estadisticas.

### Services actuales

#### RoomService

Responsabilidad actual:

- Crear salas
- Listar salas activas
- Buscar salas por codigo o id
- Agregar jugadores a una sala
- Quitar jugadores por conexion
- Borrar salas vacias
- Actualizar estado de la sala

Como encaja en la vision:

- Es la base del lobby
- Soporta matchmaking inicial y salas privadas
- Permite construir la pantalla de espera antes de jugar

Evolucion recomendada:

- Soportar capacidad variable por juego
- Permitir filtros por modo de juego
- Guardar configuraciones de sala
- Exponer mejor informacion para UI competitiva y social

#### MatchService

Responsabilidad actual:

- Iniciar una partida
- Registrar movimientos
- Finalizar una partida

Como encaja en la vision:

- Es el nucleo del historial competitivo
- Permite persistir la partida y luego alimentar estadisticas

Evolucion recomendada:

- Guardar metadata especifica por juego
- Soportar rondas y estados mas complejos para Trivia y Memory
- Registrar eventos especiales, tiempos y resultados detallados

#### LeaderboardService

Responsabilidad actual:

- Consultar leaderboard por juego
- Consultar stats de un jugador
- Actualizar victorias, derrotas, empates y ELO

Como encaja en la vision:

- Ya sostiene la capa competitiva inicial
- Es la base del dashboard, ranking y perfil del jugador

Evolucion recomendada:

- Agregar estadisticas avanzadas por juego
- Soportar temporadas
- Separar ranking global, semanal y por juego
- Hacer mas flexible la logica de puntuacion

#### GameCatalogService

Responsabilidad actual:

- Listar juegos habilitados
- Buscar juego por slug

Como encaja en la vision:

- Es la base del lobby principal y de la landing
- Permite presentar juegos disponibles de forma dinamica

Evolucion recomendada:

- Agregar metadatos visuales y de presentacion
- Permitir estados como "nuevo", "en beta", "evento"
- Registrar configuraciones por juego y por modo

### Models actuales

#### Room

Representa la sala jugable y hoy ya contiene:

- Juego asociado
- Nombre
- Codigo de sala
- Estado
- Capacidad
- Jugadores actuales
- Creador

Valor para el producto:

- Es el modelo principal para lobby, sala privada y matchmaking visible

#### RoomPlayer

Representa la participacion de un jugador dentro de una sala:

- Usuario
- Conexion
- Si es host
- Entrada y salida

Valor para el producto:

- Es clave para presencia en tiempo real
- Permite construir vista de jugadores listos, host y actividad

#### Match

Representa la partida persistida:

- Sala asociada
- Inicio
- Fin
- Ganador
- Resultado

Valor para el producto:

- Es la base del historial, resultados y estadisticas posteriores

#### Move

Representa acciones dentro de la partida:

- Numero de turno
- Jugador
- Celda
- Simbolo
- Fecha

Valor para el producto:

- Encaja perfecto con TicTacToe
- Necesitara evolucion por tipo de evento para Trivia y Memory

#### PlayerStat

Representa el progreso competitivo por juego:

- Wins
- Losses
- Draws
- Elo

Valor para el producto:

- Es el nucleo del leaderboard y del perfil competitivo

#### GameCatalog

Representa los juegos disponibles:

- Slug
- Nombre
- Estado habilitado
- Maximo de jugadores

Valor para el producto:

- Permite que la experiencia del lobby sea dinamica y escalable

#### User

Representa al jugador autenticado:

- Username
- PasswordHash
- Email
- DisplayName

Valor para el producto:

- Sostiene identidad, perfil y futura capa social

### Lectura general de la arquitectura

La arquitectura actual tiene una forma bastante correcta para un MVP competitivo:

- `GameCatalog` define que se puede jugar
- `Room` y `RoomPlayer` controlan la entrada multijugador
- `Match` y `Move` registran lo que paso en la partida
- `PlayerStat` transforma resultados en progreso visible

Eso significa que el producto ya tiene el esqueleto correcto para crecer.

### Lo que ya esta bien resuelto

- Separacion por dominio en servicios
- Modelos simples y claros
- Persistencia cercana a SQL con Dapper
- Base funcional para ranking y salas
- Estructura adecuada para tiempo real

### Lo que habria que expandir

- Mas datos visuales y configurables por juego
- Modelado especifico para Trivia y Memory
- Estadisticas mas ricas que solo wins/losses/elo
- Estados de partida mas detallados
- Soporte mas fuerte para modos, temporadas y eventos

## 13. Impacto en las fases del roadmap

### Fase 1 - Base jugable y visual

Backend que ya ayuda:

- `GameCatalogService`
- `RoomService`
- `MatchService`
- `LeaderboardService`

Foco:

- Aprovechar la estructura actual para pulir landing, lobby, TicTacToe y leaderboard
- No hace falta rehacer la arquitectura, sino ordenarla alrededor de la experiencia

### Fase 2 - Expansion de contenido

Backend a extender:

- `Match` y `Move` para soportar eventos de Trivia y Memory
- `PlayerStat` para guardar precision, tiempo y rendimiento por juego
- `Room` para modos y configuraciones nuevas

Foco:

- Mantener la misma arquitectura y especializarla por juego

### Fase 3 - Capa competitiva

Backend a fortalecer:

- `LeaderboardService` para temporadas, divisiones y ranking historico
- Nuevas tablas o estructuras para logros, retos y recompensas

Foco:

- Convertir stats basicas en un sistema de progresion visible

### Fase 4 - Retencion y comunidad

Backend a agregar:

- Relaciones de amistad
- Invitaciones
- Notificaciones
- Historial social de enfrentamientos

Foco:

- Expandir sobre la identidad del jugador, no solo sobre la partida

## 14. Entregables de diseno recomendados

- Mapa del sitio
- Wireframes de las paginas principales
- UI kit base
- Sistema de colores por juego
- Prototipo de la landing
- Prototipo de dashboard
- Prototipo de partida para cada juego

## 15. Proxima ejecucion sugerida

Orden recomendado para construir:

1. Definir sistema visual base
2. Redisenar landing y lobby
3. Unificar dashboard, leaderboard y perfil
4. Refinar experiencia de TicTacToe
5. Agregar Trivia en tiempo real
6. Agregar Memory / Parejas
7. Profundizar estadisticas y ranked

## 16. Resultado esperado

La plataforma debe sentirse competitiva, moderna y divertida desde la primera pantalla. El usuario no solo entra a "jugar un minijuego", sino a progresar, compararse con otros y volver por una experiencia visualmente atractiva y social.
