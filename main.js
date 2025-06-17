// Configuración de la API
const API_KEY = '7c6df79a321c144d149ac2214febf313'; // Necesitarás registrarte en api-football.com para obtener una API key
const API_BASE_URL = 'https://v3.football.api-sports.io';

// IDs de las ligas que queremos mostrar
const ARGENTINE_LEAGUES = {
    'primera_division': { id: 128, name: 'Primera División' }, // Liga Profesional Argentina
    'primera_b': { id: 131, name: 'Primera B' }, // Primera B Nacional
    'copa_argentina': { id: 130, name: 'Copa Argentina' }
};

const EUROPEAN_LEAGUES = {
    'premier_league': { id: 39, name: 'Premier League' },
    'laliga': { id: 140, name: 'La Liga' },
    'seriea': { id: 135, name: 'Serie A' },
    'bundesliga': { id: 78, name: 'Bundesliga' },
    'ligue1': { id: 61, name: 'Ligue 1' }
};

const EUROPEAN_CUPS = {
    'champions_league': { id: 2, name: 'UEFA Champions League' },
    'copa_rey': { id: 143, name: 'Copa del Rey' },
    'fa_cup': { id: 45, name: 'FA Cup' },
    'copa_italia': { id: 137, name: 'Copa Italia' },
    'dfb_pokal': { id: 81, name: 'DFB Pokal' },
    'coupe_france': { id: 66, name: 'Copa de Francia' }
};

const SOUTH_AMERICAN_CUPS = {
    'copa_libertadores': { id: 13, name: 'Copa Libertadores' },
    'copa_sudamericana': { id: 11, name: 'Copa Sudamericana' }
};

const WORLD_CUPS = {
    'mundial_clubes': { id: 15, name: 'Mundial de Clubes FIFA' }
};

// Función para formatear la fecha
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para crear una tarjeta de partido
function createMatchCard(match) {
    return `
        <div class="match-card">
            <div class="match-header">
                <span class="league-name">${match.league.name}</span>
                <span class="match-date">${formatDate(match.fixture.date)}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    <img src="${match.teams.home.logo}" alt="${match.teams.home.name}">
                    <span>${match.teams.home.name}</span>
                </div>
                <div class="match-score">
                    ${match.goals.home ?? 0} - ${match.goals.away ?? 0}
                </div>
                <div class="team">
                    <span>${match.teams.away.name}</span>
                    <img src="${match.teams.away.logo}" alt="${match.teams.away.name}">
                </div>
            </div>
            <div class="match-info">
                <span>${match.fixture.venue.name}</span>
            </div>
        </div>
    `;
}

// Función para obtener los partidos de una liga
async function getMatches(leagueId) {
    try {
        // Obtener todos los partidos de la temporada actual y la anterior
        const currentSeason = 2025;
        const previousSeason = 2024;
        
        // Hacer dos llamadas a la API, una para cada temporada
        const [currentSeasonResponse, previousSeasonResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/fixtures?league=${leagueId}&season=${currentSeason}`, {
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': API_KEY
                }
            }),
            fetch(`${API_BASE_URL}/fixtures?league=${leagueId}&season=${previousSeason}`, {
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': API_KEY
                }
            })
        ]);

        // Procesar las respuestas
        const responses = await Promise.all([
            currentSeasonResponse.json(),
            previousSeasonResponse.json()
        ]);

        // Combinar los resultados de ambas temporadas
        let allMatches = [];
        responses.forEach(data => {
            if (data.response && Array.isArray(data.response)) {
                allMatches = allMatches.concat(data.response);
            }
        });

        if (allMatches.length === 0) {
            console.log('No se encontraron partidos para esta liga');
            return [];
        }

        return allMatches;
    } catch (error) {
        console.error('Error completo:', error);
        const container = document.getElementById(`${leagueKey}-matches`);
        if (container) {
            if (error.message === 'API_KEY_INVALID') {
                container.innerHTML = `
                    <div class="error-message">
                        <h3>Error de Autenticación</h3>
                        <p>La API key no es válida. Por favor, registrarse en api-football.com y actualizar la API key en el código.</p>
                        <p>Pasos para obtener una API key válida:</p>
                        <ol>
                            <li>Visitar <a href="https://www.api-football.com/" target="_blank">api-football.com</a></li>
                            <li>Registrarse para obtener una cuenta</li>
                            <li>Obtener la API key desde el dashboard</li>
                            <li>Reemplazar la API key en el archivo main.js</li>
                        </ol>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="error-message">
                        <h3>Error al cargar los partidos</h3>
                        <p>Por favor, intenta más tarde.</p>
                        <p>Error: ${error.message}</p>
                    </div>
                `;
            }
        }
        return [];
    }
}

// Función para cargar los partidos de una liga específica
async function loadLeagueMatches(leagueKey, leagueData) {
    console.log('Cargando partidos para:', leagueKey, leagueData);
    const container = document.getElementById(`${leagueKey}-matches`);
    
    if (!container) {
        console.error(`No se encontró el contenedor para ${leagueKey}`);
        return;
    }

    // Mostrar mensaje de carga
    container.innerHTML = '<div class="loading">Cargando partidos...</div>';

    const matches = await getMatches(leagueData.id);
    
    if (matches.length === 0) {
        container.innerHTML = `
            <div class="no-matches">
                <h3>No hay partidos disponibles</h3>
                <p>No se encontraron partidos para mostrar en este momento.</p>
            </div>
        `;
        return;
    }

    // Obtener la fecha actual
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999); // Fin del día actual

    // Filtrar partidos hasta la fecha actual
    let filteredMatches = matches.filter(match => {
        const matchDate = new Date(match.fixture.date);
        return matchDate <= currentDate;
    });

    // Si no hay partidos hasta la fecha actual, mostrar los últimos partidos jugados
    if (filteredMatches.length === 0) {
        // Ordenar todos los partidos por fecha
        const allMatches = matches.sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));
        // Tomar los últimos partidos jugados (los más recientes)
        filteredMatches = allMatches.filter(match => {
            const matchDate = new Date(match.fixture.date);
            return matchDate < currentDate;
        });
    }

    // Ordenar los partidos por fecha de manera descendente (más recientes primero)
    const sortedMatches = filteredMatches.sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));
    
    // Agrupar partidos por mes y año
    const matchesByMonth = {};
    sortedMatches.forEach(match => {
        const date = new Date(match.fixture.date);
        // Usamos el timestamp como clave para mantener el orden correcto
        const timestamp = date.getTime();
        const monthYear = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        if (!matchesByMonth[timestamp]) {
            matchesByMonth[timestamp] = {
                label: monthYear,
                matches: []
            };
        }
        matchesByMonth[timestamp].matches.push(match);
    });

    // Crear el HTML con las secciones por mes, ordenadas por fecha
    let html = '';

    if (sortedMatches.length === 0) {
        html = `
            <div class="no-matches">
                <h3>No hay partidos disponibles</h3>
                <p>No se encontraron partidos para esta competición.</p>
            </div>
        `;
    } else {
        // Convertir el objeto a array y ordenar por timestamp (más reciente primero)
        const sortedMonths = Object.entries(matchesByMonth)
            .sort(([timestampA], [timestampB]) => Number(timestampB) - Number(timestampA));

        sortedMonths.forEach(([_, monthData]) => {
            html += `<h3>Partidos de ${monthData.label}</h3>`;
            html += monthData.matches.map(createMatchCard).join('');
        });
    }
    
    container.innerHTML = html;
}

// Cargar los partidos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    // Determinar qué ligas cargar basado en la página actual
    const currentPage = window.location.pathname;
    
    // Ligas Argentinas
    if (currentPage.includes('primera_division.html')) {
        loadLeagueMatches('primera_division', ARGENTINE_LEAGUES.primera_division);
        setInterval(() => loadLeagueMatches('primera_division', ARGENTINE_LEAGUES.primera_division), 300000);
    } else if (currentPage.includes('primera_b.html')) {
        loadLeagueMatches('primera_b', ARGENTINE_LEAGUES.primera_b);
        setInterval(() => loadLeagueMatches('primera_b', ARGENTINE_LEAGUES.primera_b), 300000);
    } else if (currentPage.includes('copa_argentina.html')) {
        loadLeagueMatches('copa_argentina', ARGENTINE_LEAGUES.copa_argentina);
        setInterval(() => loadLeagueMatches('copa_argentina', ARGENTINE_LEAGUES.copa_argentina), 300000);
    }
    // Ligas Europeas
    else if (currentPage.includes('premier_league.html')) {
        loadLeagueMatches('premier_league', EUROPEAN_LEAGUES.premier_league);
        setInterval(() => loadLeagueMatches('premier_league', EUROPEAN_LEAGUES.premier_league), 300000);
    } else if (currentPage.includes('laliga.html')) {
        loadLeagueMatches('laliga', EUROPEAN_LEAGUES.laliga);
        setInterval(() => loadLeagueMatches('laliga', EUROPEAN_LEAGUES.laliga), 300000);
    } else if (currentPage.includes('seriea.html')) {
        loadLeagueMatches('seriea', EUROPEAN_LEAGUES.seriea);
        setInterval(() => loadLeagueMatches('seriea', EUROPEAN_LEAGUES.seriea), 300000);
    } else if (currentPage.includes('bundesliga.html')) {
        loadLeagueMatches('bundesliga', EUROPEAN_LEAGUES.bundesliga);
        setInterval(() => loadLeagueMatches('bundesliga', EUROPEAN_LEAGUES.bundesliga), 300000);
    } else if (currentPage.includes('ligue1.html')) {
        loadLeagueMatches('ligue1', EUROPEAN_LEAGUES.ligue1);
        setInterval(() => loadLeagueMatches('ligue1', EUROPEAN_LEAGUES.ligue1), 300000);
    }
    // Copas Europeas
    else if (currentPage.includes('champions_league.html')) {
        loadLeagueMatches('champions_league', EUROPEAN_CUPS.champions_league);
        setInterval(() => loadLeagueMatches('champions_league', EUROPEAN_CUPS.champions_league), 300000);
    } else if (currentPage.includes('copa_rey.html')) {
        loadLeagueMatches('copa_rey', EUROPEAN_CUPS.copa_rey);
        setInterval(() => loadLeagueMatches('copa_rey', EUROPEAN_CUPS.copa_rey), 300000);
    } else if (currentPage.includes('fa_cup.html')) {
        loadLeagueMatches('fa_cup', EUROPEAN_CUPS.fa_cup);
        setInterval(() => loadLeagueMatches('fa_cup', EUROPEAN_CUPS.fa_cup), 300000);
    } else if (currentPage.includes('copa_italia.html')) {
        loadLeagueMatches('copa_italia', EUROPEAN_CUPS.copa_italia);
        setInterval(() => loadLeagueMatches('copa_italia', EUROPEAN_CUPS.copa_italia), 300000);
    } else if (currentPage.includes('dfb_pokal.html')) {
        loadLeagueMatches('dfb_pokal', EUROPEAN_CUPS.dfb_pokal);
        setInterval(() => loadLeagueMatches('dfb_pokal', EUROPEAN_CUPS.dfb_pokal), 300000);
    } else if (currentPage.includes('coupe_france.html')) {
        loadLeagueMatches('coupe_france', EUROPEAN_CUPS.coupe_france);
        setInterval(() => loadLeagueMatches('coupe_france', EUROPEAN_CUPS.coupe_france), 300000);
    }
    // Copas Sudamericanas
    else if (currentPage.includes('copa_libertadores.html')) {
        loadLeagueMatches('copa_libertadores', SOUTH_AMERICAN_CUPS.copa_libertadores);
        setInterval(() => loadLeagueMatches('copa_libertadores', SOUTH_AMERICAN_CUPS.copa_libertadores), 300000);
    } else if (currentPage.includes('copa_sudamericana.html')) {
        loadLeagueMatches('copa_sudamericana', SOUTH_AMERICAN_CUPS.copa_sudamericana);
        setInterval(() => loadLeagueMatches('copa_sudamericana', SOUTH_AMERICAN_CUPS.copa_sudamericana), 300000);
    }
    // Mundial de Clubes
    else if (currentPage.includes('mundialclubes.html')) {
        loadLeagueMatches('mundial_clubes', WORLD_CUPS.mundial_clubes);
        setInterval(() => loadLeagueMatches('mundial_clubes', WORLD_CUPS.mundial_clubes), 300000);
    }
}); 