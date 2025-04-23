const apiKeyWeather = 'eeae2e977efa163354ea9e8e5dcbd80c';
const apiKeyUnsplash = 'GI5Cz2Ya12ytzYa8plgfmT0k34OqeTVSpGUbv7vNjVE';

let countries = []; // Lista de países e capitais
let currentQuestion = null; // Pergunta atual

// Fetch all countries and capitals from the API
function fetchCountries() {
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
      countries = data
        .map(country => ({
          name: country.name.common,
          capital: country.capital ? country.capital[0] : null,
        }))
        .filter(country => country.capital); // Filtrar países sem capitais
      getRandomQuestion(); // Gerar a primeira pergunta
    })
    .catch(error => console.error('Error fetching countries:', error));
}

// Generate answer buttons dynamically
function generateAnswerButtons() {
  const answersContainer = document.getElementById('answers-container');
  answersContainer.innerHTML = ''; // Limpar respostas anteriores

  // Criar botões de resposta
  const correctAnswer = currentQuestion.capital;
  const wrongAnswers = countries
    .filter(country => country.capital !== correctAnswer)
    .sort(() => 0.5 - Math.random()) // Embaralhar
    .slice(0, 3) // Selecionar 3 respostas erradas
    .map(country => country.capital);

  const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random()); // Embaralhar todas as respostas

  allAnswers.forEach(answer => {
    const button = document.createElement('button');
    button.textContent = answer;
    button.onclick = () => checkAnswer(answer);
    answersContainer.appendChild(button);
  });
}

// Select a random question
function getRandomQuestion() {
  if (countries.length === 0) {
    console.error('No countries available to generate questions.');
    return;
  }

  // Limpar resultados anteriores
  document.getElementById('result').innerHTML = '';
  document.getElementById('image-container').innerHTML = '';
  document.getElementById('weather-container').innerHTML = '';

  // Redefinir o estilo do contêiner de respostas
  const answersContainer = document.getElementById('answers-container');
  answersContainer.innerHTML = ''; // Limpa o conteúdo
  answersContainer.style.backgroundColor = ''; // Remove o fundo verde
  answersContainer.style.padding = ''; // Remove o padding
  answersContainer.style.borderRadius = ''; // Remove as bordas arredondadas
  answersContainer.style.display = ''; // Remove o layout flex
  answersContainer.style.flexDirection = ''; // Remove a direção do flexbox
  answersContainer.style.justifyContent = ''; // Remove a centralização vertical
  answersContainer.style.alignItems = ''; // Remove a centralização horizontal

  // Selecionar uma nova pergunta aleatória
  const randomIndex = Math.floor(Math.random() * countries.length);
  currentQuestion = countries[randomIndex];

  // Atualizar a pergunta
  document.getElementById('question').innerHTML = `What is the capital of <strong>${currentQuestion.name}</strong>?`;

  generateAnswerButtons(); // Gerar botões de resposta
}

// Check the answer
function checkAnswer(answer) {
  const answersContainer = document.getElementById('answers-container');
  const resultContainer = document.getElementById('result');

  if (answer.toLowerCase() === currentQuestion.capital.toLowerCase()) {
    // Exibe a mensagem de acerto
    resultContainer.innerHTML = 'You got it right!';
    resultContainer.style.color = '#FFFFFF'; // Texto branco
    resultContainer.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)'; // Sombra preta

    // Centraliza a resposta correta
    answersContainer.innerHTML = `
      <div style="text-align: center; font-size: 1.2em; font-weight: bold; color: #FFFFFF; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">
        ${answer}
      </div>
    `;

    // Torna o contêiner verde e ajusta o tamanho
    answersContainer.style.backgroundColor = '#28a745'; // Verde
    answersContainer.style.padding = '15px'; // Reduz o padding
    answersContainer.style.borderRadius = '10px'; // Bordas arredondadas
    answersContainer.style.display = 'flex'; // Usa flexbox
    answersContainer.style.flexDirection = 'column'; // Organiza os itens verticalmente
    answersContainer.style.justifyContent = 'center'; // Centraliza verticalmente
    answersContainer.style.alignItems = 'center'; // Centraliza horizontalmente

    // Exibe informações adicionais
    showCapitalInfo(currentQuestion.name);
  } else {
    // Exibe a mensagem de erro
    resultContainer.innerHTML = 'You got it wrong! Try again.';
    adjustErrorTextStyle(); // Ajusta o estilo do texto de erro
    document.getElementById('image-container').innerHTML = '';
    document.getElementById('weather-container').innerHTML = '';
  }
}

// Show information about the capital
function showCapitalInfo(country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(response => response.json())
    .then(data => {
      if (data && data[0] && data[0].capital) {
        const capital = data[0].capital[0];
        fetchImageAndWeather(capital);
      } else {
        console.error('Invalid data returned by the countries API:', data);
      }
    })
    .catch(error => console.error('Error fetching country:', error));
}

// Fetch image and weather data
function fetchImageAndWeather(city) {
  // Fetch image from Unsplash
  fetch(`https://api.unsplash.com/search/photos?query=${city} tourist attraction&client_id=${apiKeyUnsplash}`)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results[0] && data.results[0].urls) {
        const imageUrl = data.results[0].urls.regular;

        // Atualizar a imagem
        const imageContainer = document.getElementById('image-container');
        const isMobile = window.innerWidth <= 768; // Verifica se é versão mobile
        const imageHeight = isMobile ? '200px' : '400px'; // Define altura menor para mobile

        imageContainer.innerHTML = `<img src="${imageUrl}" alt="Photo of ${city}" style="width: 100%; height: ${imageHeight}; object-fit: cover; border-radius: 10px;">`;
      } else {
        console.error('Invalid data returned by the Unsplash API:', data);
        document.getElementById('image-container').innerHTML = 'Image not found.';
      }
    })
    .catch(error => console.error('Error fetching image:', error));

  // Fetch weather data
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyWeather}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.main && data.weather && data.weather[0]) {
        const temperature = data.main.temp;
        const description = data.weather[0].description.toLowerCase();
        const iconCode = data.weather[0].icon; // Código do ícone
        const weatherIcon = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // URL do ícone

        // Atualize o contêiner de clima
        document.getElementById('weather-container').innerHTML = `
          <div id="weather-info" style="display: flex; align-items: center; justify-content: center; gap: 15px; padding: 10px;">
            <img src="${weatherIcon}" alt="${description}" style="width: 60px; height: 60px;" />
            <div style="text-align: left;">
              <p style="margin: 0; font-weight: bold;">${description.charAt(0).toUpperCase() + description.slice(1)}</p>
              <p style="margin: 0;">Temperature: ${temperature.toFixed(1)}°C</p>
            </div>
          </div>
        `;
      } else {
        document.getElementById('weather-container').innerHTML = 'Weather not found.';
        console.error('Invalid data returned by the OpenWeatherMap API:', data);
      }
    })
    .catch(error => console.error('Error fetching weather:', error));
}

// Adjust weather text style
function adjustWeatherTextStyle() {
  const weatherInfo = document.getElementById('weather-info');

  // Verifica se a largura da tela é menor ou igual a 768px (versão mobile)
  if (window.innerWidth <= 768) {
    weatherInfo.style.color = '#FFFFFF'; // Define o texto como branco
    weatherInfo.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)'; // Adiciona sombra ao texto
    weatherInfo.style.textAlign = 'center'; // Centraliza o texto
  } else {
    // Remove os estilos para versões desktop
    weatherInfo.style.color = '';
    weatherInfo.style.textShadow = '';
    weatherInfo.style.textAlign = '';
  }
}

// Adjust error text style
function adjustErrorTextStyle() {
  const resultContainer = document.getElementById('result');

  // Verifica se a largura da tela é menor ou igual a 768px (versão mobile)
  if (window.innerWidth <= 768) {
    resultContainer.style.color = '#FFFFFF'; // Define o texto como branco
    resultContainer.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)'; // Adiciona sombra ao texto
  } else {
    // Remove os estilos para versões desktop
    resultContainer.style.color = '#FF0000'; // Volta para vermelho
    resultContainer.style.textShadow = 'none'; // Remove a sombra
  }
}

// Ajusta o estilo ao carregar a página e ao redimensionar a janela
window.addEventListener('load', adjustWeatherTextStyle);
window.addEventListener('resize', adjustWeatherTextStyle);
window.addEventListener('load', adjustErrorTextStyle);
window.addEventListener('resize', adjustErrorTextStyle);

// Initialize the game
fetchCountries();
