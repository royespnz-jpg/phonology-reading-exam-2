# Phonology Reading Exam II

Un segundo examen de lectura en voz alta, aparte del primero: otra página, otra planilla y otra carpeta en Drive.
El reloj cuenta el tiempo para preparar, suena un beep, el micrófono se enciende solo, graba hasta que se acaba el
tiempo y pasa a la lectura siguiente. Cada grabación va a tu Google Drive y a una planilla donde ponés la nota.

## El examen

Cuatro lecturas, cada una con **40 segundos para preparar** y **50 segundos para leer**. Vale el **5 %** de la nota:
**1 punto por cada palabra en negrita**, **80 puntos** en total (20 por lectura). La introducción del examen se lo dice a
los estudiantes.


| Lectura | Qué evalúa |
| --- | --- |
| 1 · Vowels | **Minimal pairs** de vocales, entre los contrastes más difíciles para hispanohablantes |
| 2 · Consonants | **Minimal pairs** de consonantes, entre los contrastes más difíciles para hispanohablantes |
| 3 · Connected speech | Solo linking: los 5 tipos, 4 veces cada uno (cada oración combina dos tipos distintos) |
| 4 · Word stress | 11 oraciones: 9 con dos targets y 2 con uno (20 puntos). Mezcla los tipos de acento de *Accurate English* cap. 6 y 7 que eligió el docente: sufijos, phrasal verbs, compuestos, pares sustantivo–verbo, *-ate*, *-ically*, familias de palabras |

- **Oraciones numeradas y sueltas**, con los targets **en negrita** (en la planilla, en MAYÚSCULAS): 10 oraciones de dos
  targets en las tres primeras lecturas, y 11 en *Word stress* (nueve de dos y dos de uno).
- Un **minimal pair** son dos palabras que se diferencian en un solo sonido. En *Vowels* y *Consonants* cada oración
  tiene las dos palabras del par: seis contrastes elegidos por el docente en cada hoja, y el más difícil de cada una
  va en cinco oraciones. Donde el inglés no tiene un par exacto para un contraste, se usa el par más cercano.
- **Nada se repite**: ninguna palabra target aparece dos veces, y ninguna viene del primer examen.
- **Cabe en los 50 segundos**: cada lectura tiene unas 120–130 sílabas, unos 40 segundos a ritmo parejo de estudiante,
  así queda tiempo de sobra.
- **Las oraciones aparecen** recién cuando empieza el tiempo de preparación (“Begin preparing now”).
- **Qué evalúa cada target no está en la página ni en este repositorio** (que es público): solo en la copia del script
  que pega el docente (hoja *Readings* de la planilla). Sale de un archivo privado (`key/`, fuera del repositorio).
- **En la página Teacher** el docente escribe su **clave** (`TEACHER_KEY`, en la parte 2 de su copia del script) y la
  página le pide al script qué evalúa cada target, que aparece debajo de cada oración. Sin esa clave el script no lo
  da, y la clave tampoco está en este repositorio. *Lock and leave* lo vuelve a ocultar.

Las consignas se oyen (voz del navegador) y se leen en pantalla. Son unos 8 minutos (6 de relojes).

- **El micrófono** se pide una vez, en la prueba de micrófono antes de empezar. Después graba solo en cada lectura.
- **Nada se pierde**: cada grabación se guarda en el navegador y se envía enseguida; si se corta internet, se reintenta.
- **Si se recarga la página**, el examen sigue desde la lectura en la que estaba.
- **No se mezcla con el primer examen**: guarda su avance y su planilla con otros nombres, aunque los dos estén en
  `royespnz-jpg.github.io`, y no acepta el script del primer examen.

## Instalación

1. **La planilla y el script.** Creá una planilla **nueva** (<https://sheets.new>) → **Extensiones → Apps Script** →
   borrá lo que haya → pegá las 4 partes del script **que te mandaron aparte** (la copia del docente, con qué evalúa cada
   target; las de [`google-apps-script/partes/`](google-apps-script/partes) son iguales pero sin eso) en orden: la parte 1
   en `Código.gs` y cada una de las otras en un archivo nuevo (**+ → Secuencia de comandos**). Son 4 partes de menos de
   120 líneas; cada una termina con `/* ── fin de la parte N de 4 ── */`. (O pegá
   [`google-apps-script/Code.gs`](google-apps-script/Code.gs) entero si el editor te deja.) Guardá → elegí **`setup`**
   → **▶ Ejecutar** → aceptá los permisos. Crea las hojas *Exams*, *Responses*, *Rubric* y *Readings*, y la carpeta
   *Phonology Reading Exam II — Recordings* en tu Drive.
2. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: **Yo** · Quién tiene acceso: **Cualquier
   persona** → copiá la URL que termina en `/exec`.
3. **En el examen**, la URL va en [`js/config.js`](js/config.js) (`SCRIPT_URL`), o abrí la página **Teacher**
   (`…/#teacher`, código **1234**): pegá la URL, *Test*, *Save*. Ahí está el link para los estudiantes y un link para
   probar el examen.

### Qué guarda la planilla

| Hoja | Qué tiene |
| --- | --- |
| **Exams** | Una fila por estudiante: inicio, nombre, grupo, estado, lecturas enviadas, fin, veces que salió de la página, reinicios, **nota total** (suma automática) y la carpeta de sus audios |
| **Responses** | Una fila por lectura: el texto (targets en MAYÚSCULAS), segundos, **▶ Listen** (el audio en tu Drive), **Score (0–3)** y *Comments* |
| **Rubric** | Criterios de 0 a 3 para cada lectura, según cuántos de los 20 targets están bien (3: 18 o más · 2: 13–17 · 1: 7–12) |
| **Readings** | Las oraciones, sus targets y qué evalúa cada uno (solo en tu planilla) |

Los alumnos solo escriben su **nombre completo**. Para separar por curso, agregá `?g=` al link (por ejemplo
`…/?g=10-1`).

## Vista previa del docente (código 1234)

El link **Teacher** de la página de inicio pide el código **1234** ([`js/config.js`](js/config.js), `TEACHER_CODE`):
la página Teacher (script, link para los alumnos, las oraciones) y la vista previa (`…/#preview`) con todos los pasos
del examen, sin grabar ni mandar nada.

## Cambiar las oraciones

Están en [`js/format.js`](js/format.js) (`READINGS`): cada oración es `{ text }`, con los dos targets entre `**`. Qué
evalúa cada target va en el archivo privado `key/key.mjs` (fuera del repositorio), en el mismo orden. Después:

```bash
npm run gs        # copia las oraciones a Code.gs (y a la copia privada si está key/) y arma las partes
npm run version   # versión nueva de los archivos, así una recarga normal trae los cambios
npm test          # negritas, nada repetido, que cada lectura entre en 50 s (y la clave, si está key/)
```

y en Apps Script pegá el código nuevo, corré `setup` otra vez y hacé **Implementar → Administrar implementaciones → ✏ →
Nueva versión**.

## Probarlo

```bash
npm start     # http://localhost:8080   ( …/?quick=1 acorta los relojes al 10 % )
npm test
```

Sin dependencias ni build: HTML, CSS y JavaScript. Funciona en Chrome, Edge, Firefox y Safari (también en el celular);
conviene usar auriculares.
