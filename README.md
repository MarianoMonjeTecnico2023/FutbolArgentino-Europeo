# Futbol Mundial - Resultados en Vivo

Una aplicación web que muestra resultados de fútbol en vivo y recientes de las principales ligas argentinas y europeas.

## Características

- Resultados en vivo de la Primera División Argentina
- Resultados de las principales ligas europeas (La Liga, Serie A, Bundesliga, Ligue 1)
- Diseño responsivo que se adapta a todos los dispositivos
- Actualización automática cada 5 minutos
- Interfaz moderna y fácil de usar

## Configuración

1. Clona este repositorio
2. Regístrate en [API-Football](https://www.api-football.com/) para obtener una API key gratuita
3. Abre el archivo `js/main.js` y reemplaza `'TU_API_KEY_AQUI'` con tu API key
4. Abre el archivo `index.html` en tu navegador

## Tecnologías Utilizadas

- HTML5
- CSS3 (con diseño responsivo)
- JavaScript (ES6+)
- API-Football

## Estructura del Proyecto

```
futbol-mundial/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── README.md
```

## Uso

1. La página mostrará automáticamente los resultados de los partidos
2. Navega entre las secciones de fútbol argentino y europeo usando el menú superior
3. Los resultados se actualizarán automáticamente cada 5 minutos
4. Cada tarjeta de partido muestra:
   - Nombre de la liga
   - Fecha y hora del partido
   - Equipos participantes con sus logos
   - Resultado actual
   - Estadio donde se juega

## Notas

- La API gratuita tiene límites de uso, por favor revisa la documentación de API-Football
- Asegúrate de tener una conexión a internet estable
- Los logos de los equipos se cargan desde la API de API-Football 