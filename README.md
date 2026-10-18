# El Feed de Hayek

Simulador de algoritmos de recomendación y conocimiento disperso. Es una red social simulada donde cada persona puede ver cómo un algoritmo forma su burbuja de filtro, y cómo se relaciona eso con la filosofía de Friedrich Hayek.

- **En línea:** https://claude.ai/artifact/UfyErh7UnnFetZGH5qiJSt
- **Sin internet:** doble clic en `index.html`
- **Pantalla para tu puesto en la exposición:** doble clic en `kiosco.html` (ver abajo)

## Pantalla de exhibición (`kiosco.html`)

Para cuando estés en un puesto con tu computadora y la gente pase caminando. Es una sola pantalla dividida en dos mitades, pensada para proyectar o para dejar en un monitor:

- **Izquierda:** un teléfono con la app real **usándose sola**, en bucle. Hace scroll, reacciona con distintos emojis, comenta, comparte y pasa de largo publicaciones de un tema al azar, hasta que su burbuja se cierra. Abajo, un subtítulo explica en vivo qué está pasando y un indicador muestra el porcentaje de burbuja en tiempo real. Cada vuelta elige un tema distinto, así que no se ve repetitiva.
- **Derecha:** «¿Te atreves a probarlo?», el código QR y los tres pasos para escanear.

**Cómo usarla:**
1. Abre `kiosco.html` (doble clic, o desde el mismo servidor que uses para `index.html`).
2. Presiona **F11** en el navegador para pantalla completa.
3. Déjala corriendo. No necesita que la toques ni que esté conectada a internet, salvo para cargar las fuentes y el generador de QR la primera vez.

**Antes de la exposición, actualiza el QR:** abre `kiosco.html` con el Bloc de notas (o cualquier editor de texto) y busca esta línea cerca del final del archivo:

```js
const SITE_URL = 'https://claude.ai/artifact/UfyErh7UnnFetZGH5qiJSt';
```

Cambia la dirección por el enlace de GitHub Pages cuando lo tengas listo, guarda el archivo y vuelve a abrirlo. El QR y el texto de abajo se generan solos a partir de esa línea.

**Si quieres un video en vez de la pantalla en vivo:** deja `kiosco.html` corriendo y grábala con el grabador de pantalla de Windows (**Win + Alt + R**) o con Clipchamp (viene gratis en Windows 11). Es más sencillo y se ve mejor que generar un video con IA, porque es exactamente lo que la gente verá en su teléfono.

## Antes de exponer: activar el enlace público

El enlace está **privado** por ahora. Para que el QR funcione con cualquier persona:

1. Abre el enlace en claude.ai.
2. Usa el menú **Compartir** de la página y activa el acceso público por enlace.
3. Prueba el enlace desde un teléfono que no tenga tu sesión iniciada.

El código QR se agregará más adelante. Si prefieres otro hosting, la carpeta funciona tal cual en cualquier servidor estático (por ejemplo, arrastrándola a Netlify Drop).

## Archivos

| Archivo | Qué contiene |
|---|---|
| `index.html` | Estructura de la app y el texto sobre la filosofía de Hayek |
| `styles.css` | Diseño (modo claro y oscuro, celular y escritorio) |
| `data.js` | Los 12 temas y las 100 publicaciones |
| `app.js` | El algoritmo de recomendación, la lógica de la app y el modo demostración |
| `kiosco.html` | Pantalla dividida para tu puesto en la exposición (app en demostración + QR) |

Las publicaciones se basan en **hechos reales y verificables** (el oro olímpico de Adriana Ruano, el telescopio James Webb, las remesas de 2024, etc.). Las **cuentas son ficticias**: no se imitan medios ni personas reales. Las publicaciones de política son opiniones ficticias que representan dos posturas.

## Secciones

| Sección | Qué muestra | Concepto de Hayek |
|---|---|---|
| **Inicio** | Feed tipo red social con scroll infinito. Aprende de tus me gusta, comentarios y publicaciones compartidas, de lo que marcas como «mostrar menos» y de lo que pasas de largo. El menú de tres puntos también explica «¿Por qué veo esto?». | El planificador central |
| **Tu burbuja** | Nivel de burbuja, su evolución, lo que el algoritmo cree de ti y los temas que desaparecieron. | La fatal arrogancia |
| **Comparar** | Ana y Juan usan la misma plataforma y terminan viendo mundos distintos. | Concentración del poder y problema del conocimiento |
| **Modo Hayek** | «Su filosofía»: cinco conceptos de Hayek conectados con la app, un matiz crítico y la propuesta. «Pruébalo»: un feed que controlas tú. | Orden espontáneo |

## Cómo funciona el algoritmo

Es un sistema de puntuación por temas, sin inteligencia artificial:

1. Cada tema empieza con 1 punto.
2. **Reacciones:** 👍 Me gusta 1.5, ❤️ Me encanta 2, 😂 Me divierte 1.5, 😮 Me asombra 1.5, 😢 Me entristece 1, 😡 Me enoja 2. **Comentar** suma 2 y **compartir** 2.5. **👎 No me gusta** multiplica por 0.45. Que «Me enoja» sume es intencional: según documentos internos revelados en 2021, Facebook llegó a darle a las reacciones con emoji, incluida «me enoja», cinco veces el peso de un me gusta. **Pasar de largo** multiplica por 0.7. **Mostrar menos** (en el menú de tres puntos) multiplica por 0.35.
3. Para elegir la siguiente publicación eleva los puntajes al cubo, lo que amplifica lo que ya te gusta. Con dos o tres interacciones el feed ya cambia.
4. La «curiosidad» (exploración al azar) empieza en 40 % y baja con cada interacción hasta 3 %.
5. **Nivel de burbuja**: qué tan concentradas están las probabilidades que el algoritmo asigna a cada tema (entropía de Shannon; 0 % repartidas entre todos, 100 % todo en uno). Solo cambia cuando interactúas o pasas de largo una publicación.
6. Tocar **Inicio** vuelve a armar el feed desde arriba con lo que el algoritmo ya aprendió, sin mover la burbuja. Las «vistas» solo cuentan publicaciones que de verdad aparecieron en pantalla.

## Guion de demostración (unos 5 minutos)

1. **Inicio.** Pide al público escanear el QR. Tú, en el proyector, da me gusta solo a un tema durante unos 20 segundos de scroll. Muestra cómo cambian las etiquetas («Porque te gustaron 3 publicaciones de Deportes»).
2. **Tu burbuja.** Señala el porcentaje, la curva que sube y los temas tachados: siguen en la plataforma, pero ya no te llegan.
3. **Comparar.** Presiona «Simular 40 interacciones». La coincidencia baja de 100 % a menos de 10 %. A Ana le gustan tres temas, pero el algoritmo suele dejarle casi uno.
4. **Modo Hayek → Su filosofía.** Recorre los cinco conceptos.
5. **Modo Hayek → Pruébalo.** Todo empieza en 0: sube a mano los temas que quieras ver y la dosis de sorpresa. Cierra con: «Nadie sabe mejor que tú lo que quieres ver».
