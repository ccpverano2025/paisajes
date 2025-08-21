// --- VARIABLES GLOBALES ---
let slides = [];        // Almacenará los datos de las diapositivas
let currentIndex = 0;   // Índice de la diapositiva actual
let playing = true;     // Estado de reproducción (play/pause)
let interval;           // Referencia al intervalo de cambio automático
let effect = "fade";    // Efecto de animación actual
let speed = 4000;       // Velocidad de transición en milisegundos

// --- ELEMENTOS DEL DOM ---
const slideImage = document.querySelector(".slide-image"); // Contenedor de la imagen
const caption = document.querySelector(".caption");        // Elemento del texto
const indicators = document.querySelector(".indicators");  // Contenedor de indicadores

// --- CARGA INICIAL DE DATOS ---
// Carga el archivo JSON con la información de las diapositivas
fetch("slides.json")
  .then(res => res.json())     // Convierte la respuesta a JSON
  .then(data => {
    slides = data;             // Almacena los datos
    initSlideshow();           // Inicializa el slideshow
  });

// --- INICIALIZACIÓN DEL SLIDESHOW ---
function initSlideshow() {
  createIndicators();  // Crea los indicadores (puntos de navegación)
  updateSlide();       // Muestra la primera diapositiva
  // Configura el intervalo para cambio automático
  interval = setInterval(nextSlide, speed);
  // Añade listeners para resetear el fade de controles
  addFadeResetListeners();
}

// --- CREACIÓN DE INDICADORES (PUNTOS DE NAVEGACIÓN) ---
function createIndicators() {
  indicators.innerHTML = ""; // Limpia contenedor existente
  
  // Crea un punto por cada diapositiva
  slides.forEach((_, i) => {
    const dot = document.createElement("span"); // Crea elemento span
    // Añade evento para ir a la diapositiva correspondiente al hacer clic
    dot.addEventListener("click", () => goToSlide(i));
    indicators.appendChild(dot); // Añade el punto al contenedor
  });
}

// --- ACTUALIZACIÓN DE INDICADORES ACTIVOS ---
function updateIndicators() {
  const dots = indicators.querySelectorAll("span"); // Obtiene todos los puntos
  
  // Añade/quita la clase 'active' según corresponda
  dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
}

// --- ACTUALIZACIÓN DE LA DIAPOSITIVA VISIBLE ---
function updateSlide() {
  // Cambia la imagen de fondo
  slideImage.style.backgroundImage = `url(${slides[currentIndex].url})`;
  // Actualiza el texto descriptivo
  caption.textContent = slides[currentIndex].title;

  // Reinicia animaciones para forzar su reactivación
  slideImage.classList.remove("fade", "kenburns", "pan");
  void slideImage.offsetWidth; // Truco para reiniciar animaciones CSS
  slideImage.classList.add(effect); // Aplica el efecto actual

  updateIndicators(); // Actualiza los indicadores
}

// --- NAVEGACIÓN ENTRE DIAPOSITIVAS ---

// Avanza a la siguiente diapositiva
function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length; // Circular (vuelve al inicio)
  updateSlide();
}

// Retrocede a la diapositiva anterior
function prevSlide() {
  // Cálculo circular con manejo de números negativos
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateSlide();
}

// Salta a una diapositiva específica
function goToSlide(index) {
  currentIndex = index;
  updateSlide();
}

// --- RESETEO DEL FADE EN CONTROLES ---
function resetControlsFade() {
  const controls = document.querySelector('.controls');
  const caption = document.querySelector('.caption');
  const indicators = document.querySelector('.indicators');
  
  // Vuelve completamente opacos todos los controles
  controls.style.opacity = '1';
  caption.style.opacity = '1';
  indicators.style.opacity = '1';
  
  // Espera breve para reiniciar las transiciones
  setTimeout(() => {
    // Restablece la transición suave de 2 segundos
    controls.style.transition = 'opacity 2s ease-in-out';
    caption.style.transition = 'opacity 2s ease-in-out';
    indicators.style.transition = 'opacity 2s ease-in-out';
    
    // Inicia el fade out después de un breve momento
    setTimeout(() => {
      controls.style.opacity = '0.3';
      caption.style.opacity = '0.3';
      indicators.style.opacity = '0.3';
    }, 100);
  }, 10);
}

// --- CONFIGURACIÓN DE EVENT LISTENERS PARA RESETEO DE FADE ---
function addFadeResetListeners() {
  // Selecciona todos los elementos interactivos
  const controls = document.querySelectorAll('.controls button, .controls select, .controls input, .indicators span');
  
  // Añade eventos de clic y touch a cada control
  controls.forEach(control => {
    control.addEventListener('click', resetControlsFade);
    control.addEventListener('touchstart', resetControlsFade);
  });
  
  // Eventos adicionales para controles específicos
  document.getElementById('speed').addEventListener('input', resetControlsFade);
  document.getElementById('effect').addEventListener('change', resetControlsFade);
}

// --- EVENT LISTENERS PARA CONTROLES PRINCIPALES ---

// Botón Siguiente
document.getElementById("next").addEventListener("click", () => {
  nextSlide();
  resetControlsFade(); // Resetea el fade de controles
});

// Botón Anterior
document.getElementById("prev").addEventListener("click", () => {
  prevSlide();
  resetControlsFade(); // Resetea el fade de controles
});

// Botón Aleatorio
document.getElementById("random").addEventListener("click", () => {
  currentIndex = Math.floor(Math.random() * slides.length); // Índice aleatorio
  updateSlide();
  resetControlsFade(); // Resetea el fade de controles
});

// Botón Play/Pause
document.getElementById("playPause").addEventListener("click", () => {
  playing = !playing; // Alterna estado
  
  if (playing) {
    // Si está reproduciendo, reinicia el intervalo
    interval = setInterval(nextSlide, speed);
    document.getElementById("playPause").textContent = "⏸ Pausar";
  } else {
    // Si está pausado, detiene el intervalo
    clearInterval(interval);
    document.getElementById("playPause").textContent = "▶️ Reproducir";
  }
  resetControlsFade(); // Resetea el fade de controles
});

// Control de Velocidad
document.getElementById("speed").addEventListener("input", (e) => {
  speed = e.target.value; // Actualiza velocidad
  clearInterval(interval); // Detiene intervalo actual
  if (playing) {
    // Si está reproduciendo, reinicia con nueva velocidad
    interval = setInterval(nextSlide, speed);
  }
  resetControlsFade(); // Resetea el fade de controles
});

// Selector de Efectos
document.getElementById("effect").addEventListener("change", (e) => {
  effect = e.target.value; // Actualiza efecto
  updateSlide();           // Aplica el nuevo efecto
  resetControlsFade();     // Resetea el fade de controles
});

// Botón Pantalla Completa
document.getElementById("fullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    // Si no está en pantalla completa, activarla
    document.documentElement.requestFullscreen();
  } else {
    // Si está en pantalla completa, salir
    document.exitFullscreen();
  }
  resetControlsFade(); // Resetea el fade de controles
});