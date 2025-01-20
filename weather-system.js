export class WeatherSystem {
  constructor(world) {
    this.world = world;
    this.currentWeather = 'clear';
    this.weatherIntensity = 0;
    this.transitionTime = 0;
    this.weatherDuration = 0;
    
    this.particles = [];
    this.maxParticles = 100;
    
    this.weatherTypes = {
      clear: {
        probability: 0.4,
        duration: { min: 10, max: 30 },
        effects: []
      },
      rain: {
        probability: 0.3,
        duration: { min: 5, max: 15 },
        effects: ['reduceVisibility', 'wetGround']
      },
      storm: {
        probability: 0.1,
        duration: { min: 3, max: 8 },
        effects: ['lightning', 'thunder', 'heavyRain']
      },
      fog: {
        probability: 0.2,
        duration: { min: 4, max: 12 },
        effects: ['heavyMist', 'reduceVisibility']
      }
    };

    this.initializeWeather();
  }

  initializeWeather() {
    this.setupWeatherContainer();
    this.scheduleNextWeatherChange();
  }

  setupWeatherContainer() {
    const container = document.createElement('div');
    container.id = 'weather-container';
    container.className = 'weather-container';
    document.getElementById('game-world').appendChild(container);
  }

  update(deltaTime) {
    this.updateWeatherTransition(deltaTime);
    this.updateParticles(deltaTime);
    this.updateWeatherEffects();
  }

  updateWeatherTransition(deltaTime) {
    if (this.transitionTime > 0) {
      this.transitionTime -= deltaTime;
      this.weatherIntensity = Math.max(0, Math.min(1, 1 - (this.transitionTime / 2)));
    }

    if (this.weatherDuration > 0) {
      this.weatherDuration -= deltaTime;
      if (this.weatherDuration <= 0) {
        this.scheduleNextWeatherChange();
      }
    }
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return particle.isAlive();
    });

    // Add new particles if needed
    while (this.particles.length < this.maxParticles * this.weatherIntensity) {
      this.addParticle();
    }
  }

  addParticle() {
    switch (this.currentWeather) {
      case 'rain':
        this.particles.push(new RainDrop());
        break;
      case 'storm':
        this.particles.push(new StormDrop());
        if (Math.random() < 0.01) {
          this.createLightning();
        }
        break;
      case 'fog':
        this.particles.push(new FogParticle());
        break;
    }
  }

  createLightning() {
    const flash = document.createElement('div');
    flash.className = 'lightning-flash';
    document.getElementById('weather-container').appendChild(flash);

    // Create thunder sound after delay
    setTimeout(() => {
      const thunder = new Audio('thunder.mp3');
      thunder.volume = Math.random() * 0.5 + 0.2;
      thunder.play();
    }, Math.random() * 3000);

    // Remove flash
    setTimeout(() => flash.remove(), 100);
  }

  scheduleNextWeatherChange() {
    const weights = Object.entries(this.weatherTypes).map(([type, data]) => ({
      type,
      weight: data.probability
    }));

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const { type, weight } of weights) {
      random -= weight;
      if (random <= 0) {
        this.changeWeather(type);
        break;
      }
    }
  }

  changeWeather(newWeather) {
    const weatherData = this.weatherTypes[newWeather];
    this.currentWeather = newWeather;
    this.transitionTime = 2; // 2 seconds transition
    this.weatherDuration = Math.random() * 
      (weatherData.duration.max - weatherData.duration.min) + 
      weatherData.duration.min;
    
    this.world.triggerEvent('weatherChange', {
      type: newWeather,
      intensity: this.weatherIntensity,
      effects: weatherData.effects
    });
  }

  updateWeatherEffects() {
    const container = document.getElementById('weather-container');
    container.className = `weather-container weather-${this.currentWeather}`;
    container.style.opacity = this.weatherIntensity;

    // Update particle effects
    this.particles.forEach(particle => particle.render());
  }
}

// Particle Classes
class WeatherParticle {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'weather-particle';
    document.getElementById('weather-container').appendChild(this.element);
    this.reset();
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = -10;
    this.speed = Math.random() * 200 + 100;
    this.lifetime = 1;
  }

  update(deltaTime) {
    this.y += this.speed * deltaTime;
    this.lifetime -= deltaTime;
    if (this.y > window.innerHeight) {
      this.reset();
    }
  }

  render() {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  isAlive() {
    return this.lifetime > 0;
  }
}

class RainDrop extends WeatherParticle {
  constructor() {
    super();
    this.element.className = 'weather-particle rain-drop';
  }
}

class StormDrop extends WeatherParticle {
  constructor() {
    super();
    this.element.className = 'weather-particle storm-drop';
    this.speed *= 1.5;
  }
}

class FogParticle extends WeatherParticle {
  constructor() {
    super();
    this.element.className = 'weather-particle fog-particle';
    this.speed *= 0.1;
  }

  reset() {
    super.reset();
    this.x = Math.random() * (window.innerWidth + 100) - 50;
    this.y = Math.random() * window.innerHeight;
    this.lifetime = Math.random() * 5 + 5;
  }
}