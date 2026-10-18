// Contenidos de la plataforma simulada.
// Las publicaciones se basan en hechos reales y verificables; las cuentas son ficticias.
// Las de política son opiniones ficticias, escritas para representar dos posturas.

const CATEGORIES = [
  { id: 'prog',  name: 'Política progresista',  color: '#8b3fd9' },
  { id: 'cons',  name: 'Política conservadora', color: '#2456d6' },
  { id: 'econ',  name: 'Economía',              color: '#b26a00' },
  { id: 'tec',   name: 'Tecnología',            color: '#0b87a8' },
  { id: 'cien',  name: 'Ciencia',               color: '#4f8a10' },
  { id: 'dep',   name: 'Deportes',              color: '#d4351c' },
  { id: 'arte',  name: 'Arte y cultura',        color: '#c2337a' },
  { id: 'coc',   name: 'Cocina',                color: '#e0661b' },
  { id: 'salud', name: 'Salud',                 color: '#5c6f82' },
  { id: 'medio', name: 'Medio ambiente',        color: '#177a45' },
  { id: 'ent',   name: 'Entretenimiento',       color: '#b88a00' },
  { id: 'viaj',  name: 'Viajes',                color: '#0f7a73' },
];

const POSTS = [
  // Política progresista (opiniones ficticias)
  { cat: 'prog', name: 'Salud Digna GT', handle: 'saluddigna_gt', text: 'Si la salud pública funcionara como debe, nadie tendría que endeudarse por una emergencia. Es una cuestión de dignidad, no de caridad.' },
  { cat: 'prog', name: 'Red de Trabajadores', handle: 'red_obrera', text: 'Los repartidores de apps trabajan 10 horas diarias sin seguro social ni prestaciones. ¿Emprendedores o trabajadores sin derechos?' },
  { cat: 'prog', name: 'Mariela Ajú', handle: 'mariela_aju', text: 'Un impuesto mínimo a las grandes fortunas podría financiar escuelas en cada municipio. Hablemos de prioridades.' },
  { cat: 'prog', name: 'Barrio Vivo', handle: 'barrio_vivo', text: 'Los alquileres suben más rápido que los salarios. Necesitamos una política pública de vivienda social, ya.' },
  { cat: 'prog', name: 'Igualdad Ya', handle: 'igualdad_ya', text: 'A igual trabajo, igual pago. La brecha salarial no es un debate ideológico, es una deuda pendiente.' },
  { cat: 'prog', name: 'Ciudad para Todos', handle: 'ciudad_paratodos', text: 'Más inversión en transporte público significa menos tráfico, menos contaminación y más tiempo con la familia.' },
  { cat: 'prog', name: 'Maestros Unidos', handle: 'maestros_unidos', text: 'La educación pública de calidad es el mejor igualador social. Invertir en maestros es invertir en el futuro del país.' },
  { cat: 'prog', name: 'Canasta Justa', handle: 'canasta_justa', text: 'El salario mínimo debería alcanzar para la canasta básica. Hoy, para muchas familias, no alcanza.' },

  // Política conservadora (opiniones ficticias)
  { cat: 'cons', name: 'Tribuna Libre', handle: 'tribuna_libre', text: 'Cada quetzal que el Estado gasta mal sale del bolsillo de una familia trabajadora. Menos gasto, más responsabilidad.' },
  { cat: 'cons', name: 'Menos Trámites', handle: 'menos_tramites', text: 'Abrir una empresa no debería tomar meses de papeleo. Menos burocracia es igual a más empleo formal.' },
  { cat: 'cons', name: 'Familia Primero', handle: 'familia_primero', text: 'Los padres, no el Estado, deben decidir cómo se educa a sus hijos. La libertad educativa es un derecho.' },
  { cat: 'cons', name: 'Orden y Progreso', handle: 'orden_progreso', text: 'Sin seguridad no hay inversión ni empleo. Apoyar a la policía es apoyar a los barrios.' },
  { cat: 'cons', name: 'Rodrigo Estrada', handle: 'rodrigo_estrada', text: 'Bajar impuestos a las pymes es la forma más rápida de que el dinero se quede donde se genera: en la comunidad.' },
  { cat: 'cons', name: 'Estado Justo', handle: 'estado_justo', text: 'Un Estado más pequeño y eficiente sirve mejor que uno grande e inalcanzable. Calidad antes que tamaño.' },
  { cat: 'cons', name: 'Propiedad y Libertad', handle: 'propiedad_libertad', text: 'La propiedad privada es la base de la prosperidad: nadie cuida tanto algo como cuando es suyo.' },
  { cat: 'cons', name: 'Trabajo Primero', handle: 'trabajo_primero', text: 'La mejor política social es un empleo. Más inversión privada significa más familias con ingresos propios.' },

  // Economía
  { cat: 'econ', name: 'Economía al Día', handle: 'economia_aldia', verified: true, text: 'Guatemala recibió más de 21,000 millones de dólares en remesas en 2024, un récord y cerca de una quinta parte de su PIB. Detrás de cada envío hay una familia.' },
  { cat: 'econ', name: 'Aula Económica', handle: 'aula_economica', text: 'El Nobel de Economía 2024 fue para Acemoglu, Johnson y Robinson, por explicar cómo las instituciones hacen que unos países prosperen y otros no.' },
  { cat: 'econ', name: 'Cripto en Español', handle: 'cripto_es', text: 'En 2021 El Salvador fue el primer país en adoptar el bitcoin como moneda de curso legal. ¿Experimento audaz o apuesta arriesgada?' },
  { cat: 'econ', name: 'Finanzas Claras', handle: 'finanzas_claras', text: 'Regla 50/30/20: la mitad de tu ingreso para necesidades, 30 % para gustos y 20 % para ahorro. Simple, y funciona.' },
  { cat: 'econ', name: 'Mercados GT', handle: 'mercados_gt', text: 'El café sigue entre las principales exportaciones de Guatemala. Antigua, Huehuetenango y Atitlán tienen fama mundial.' },
  { cat: 'econ', name: 'Bolsillo Sano', handle: 'bolsillo_sano', text: 'La inflación es un impuesto silencioso: si tu salario sube 3 % y los precios 5 %, en realidad ganas menos.' },
  { cat: 'econ', name: 'Agro en Datos', handle: 'agro_datos', text: 'Guatemala es uno de los mayores exportadores de cardamomo del mundo. Buena parte se cultiva en Alta Verapaz.' },
  { cat: 'econ', name: 'Historia Económica', handle: 'historia_economica', text: 'Hayek ganó el Nobel de Economía en 1974, compartido con Gunnar Myrdal, un economista con ideas casi opuestas a las suyas.' },

  // Tecnología
  { cat: 'tec', name: 'Byte Latino', handle: 'byte_latino', verified: true, text: 'El Nobel de Física 2024 premió a John Hopfield y Geoffrey Hinton por las bases de las redes neuronales que hoy usan los sistemas de inteligencia artificial.' },
  { cat: 'tec', name: 'Futuro Hoy', handle: 'futurohoy', text: 'Según estimaciones de analistas, ChatGPT llegó a 100 millones de usuarios en unos dos meses: la adopción más rápida de una app en su momento.' },
  { cat: 'tec', name: 'Ley y Código', handle: 'ley_y_codigo', text: 'La Unión Europea aprobó en 2024 la AI Act, la primera ley integral del mundo sobre inteligencia artificial.' },
  { cat: 'tec', name: 'Ciber Alerta', handle: 'ciber_alerta', text: 'Las passkeys vienen a reemplazar las contraseñas: entras con tu huella o tu rostro. Google, Apple y Microsoft ya las soportan.' },
  { cat: 'tec', name: 'Andrea Tecnología', handle: 'andrea_tec', text: 'Activa hoy la verificación en dos pasos en tu correo y tus redes. Es la medida más simple para proteger tus cuentas.' },
  { cat: 'tec', name: 'Pantalla Crítica', handle: 'pantalla_critica', text: '¿Por qué ves lo que ves en redes? Los algoritmos ordenan tu feed según lo que creen que te mantendrá más tiempo en la app.' },
  { cat: 'tec', name: 'Conectados', handle: 'conectados', text: 'WhatsApp superó los 2,000 millones de usuarios en 2020. Hoy es la forma principal de comunicarse en buena parte de América Latina.' },
  { cat: 'tec', name: 'Archivo Digital', handle: 'archivo_digital', text: 'El primer iPhone se presentó en 2007. En menos de 20 años, casi todo pasó a hacerse desde un teléfono.' },
  { cat: 'tec', name: 'Gadget Lab', handle: 'gadget_lab', text: 'Desde finales de 2024, la Unión Europea exige USB-C como cargador común en los teléfonos nuevos. Adiós al cajón lleno de cables.' },

  // Ciencia
  { cat: 'cien', name: 'Cosmos Abierto', handle: 'cosmos_abierto', verified: true, text: 'El telescopio James Webb detectó dióxido de carbono en la atmósfera del exoplaneta WASP-39b: la primera detección clara de CO₂ en un planeta fuera del sistema solar.' },
  { cat: 'cien', name: 'Ciencia Clara', handle: 'ciencia_clara', text: 'En 2022 la misión DART de la NASA chocó contra el asteroide Dimorphos y acortó su órbita unos 32 minutos. Por primera vez, la humanidad desvió un asteroide.' },
  { cat: 'cien', name: 'Bata Blanca', handle: 'bata_blanca', text: 'Katalin Karikó y Drew Weissman ganaron el Nobel de Medicina 2023 por los descubrimientos que hicieron posibles las vacunas de ARNm.' },
  { cat: 'cien', name: 'Mente Curiosa', handle: 'mente_curiosa', text: 'AlphaFold predice la forma de casi todas las proteínas conocidas. Sus creadores compartieron el Nobel de Química 2024.' },
  { cat: 'cien', name: 'Física para Todos', handle: 'fisica_todos', text: 'En 2022 un laboratorio de EE. UU. logró por primera vez una reacción de fusión que liberó más energía de la que le entregaron los láseres.' },
  { cat: 'cien', name: 'Astro GT', handle: 'astro_gt', text: 'En 2022 vimos la primera imagen de Sagitario A*, el agujero negro que está en el centro de nuestra galaxia.' },
  { cat: 'cien', name: 'Rumbo al Espacio', handle: 'rumbo_espacio', text: 'La sonda Voyager 1, lanzada en 1977, es el objeto hecho por humanos más lejano de la Tierra. Y sigue enviando datos.' },
  { cat: 'cien', name: 'Ondas y Partículas', handle: 'ondas_particulas', text: 'En 2015 se detectaron por primera vez ondas gravitacionales, tal como Einstein las había predicho un siglo antes.' },
  { cat: 'cien', name: 'Genética Hoy', handle: 'genetica_hoy', text: 'En 2003 se completó el Proyecto Genoma Humano, que leyó casi todo nuestro ADN. Tomó 13 años y miles de científicos.' },

  // Deportes
  { cat: 'dep', name: 'Gol Chapín', handle: 'gol_chapin', verified: true, text: 'Adriana Ruano hizo historia en París 2024: primera medalla de oro olímpica para Guatemala, en tiro con escopeta, modalidad foso.' },
  { cat: 'dep', name: 'Memoria Deportiva', handle: 'memoria_deportiva', text: 'Erick Barrondo ganó plata en marcha en Londres 2012 y le dio a Guatemala su primera medalla olímpica.' },
  { cat: 'dep', name: 'Fútbol Total', handle: 'futbol_total', text: 'Argentina fue campeona en Catar 2022 tras vencer a Francia en penales, en una de las mejores finales de la historia.' },
  { cat: 'dep', name: 'Mundialistas', handle: 'mundialistas', text: 'El Mundial 2026 fue el primero con 48 selecciones y tres países sede: México, Estados Unidos y Canadá.' },
  { cat: 'dep', name: 'Corre Guate', handle: 'corre_guate', text: 'Eliud Kipchoge corrió un maratón en menos de dos horas en Viena, en 2019. No contó como récord oficial, pero demostró que era posible.' },
  { cat: 'dep', name: 'Balón Parado', handle: 'balon_parado', text: 'Messi ganó su octavo Balón de Oro en 2023. ¿Veremos a otro jugador acercarse a esa cifra?' },
  { cat: 'dep', name: 'Match Point', handle: 'match_point', text: 'Rafael Nadal ganó 14 veces Roland Garros. Es probable que nadie repita ese récord en mucho tiempo.' },
  { cat: 'dep', name: 'Pista Rápida', handle: 'pista_rapida', text: 'Usain Bolt corrió los 100 metros en 9.58 segundos en Berlín 2009. Más de 15 años después, el récord sigue en pie.' },
  { cat: 'dep', name: 'Raqueta GT', handle: 'raqueta_gt', text: 'Kevin Cordón terminó cuarto en bádminton en Tokio 2020, a un paso de la medalla. Un resultado histórico para Guatemala.' },

  // Arte y cultura
  { cat: 'arte', name: 'Letras de Guate', handle: 'letras_guate', text: 'Miguel Ángel Asturias ganó el Nobel de Literatura en 1967. «Hombres de maíz» sigue siendo lectura obligada.' },
  { cat: 'arte', name: 'Patrimonio Vivo', handle: 'patrimonio_vivo', verified: true, text: 'En 2022 la UNESCO inscribió la Semana Santa de Guatemala como Patrimonio Cultural Inmaterial. Las alfombras de aserrín son arte efímero.' },
  { cat: 'arte', name: 'Butaca Crítica', handle: 'butaca_critica', text: '«Cien años de soledad» llegó a la pantalla en 2024 como serie, filmada en Colombia y en español, como pidió la familia de García Márquez.' },
  { cat: 'arte', name: 'Club de Lectura', handle: 'club_lectura', text: 'En 2024 se publicó «En agosto nos vemos», la novela póstuma de García Márquez, diez años después de su muerte.' },
  { cat: 'arte', name: 'Tradiciones GT', handle: 'tradiciones_gt', text: 'Se acercan los barriletes gigantes de Sumpango y Santiago Sacatepéquez, una tradición del Día de Todos los Santos.' },
  { cat: 'arte', name: 'Muros que Hablan', handle: 'muros_que_hablan', text: 'Cada vez más barrios convierten muros grises en galerías al aire libre. El muralismo comunitario está creciendo.' },
  { cat: 'arte', name: 'Arte Moderno GT', handle: 'arte_moderno_gt', text: 'Carlos Mérida, pintor guatemalteco, fue uno de los pioneros del arte moderno en América Latina y trabajó junto a los muralistas mexicanos.' },
  { cat: 'arte', name: 'Raíces Mayas', handle: 'raices_mayas', text: 'El Popol Vuh, libro sagrado del pueblo k’iche’, es una de las obras más importantes de la literatura indígena de América.' },

  // Cocina
  { cat: 'coc', name: 'Sazón Chapina', handle: 'sazon_chapina', text: 'El pepián es Patrimonio Cultural Intangible de la Nación. ¿Con pollo o con res? Se aceptan opiniones.' },
  { cat: 'coc', name: 'Historia en la Mesa', handle: 'historia_mesa', text: 'El cacao era tan valioso para los mayas que se usaba como moneda. Cada taza de chocolate trae miles de años de historia.' },
  { cat: 'coc', name: 'Cocina de Abuela', handle: 'cocina_abuela', text: 'El fiambre se prepara una vez al año, para el 1 de noviembre, y puede llevar decenas de ingredientes. ¿Ya tienes tu receta familiar?' },
  { cat: 'coc', name: 'Café de Altura', handle: 'cafe_altura', text: 'Para un buen café en casa: agua entre 92 y 96 °C, molienda media y 1 gramo de café por cada 15 de agua.' },
  { cat: 'coc', name: 'Antojitos GT', handle: 'antojitos_gt', text: 'Tamales colorados o negros: en Navidad no pueden faltar. ¿Cuál es tu favorito?' },
  { cat: 'coc', name: 'Horno Casero', handle: 'horno_casero', text: 'Pan casero con cuatro ingredientes: harina, agua, sal y levadura. El secreto es la paciencia.' },
  { cat: 'coc', name: 'Fogón Q’eqchi’', handle: 'fogon_qeqchi', text: 'El kak’ik, caldo de chunto de Alta Verapaz, también es Patrimonio Cultural Intangible de la Nación. ¿Ya lo probaste?' },
  { cat: 'coc', name: 'Maíz Vivo', handle: 'maiz_vivo', text: 'Las tortillas llevan nixtamal: cocer el maíz con cal mejora su valor nutritivo. Es una técnica de origen mesoamericano.' },

  // Salud
  { cat: 'salud', name: 'Vida Activa', handle: 'vida_activa', text: 'La OMS recomienda a los adultos al menos 150 minutos de actividad física moderada por semana. Son unos 22 minutos al día.' },
  { cat: 'salud', name: 'Dormir Bien', handle: 'dormir_bien', text: 'Dormir habitualmente menos de 7 horas se asocia con más riesgo de enfermedades. Descansar también es cuidar tu salud.' },
  { cat: 'salud', name: 'Nutrición Fácil', handle: 'nutricion_facil', text: 'La OMS sugiere que los azúcares libres sean menos del 10 % de las calorías del día. Una gaseosa grande puede superar ese límite.' },
  { cat: 'salud', name: 'Salud Pública Hoy', handle: 'saludpublica_hoy', verified: true, text: 'En mayo de 2023 la OMS declaró el fin de la emergencia sanitaria internacional por COVID-19.' },
  { cat: 'salud', name: 'Pantallas y Sueño', handle: 'pantallas_sueno', text: 'Ver redes justo antes de dormir afecta tu descanso. Prueba dejar el teléfono 30 minutos antes de acostarte.' },
  { cat: 'salud', name: 'Mente Sana', handle: 'mente_sana', text: 'Hablar de salud mental no es debilidad. Pedir ayuda a tiempo es lo más valiente que puedes hacer.' },
  { cat: 'salud', name: 'Prevenir es Vivir', handle: 'prevenir_vivir', text: 'Lavarse las manos con agua y jabón durante al menos 20 segundos es una de las formas más simples de prevenir infecciones.' },
  { cat: 'salud', name: 'Aire Limpio', handle: 'aire_limpio', text: 'La OMS estima que el tabaco causa más de 8 millones de muertes cada año. Nunca es tarde para dejarlo.' },

  // Medio ambiente
  { cat: 'medio', name: 'Clima en Datos', handle: 'clima_datos', verified: true, text: 'Según Copernicus, 2024 fue el año más cálido registrado y el primero en superar 1.5 °C sobre la era preindustrial.' },
  { cat: 'medio', name: 'Selva Maya', handle: 'selva_maya', text: 'La Reserva de la Biosfera Maya, en Petén, es el área protegida más grande de Centroamérica.' },
  { cat: 'medio', name: 'Buenas Noticias Verdes', handle: 'noticias_verdes', text: 'La capa de ozono se recupera: la ONU estima que sobre la Antártida volverá a los niveles de 1980 hacia 2066.' },
  { cat: 'medio', name: 'Mar Limpio', handle: 'mar_limpio', text: 'Cada año millones de toneladas de plástico terminan en el océano. Reducir los de un solo uso empieza en casa.' },
  { cat: 'medio', name: 'Salvemos Atitlán', handle: 'salvemos_atitlan', text: 'En 2009 el lago de Atitlán sufrió una gran floración de cianobacterias. Su cuidado sigue siendo urgente.' },
  { cat: 'medio', name: 'Fauna Libre', handle: 'fauna_libre', text: 'La guacamaya roja está en peligro en Guatemala. En la Laguna del Tigre, en Petén, hay proyectos dedicados a protegerla.' },
  { cat: 'medio', name: 'Tierra de Volcanes', handle: 'tierra_volcanes', text: 'Guatemala tiene 37 volcanes. Fuego, Pacaya y Santiaguito están entre los más activos de la región.' },
  { cat: 'medio', name: 'Océano Azul', handle: 'oceano_azul', text: 'Los arrecifes de coral cubren menos del 1 % del fondo marino, pero albergan cerca de una cuarta parte de las especies marinas.' },
  { cat: 'medio', name: 'Bosque Nuboso', handle: 'bosque_nuboso', text: 'El quetzal, ave nacional de Guatemala, vive en los bosques nubosos. La deforestación es su principal amenaza.' },

  // Entretenimiento
  { cat: 'ent', name: 'Pop en Español', handle: 'pop_espanol', verified: true, text: 'Bad Bunny encabezó el show de medio tiempo del Super Bowl LX en febrero de 2026, cantado casi todo en español.' },
  { cat: 'ent', name: 'En Vivo', handle: 'envivo_conciertos', text: 'El Eras Tour de Taylor Swift se convirtió en la gira más taquillera de la historia, con más de 2,000 millones de dólares.' },
  { cat: 'ent', name: 'Cartelera', handle: 'cartelera', text: '«Oppenheimer» ganó el Óscar a Mejor Película en 2024 y se llevó siete estatuillas en total.' },
  { cat: 'ent', name: 'Maratón de Series', handle: 'maraton_series', text: 'Stranger Things se despidió con su quinta y última temporada a finales de 2025. ¿Estuvo a la altura?' },
  { cat: 'ent', name: 'Taquilla', handle: 'taquilla_semanal', text: '«Una película de Minecraft» fue uno de los grandes éxitos de taquilla de 2025.' },
  { cat: 'ent', name: 'Memes del Día', handle: 'memes_deldia', text: 'Yo: solo un capítulo más. También yo, a las 3 de la mañana: ¿y si veo cómo termina la temporada?' },
  { cat: 'ent', name: 'Animación al Día', handle: 'animacion_dia', text: '«Coco», de Pixar, ganó el Óscar a Mejor Película Animada en 2018 y llevó el Día de Muertos a todo el mundo.' },
  { cat: 'ent', name: 'Gamer Zone', handle: 'gamer_zone', text: '«Super Mario Bros.: La película» recaudó más de 1,300 millones de dólares en 2023. Los videojuegos conquistaron el cine.' },

  // Viajes
  { cat: 'viaj', name: 'Mundo Maya', handle: 'mundo_maya', verified: true, text: 'Tikal y Antigua Guatemala son Patrimonio Mundial de la UNESCO desde 1979.' },
  { cat: 'viaj', name: 'Mochila Lista', handle: 'mochila_lista', text: 'Amanecer desde el Templo IV de Tikal: la selva cubierta de niebla y, de fondo, los monos aulladores.' },
  { cat: 'viaj', name: 'Rutas Verapaz', handle: 'rutas_verapaz', text: 'Semuc Champey: pozas de agua turquesa sobre un puente natural de piedra caliza, en Alta Verapaz.' },
  { cat: 'viaj', name: 'Lejos de Casa', handle: 'lejos_de_casa', text: 'Japón recibió cerca de 37 millones de visitantes extranjeros en 2024, un récord histórico.' },
  { cat: 'viaj', name: 'Siete Maravillas', handle: 'siete_maravillas', text: 'Chichén Itzá y Machu Picchu están entre las Nuevas Siete Maravillas del Mundo, elegidas en 2007.' },
  { cat: 'viaj', name: 'Lago y Volcán', handle: 'lago_volcan', text: 'Atitlán en tres días: San Juan La Laguna, San Marcos y un atardecer frente a los volcanes.' },
  { cat: 'viaj', name: 'Caribe Chapín', handle: 'caribe_chapin', text: 'Río Dulce y Livingston: el Caribe guatemalteco, con cultura garífuna, se recorre en lancha entre cañones verdes.' },
  { cat: 'viaj', name: 'Cumbres GT', handle: 'cumbres_gt', text: 'Subir el Acatenango (3,976 m) es una de las caminatas favoritas del país: desde la cima se ve al volcán de Fuego hacer erupción.' },
].map((p, i) => ({ ...p, id: i }));

const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
