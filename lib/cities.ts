// Ciudades agrupadas por país → se exportan como "Ciudad, País"
const BY_COUNTRY: Record<string, string[]> = {
  "España": [
    // Madrid (barrios y municipios)
    "Salamanca, Madrid", "Chamberí, Madrid", "Malasaña, Madrid", "Chueca, Madrid",
    "Lavapiés, Madrid", "La Latina, Madrid", "Moncloa, Madrid", "Tetuán, Madrid",
    "Hortaleza, Madrid", "Vallecas, Madrid", "Carabanchel, Madrid", "Arganzuela, Madrid",
    "Retiro, Madrid", "Moratalaz, Madrid", "Usera, Madrid", "Villaverde, Madrid",
    "Fuencarral, Madrid", "Ciudad Lineal, Madrid", "Barajas, Madrid",
    "Móstoles", "Alcobendas", "Getafe", "Leganés", "Alcalá de Henares",
    "Torrejón de Ardoz", "Fuenlabrada", "Parla", "Alcorcón", "Pozuelo de Alarcón",
    "Las Rozas", "Majadahonda", "Boadilla del Monte", "Rivas-Vaciamadrid",
    "Collado Villalba", "San Sebastián de los Reyes", "Coslada", "Valdemoro",
    // Barcelona
    "Gràcia, Barcelona", "Eixample, Barcelona", "Poblenou, Barcelona", "Sants, Barcelona",
    "Sant Andreu, Barcelona", "Les Corts, Barcelona", "Sarrià, Barcelona", "Horta, Barcelona",
    "El Born, Barcelona", "Barceloneta, Barcelona", "Raval, Barcelona", "Poble Sec, Barcelona",
    "Clot, Barcelona",
    "Badalona", "L'Hospitalet de Llobregat", "Sabadell", "Terrassa", "Mataró",
    "Cornellà de Llobregat", "Sant Cugat del Vallès", "Rubí", "Granollers",
    "El Prat de Llobregat", "Gavà", "Castelldefels", "Vilanova i la Geltrú", "Manresa",
    "Igualada", "Tarragona", "Reus", "Lleida", "Girona",
    // Valencia
    "Ruzafa, Valencia", "El Cabanyal, Valencia", "Benimaclet, Valencia", "Campanar, Valencia",
    "Patraix, Valencia", "Jesús, Valencia", "Algirós, Valencia",
    "Alboraya", "Torrent", "Gandia", "Sagunto", "Alzira", "Ontinyent",
    "Elche", "Alicante", "Benidorm", "Torrevieja", "Orihuela", "Santa Pola",
    "Castellón de la Plana", "Vila-real", "Burriana", "Vinaròs",
    // Andalucía
    "Triana, Sevilla", "Los Remedios, Sevilla", "Nervión, Sevilla", "Macarena, Sevilla",
    "Dos Hermanas", "Alcalá de Guadaíra", "Écija", "Carmona",
    "Marbella", "Fuengirola", "Torremolinos", "Estepona", "Mijas", "Vélez-Málaga",
    "Antequera", "Ronda", "Nerja",
    "Jerez de la Frontera", "El Puerto de Santa María", "San Fernando", "Algeciras",
    "La Línea de la Concepción", "Chiclana de la Frontera", "Sanlúcar de Barrameda",
    "Córdoba", "Lucena",
    "Granada", "Motril", "Baza",
    "Almería", "El Ejido", "Roquetas de Mar",
    "Jaén", "Linares", "Úbeda", "Baeza",
    "Huelva", "Lepe", "Moguer",
    // País Vasco y Navarra
    "Bilbao", "Getxo", "Barakaldo", "Portugalete", "Sestao",
    "San Sebastián", "Irún", "Errenteria",
    "Vitoria-Gasteiz",
    "Pamplona", "Tudela",
    "Logroño", "Calahorra",
    // Norte y Galicia
    "Oviedo", "Gijón", "Avilés",
    "Santander", "Torrelavega",
    "Vigo", "Pontevedra", "A Coruña", "Santiago de Compostela", "Ferrol", "Lugo", "Ourense",
    // Castilla y otras
    "Zaragoza", "Huesca", "Teruel",
    "Valladolid", "Burgos", "Salamanca", "Ávila", "Segovia", "Palencia", "León", "Zamora",
    "Toledo", "Talavera de la Reina", "Ciudad Real", "Albacete", "Cuenca", "Guadalajara",
    "Badajoz", "Mérida", "Cáceres",
    "Murcia", "Cartagena", "Lorca",
    // Islas
    "Las Palmas de Gran Canaria", "Santa Cruz de Tenerife", "La Laguna", "Arona", "Adeje",
    "Puerto de la Cruz", "Arrecife", "Puerto del Rosario",
    "Palma de Mallorca", "Calvià", "Manacor", "Inca", "Ibiza", "Mahón",
  ],

  "México": [
    // CDMX colonias
    "Polanco, CDMX", "Roma Norte, CDMX", "Roma Sur, CDMX", "Condesa, CDMX",
    "Coyoacán, CDMX", "Del Valle, CDMX", "Narvarte, CDMX", "Nápoles, CDMX",
    "Doctores, CDMX", "Centro Histórico, CDMX", "Tlatelolco, CDMX",
    "Santa Fe, CDMX", "Lomas de Chapultepec, CDMX",
    "Xochimilco, CDMX", "Iztapalapa, CDMX", "Azcapotzalco, CDMX",
    "Gustavo A. Madero, CDMX", "Álvaro Obregón, CDMX", "Tlalpan, CDMX",
    "Benito Juárez, CDMX", "Miguel Hidalgo, CDMX",
    // Estado de México
    "Satélite, Estado de México", "Tlalnepantla", "Naucalpan", "Nezahualcóyotl",
    "Ecatepec", "Texcoco", "Atizapán de Zaragoza", "Cuautitlán Izcalli",
    // Guadalajara
    "Zapopan", "Tlaquepaque", "Providencia, Guadalajara", "Chapalita, Guadalajara",
    "Americana, Guadalajara", "Lafayette, Guadalajara", "Tonalá", "Tlajomulco de Zúñiga",
    // Monterrey
    "San Pedro Garza García", "Cumbres, Monterrey", "Valle Oriente, Monterrey",
    "Mitras, Monterrey", "Obispado, Monterrey", "Apodaca", "Guadalupe, Nuevo León",
    "Santa Catarina, Nuevo León", "Escobedo",
    // Puebla y Querétaro
    "Angelópolis, Puebla", "Cholula", "San Andrés Cholula", "Atlixco", "Tehuacán",
    "Querétaro", "San Juan del Río", "Corregidora",
    // Guanajuato y Bajío
    "León", "Irapuato", "Celaya", "Guanajuato", "Silao",
    "San Luis Potosí", "Aguascalientes",
    // Occidente
    "Morelia", "Uruapan", "Zamora de Hidalgo",
    "Colima", "Manzanillo",
    "Puerto Vallarta",
    // Norte
    "Culiacán", "Mazatlán", "Los Mochis",
    "Hermosillo", "Obregón", "Nogales",
    "Chihuahua", "Ciudad Juárez", "Delicias",
    "Tijuana", "Mexicali", "Ensenada", "La Paz",
    "Torreón", "Saltillo", "Monclova",
    "Durango", "Zacatecas",
    // Sur y Sureste
    "Mérida", "Cancún", "Playa del Carmen", "Cozumel",
    "Villahermosa", "Tuxtla Gutiérrez", "San Cristóbal de las Casas",
    "Oaxaca", "Puerto Escondido", "Huatulco",
    "Acapulco", "Chilpancingo",
    "Veracruz", "Xalapa", "Coatzacoalcos", "Poza Rica",
    "Cuernavaca", "Jiutepec",
    "Tapachula",
  ],

  "Colombia": [
    // Medellín
    "El Poblado, Medellín", "Laureles, Medellín", "Belén, Medellín",
    "Castilla, Medellín", "Aranjuez, Medellín", "La América, Medellín",
    "Envigado", "Bello", "Itagüí", "Sabaneta", "La Estrella",
    // Bogotá
    "Chapinero, Bogotá", "Usaquén, Bogotá", "Suba, Bogotá", "Kennedy, Bogotá",
    "Bosa, Bogotá", "Engativá, Bogotá", "Fontibón, Bogotá", "Teusaquillo, Bogotá",
    "Barrios Unidos, Bogotá", "Antonio Nariño, Bogotá", "Santa Fe, Bogotá",
    // Cali
    "Cali", "Palmira", "Buenaventura", "Jamundí", "Yumbo",
    // Otras ciudades
    "Barranquilla", "Soledad", "Malambo",
    "Cartagena de Indias", "Turbaco",
    "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta",
    "Pereira", "Dosquebradas", "Santa Rosa de Cabal",
    "Manizales", "Villamaría",
    "Armenia", "Montenegro",
    "Cúcuta", "Villa del Rosario",
    "Ibagué", "Neiva", "Pitalito",
    "Popayán", "Santa Marta", "Valledupar",
    "Montería", "Sincelejo", "Villavicencio", "Pasto",
  ],

  "Argentina": [
    // Buenos Aires barrios
    "Palermo, Buenos Aires", "Belgrano, Buenos Aires", "Caballito, Buenos Aires",
    "Flores, Buenos Aires", "Villa Crespo, Buenos Aires", "San Telmo, Buenos Aires",
    "Puerto Madero, Buenos Aires", "Recoleta, Buenos Aires", "Barracas, Buenos Aires",
    "La Boca, Buenos Aires", "Almagro, Buenos Aires", "Boedo, Buenos Aires",
    "Villa del Parque, Buenos Aires", "Devoto, Buenos Aires", "Saavedra, Buenos Aires",
    "Núñez, Buenos Aires", "Villa Urquiza, Buenos Aires", "Balvanera, Buenos Aires",
    // GBA
    "San Isidro", "Vicente López", "Tigre", "San Martín, GBA",
    "Morón", "Hurlingham", "La Matanza", "Lanús", "Lomas de Zamora",
    "Quilmes", "Berazategui", "Florencio Varela", "Ezeiza",
    "Merlo", "Moreno", "Luján",
    // Interior
    "Córdoba", "Villa Carlos Paz", "Alta Gracia", "Río Cuarto", "Villa María",
    "Rosario", "Venado Tuerto", "Rafaela", "Santa Fe",
    "Mendoza", "Godoy Cruz", "Guaymallén", "San Rafael",
    "La Plata", "Mar del Plata", "Bahía Blanca", "Tandil",
    "Tucumán", "Tafí Viejo",
    "Salta", "Jujuy", "Posadas", "Corrientes",
    "Resistencia", "Paraná", "Concordia",
    "San Juan", "San Luis", "Neuquén", "Cipolletti",
    "Bariloche", "Comodoro Rivadavia", "Ushuaia",
  ],

  "Perú": [
    // Lima distritos
    "Miraflores, Lima", "San Isidro, Lima", "Surco, Lima", "La Molina, Lima",
    "Barranco, Lima", "San Borja, Lima", "Magdalena del Mar, Lima",
    "Jesús María, Lima", "Lince, Lima", "Pueblo Libre, Lima",
    "San Miguel, Lima", "Chorrillos, Lima", "Surquillo, Lima",
    "San Juan de Lurigancho, Lima", "Los Olivos, Lima", "Independencia, Lima",
    "Ate, Lima", "Santa Anita, Lima",
    "Callao", "La Perla, Callao",
    // Otras ciudades
    "Arequipa", "Cayma", "Yanahuara", "Cerro Colorado",
    "Trujillo", "Víctor Larco Herrera", "Chiclayo", "José Leonardo Ortiz",
    "Piura", "Sullana", "Iquitos", "Cusco",
    "Puno", "Juliaca", "Tacna", "Huancayo", "Ica", "Chimbote",
  ],

  "Venezuela": [
    "Chacao, Caracas", "Baruta, Caracas", "El Hatillo, Caracas",
    "Las Mercedes, Caracas", "La Florida, Caracas", "Altamira, Caracas",
    "Los Palos Grandes, Caracas", "El Paraíso, Caracas",
    "Maracaibo", "San Francisco, Maracaibo",
    "Valencia", "Naguanagua", "San Diego",
    "Barquisimeto", "Cabudare",
    "Maracay", "Turmero",
    "San Cristóbal", "Barcelona, Anzoátegui", "Puerto La Cruz",
    "Maturín", "Cumaná", "Puerto Ordaz", "Mérida",
  ],

  "Chile": [
    // Santiago comunas
    "Providencia, Santiago", "Las Condes, Santiago", "Ñuñoa, Santiago", "Vitacura, Santiago",
    "La Florida, Santiago", "Maipú", "Pudahuel", "Quilicura",
    "Peñalolén", "Puente Alto", "La Reina, Santiago", "Macul",
    "Lo Barnechea", "Huechuraba", "Recoleta, Santiago", "Independencia, Santiago",
    "Estación Central", "Santiago Centro",
    // Otras ciudades
    "Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana",
    "Concepción", "Talcahuano", "Coronel",
    "La Serena", "Coquimbo", "Antofagasta", "Arica", "Iquique",
    "Temuco", "Padre Las Casas", "Valdivia", "Puerto Montt", "Osorno",
    "Chillán", "Rancagua", "Talca", "Curicó",
  ],

  "Ecuador": [
    "La Mariscal, Quito", "González Suárez, Quito", "El Batán, Quito",
    "Iñaquito, Quito", "Cotocollao, Quito", "Cumbayá", "Tumbaco",
    "Urdesa, Guayaquil", "Kennedy, Guayaquil", "Alborada, Guayaquil",
    "Ceibos, Guayaquil", "Samborondón", "Daule", "Durán",
    "Cuenca", "Manta", "Portoviejo", "Loja", "Ambato",
    "Riobamba", "Machala", "Santo Domingo de los Tsáchilas", "Ibarra",
  ],

  "Guatemala": [
    "Zona 10, Guatemala City", "Zona 14, Guatemala City",
    "Zona 15, Guatemala City", "Zona 16, Guatemala City",
    "Mixco", "Villa Nueva", "Antigua Guatemala",
    "Quetzaltenango", "Escuintla", "Cobán",
    "Chiquimula", "Puerto Barrios", "Mazatenango",
  ],

  "Cuba": [
    "Vedado, La Habana", "Miramar, La Habana", "Playa, La Habana",
    "Centro Habana", "La Habana Vieja", "Cerro, La Habana",
    "Santiago de Cuba", "Holguín", "Camagüey", "Santa Clara",
    "Guantánamo", "Bayamo", "Matanzas", "Cienfuegos", "Pinar del Río",
  ],

  "República Dominicana": [
    "Piantini, Santo Domingo", "Naco, Santo Domingo", "Evaristo Morales, Santo Domingo",
    "Bella Vista, Santo Domingo", "Los Cacicazgos, Santo Domingo",
    "Los Prados, Santo Domingo", "Arroyo Hondo, Santo Domingo",
    "Santiago de los Caballeros", "La Vega", "San Pedro de Macorís",
    "La Romana", "Puerto Plata", "Higüey",
  ],

  "Bolivia": [
    "Sopocachi, La Paz", "Miraflores, La Paz", "San Miguel, La Paz",
    "Calacoto, La Paz", "Zona Sur, La Paz", "El Alto",
    "Cochabamba", "Sacaba", "Quillacollo",
    "Santa Cruz de la Sierra", "Warnes", "Montero",
    "Oruro", "Potosí", "Sucre", "Tarija",
  ],

  "Honduras": [
    "Tegucigalpa", "Comayagüela",
    "San Pedro Sula", "Choloma", "La Lima", "Puerto Cortés",
    "El Progreso", "La Ceiba", "Choluteca",
  ],

  "Paraguay": [
    "Asunción", "Fernando de la Mora", "Lambaré", "Luque",
    "San Lorenzo", "Capiatá", "Limpio",
    "Encarnación", "Ciudad del Este", "Concepción",
  ],

  "El Salvador": [
    "San Salvador", "Santa Tecla", "Antiguo Cuscatlán",
    "Mejicanos", "Soyapango", "Apopa",
    "Santa Ana", "San Miguel",
  ],

  "Nicaragua": [
    "Managua", "Ciudad Sandino", "Masaya",
    "León", "Chinandega", "Matagalpa", "Estelí", "Granada",
  ],

  "Costa Rica": [
    "Escazú", "Santa Ana, San José", "Desamparados",
    "Alajuela", "Heredia", "Cartago", "Liberia",
    "Pérez Zeledón", "San Carlos",
  ],

  "Panamá": [
    "Ciudad de Panamá", "San Miguelito", "Arraiján", "La Chorrera",
    "Colón", "David", "Santiago de Veraguas", "Chitré",
  ],

  "Uruguay": [
    "Pocitos, Montevideo", "Punta Carretas, Montevideo", "Malvín, Montevideo",
    "Carrasco, Montevideo", "Cordón, Montevideo", "Punta Gorda, Montevideo",
    "Salto", "Paysandú", "Maldonado", "Punta del Este", "Las Piedras", "Canelones",
  ],

  "Puerto Rico": [
    "Santurce, San Juan", "Miramar, San Juan", "Condado, San Juan",
    "Isla Verde, San Juan", "Bayamón", "Carolina", "Ponce",
    "Caguas", "Mayagüez", "Arecibo", "Guaynabo", "Trujillo Alto",
  ],
};

// Exporta strings planos con "Ciudad, País" para el random picker
const CITIES: string[] = Object.entries(BY_COUNTRY).flatMap(
  ([country, cities]) => cities.map((city) => `${city}, ${country}`)
);

export default CITIES;
