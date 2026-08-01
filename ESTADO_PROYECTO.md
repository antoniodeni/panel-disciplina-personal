# Estado del proyecto

Fecha de cierre: 1 de agosto de 2026.

## Terminado

- Aplicacion diaria funcional con inicio, agenda, seis areas, habitos, cierre,
  balances semanal y mensual, plan y ajustes.
- Acceso privado con Supabase y datos separados por cuenta.
- Sincronizacion entre dispositivos con estado visible, reintento al recuperar
  Internet y combinacion conservadora de dias locales y remotos.
- Importacion unica de los datos guardados antes de crear la cuenta.
- Exportacion y restauracion de copias de seguridad.
- Esquema de datos versionado y migracion de las copias anteriores.
- Resumen diario copiable para Kiwi desde el cierre del dia.
- Adaptacion para movil y ordenador.
- Aplicacion web instalable y funcionamiento basico sin conexion.
- Publicacion independiente en GitHub Pages:
  https://antoniodeni.github.io/panel-disciplina-personal/
- Registro diario de animo, energia, descanso percibido y principal freno.
- Balances que excluyen dias vacios y tareas descartadas o trasladadas.
- Alimentacion medida mediante habitos, preparacion y comidas combinadas.
- Balance semanal y mensual con recomendacion accionable: detecta el pilar mas
  atrasado, considera el freno repetido y propone su version minima.
- La recomendacion puede convertirse en una tarea principal para la agenda del
  dia siguiente sin duplicarla.

## Limitaciones actuales

- La cuenta administradora esta activa y el acceso esta probado en PC y movil.
- El correo gratuito de Supabase tiene un limite bajo. No se invitaran amigos
  hasta configurar SMTP propio y probar el recorrido completo.
- Falta probar aislamiento, revocacion y recuperacion con una segunda cuenta.
- La sincronizacion usa un documento por usuario y resolucion por fecha. Es
  suficiente para la prueba personal, pero una beta mayor debera separar los
  registros por tablas y eventos.
- El sitio y el repositorio siguen siendo publicos, aunque los datos personales
  y el acceso a la aplicacion estan protegidos.

## Siguiente paso acordado

Usar la aplicacion con la cuenta de Antonio en PC y movil y comprobar durante
una semana si la recomendacion propone ajustes utiles. El siguiente trabajo
externo es configurar SMTP propio, crear una segunda cuenta de prueba y
verificar acceso, aislamiento, revocacion y recuperacion antes de abrir la beta.

Durante al menos siete dias se validara el ciclo diario sin añadir dietas con
IA, agentes, musica, notificaciones ni automatizaciones. Los cambios se
decidiran a partir de fallos y datos reales de uso.

## Historial anterior

La reorganizacion principal de la interfaz se completo el 30 de julio de 2026:

1. Dashboard de inicio con solo la informacion esencial del dia.
2. Menu principal visible con acceso directo a cada area.
3. Vistas separadas para Inicio, Agenda, Habitos, Areas, Cierre, Semana, Plan
   y Ajustes.
4. Navegacion sin desplazamientos largos ni contenido amontonado.
5. Prueba completa en PC y movil.
6. Publicacion de la nueva version.

La aplicacion sera el registro principal diario de Antonio. Durante catorce dias
se validara el uso real sin ampliar mas modulos. Kiwi recibira el resumen diario
en modo lectura y no modificara los registros.

Tras esa validacion se creara la fase de cuenta personal, sincronizacion y beta
privada:

1. Proyecto independiente de Supabase.
2. Acceso inicial cerrado solo para Antonio.
3. Base de datos con datos separados por usuario.
4. Migracion segura de los datos locales existentes.
5. Sincronizacion entre movil y PC.
6. Recuperacion de acceso y copias de seguridad.
7. Invitaciones administradas por Antonio para amigos probadores.
8. Roles separados: administrador, usuario de prueba y asesor de solo lectura.
9. Registro de sugerencias dentro de la beta privada.

## Motor de progreso

Primera version completada el 30 de julio de 2026:

1. Objetivo, frecuencia semanal y minimo definidos para los seis pilares.
2. Dashboard con estado diario y progreso semanal por pilar.
3. Un dia sin registros aparece como "Sin evaluar", no como fracaso.
4. Alimentacion dispone de un modulo propio.
5. Preparacion del plan, lista de la compra y compra realizada medibles.
6. Lista de productos con estado comprado y disponible.
7. Comidas diarias con resultado cumplido, parcial o no cumplido.
8. Alternativa minima para salvar el dia.
9. Metricas de preparacion, disponibilidad, comidas y objetivo semanal.
10. Migracion de los datos anteriores conservada.

Las pruebas funcionales verifican que los productos, las comidas y sus metricas
se actualizan correctamente. El siguiente paso es usar la aplicacion diariamente,
corregir el flujo segun el uso real y despues decidir que modulo merece crecer.

## Agenda de trabajo del 30 de julio de 2026

1. Copia de la version anterior guardada.
2. Dashboard de inicio definido.
3. Menu reorganizado.
4. Agenda y habitos separados.
5. Selector directo para las seis areas creado.
6. Datos y funciones anteriores conservados.
7. Pruebas de logica y estructura superadas.
8. Revision visual en escritorio y movil superada sin desbordamiento horizontal.
9. Navegacion, accesos directos y regreso del navegador comprobados.
10. Pendiente: validacion de uso diario con Antonio.
11. Navegacion movil trasladada a la parte superior con menu de secciones completo.
12. Dashboard de accion reorganizado: estado, foco y tres acciones principales arriba.
13. Tarjetas de pilares compactadas para mostrar hoy y semana sin texto repetido.
14. Calendario reducido a una tarjeta de fecha y agenda principal con hora y prioridades.
15. Menu unificado arriba a la izquierda, saludo compacto y porcentajes de los seis pilares visibles al abrir.
16. Alerta de accion basada en prioridad y pilar mas debil; agenda separada en Ahora, Despues y Hecho.
17. Métricas corregidas contra acciones previstas, logo Línea Constructiva integrado y paleta adaptada.
18. Diseño móvil simplificado: cabecera sin saludo, logo visible, calendario compacto y jerarquía verde y naranja.
19. Inicio ordenado por acción: siguiente paso, estado, agenda, pilares y herramientas secundarias; botones auditados.
20. Bloque “Ahora” retirado del inicio; el semáforo y los seis pilares ocupan la primera prioridad visual.
21. Balance ampliado con selector de 7 dias y mes actual, cumplimiento medio,
    dias registrados, tareas, cierres e historial del periodo.
22. Progreso historico de pilares corregido para evaluar cada dia con su propia
    frecuencia programada.
23. Pilares sin acciones registradas muestran “Sin evaluar”; los porcentajes
    parciales solo aparecen cuando existe una accion marcada.
24. Cumplimiento y Tareas del dashboard son interactivos y muestran el detalle
    pendiente con acceso directo a Rutina o Agenda.
25. La vista de areas permite filtrar un solo pilar o volver a ver las seis
    areas mediante el selector Todas.
26. La beta privada queda definida con invitaciones por correo, contrasena
    elegida por cada usuario, datos aislados por `user_id` y administracion de
    accesos por Antonio. La integracion real queda pendiente de crear el
    proyecto de backend y migrar los datos locales con pruebas de aislamiento.
27. Proyecto Supabase creado para Linea Constructiva. La app local ya incluye
    puerta de acceso, solicitud de cuenta, recuperacion de contrasena, cierre de
    sesion y almacenamiento local separado por usuario. Pendiente: ejecutar el
    esquema SQL, activar la primera cuenta administradora, verificar sincronizacion
    y publicar solo despues de probar dos cuentas aisladas.
28. Flujo de beta privada simplificado: se retiro el registro abierto de la app
    publica. Solo entran cuentas creadas y activadas por Antonio; se mantiene la
    recuperacion de contrasena. La version publica fue actualizada y verificada.
29. Recuperacion de contrasena completada: los enlaces de Supabase abren una
    pantalla para elegir y confirmar una nueva clave antes de entrar en la app.
    Pruebas de logica, estructura y compilacion superadas.
30. Punto de pausa: la cuenta administradora ya existe y esta activa, pero la
    creacion de su contrasena esta detenida por el limite temporal de correos
    del proveedor gratuito de Supabase. Al retomar: esperar a que se libere el
    limite, solicitar una sola recuperacion, crear la contrasena y comprobar
    acceso desde PC y movil. Antes de beta con amigos: configurar SMTP propio
    y crear un panel sencillo de administracion de usuarios.
31. Mejora del 1 de agosto: datos antiguos importados a la cuenta, sincronizacion
    visible con reintento, proteccion frente a cachear respuestas de Supabase,
    dias vacios fuera de balances, tareas activas bien contabilizadas,
    Alimentacion combinada, registro subjetivo diario, menu agrupado y enlaces
    de invitacion preparados para que cada usuario elija su contrasena. Pruebas
    de logica, estructura, compilacion y revision visual movil/escritorio
    superadas. La contraseña de Antonio y el acceso en PC y movil ya estan
    comprobados; queda pendiente el SMTP propio y una segunda cuenta de prueba.
32. Motor de revision accionable: el balance identifica el pilar con mayor
    distancia respecto a su objetivo, explica la lectura con los dias
    registrados y el freno mas repetido, y permite añadir la version minima a
    la agenda de mañana. El guardado entre dias tambien actualiza correctamente
    las fechas modificadas para proteger la sincronizacion.
33. Las seis areas pasan de ser solo una lista de verificaciones a modulos de
    accion: cada una muestra foco del dia, primer paso, minimo de rescate,
    avance semanal y acceso al balance. Los cinco pilares generales pueden
    añadir su minimo como tarea principal sin duplicados; Alimentacion abre su
    plan especializado. Tambien se fijo que el objetivo semanal no dependa del
    periodo mensual que este abierto en la vista de balances.

## Decision de arquitectura

Las proximas aplicaciones compartiran en el futuro una identidad y una base
comun de usuarios, permisos, objetivos, tareas y eventos. Cada aplicacion sera
un modulo independiente. No se tocara Engranaje Sur sin autorizacion expresa.
