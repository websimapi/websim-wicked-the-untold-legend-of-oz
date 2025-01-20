export class World {
  constructor() {
    this.regions = new Map();
    this.currentRegion = null;
    this.weatherSystem = null;
    this.timeSystem = null;
    this.events = new Map(); // Add event system
    this.npcSystem = new NPCSystem(this);
    this.environmentSystem = new EnvironmentSystem(this);
    this.timeSystem = new TimeSystem(this);
    this.weatherSystem = new WeatherSystem(this);
    this.gameContainer = document.getElementById('game-container') || document.createElement('div');
    this.initializeWorld();
  }

  initializeWorld() {
    this.createRegions();
    this.setupWeatherSystem();
    this.setupTimeSystem();
    this.setupEventHandlers();
  }

  // Add event system methods
  setupEventHandlers() {
    // Set up default event handlers
    this.events.set('gameStart', () => {
      console.log('Game started - world events initialized');
      // Trigger initial world state changes
      this.changeRegion('Emerald City');
      this.updateWeather();
      this.updateTime();
    });

    this.events.set('regionChange', (newRegion) => {
      console.log(`Changing to region: ${newRegion}`);
      this.changeRegion(newRegion);
    });

    this.events.set('weatherChange', (weatherType) => {
      console.log(`Weather changing to: ${weatherType}`);
      // Implement weather change logic
    });
  }

  // Add event trigger method
  triggerEvent(eventName, ...args) {
    if (this.events.has(eventName)) {
      const handler = this.events.get(eventName);
      handler(...args);
      return true;
    }
    console.warn(`No handler found for event: ${eventName}`);
    return false;
  }

  // Add event registration method
  on(eventName, handler) {
    this.events.set(eventName, handler);
  }

  createRegions() {
    const regions = [
      {
        name: 'Emerald City',
        type: 'city',
        climate: 'temperate',
        politicalStatus: 'capital'
      },
      {
        name: 'Munchkinland',
        type: 'rural',
        climate: 'fertile',
        politicalStatus: 'rebellious'
      },
      {
        name: 'Western Woods',
        type: 'wilderness',
        climate: 'dark',
        politicalStatus: 'disputed'
      }
    ];

    regions.forEach(region => {
      this.regions.set(region.name, region);
    });
  }

  update(deltaTime) {
    this.timeSystem.update();
    this.weatherSystem.update(deltaTime);
    this.updateWeather();
    this.updateTime();
    this.updatePoliticalStatus();
    this.npcSystem.getNPCsInRegion(this.currentRegion?.name)?.forEach(npc => npc.update());
    Array.from(this.environmentSystem.objects.values())
      .filter(obj => obj.region === this.currentRegion?.name)
      .forEach(obj => obj.update());
  }

  render() {
    if (this.currentRegion) {
      this.renderCurrentRegion();
      this.renderWeatherEffects();
      this.renderTimeEffects();
    }
    this.npcSystem.getNPCsInRegion(this.currentRegion?.name)?.forEach(npc => npc.render());
    Array.from(this.environmentSystem.objects.values())
      .filter(obj => obj.region === this.currentRegion?.name)
      .forEach(obj => obj.render());

    // Update time display
    const timeDisplay = document.querySelector('.time-display') 
      || document.createElement('div');
    timeDisplay.className = 'time-display';
    timeDisplay.textContent = this.timeSystem.getTimeString();
    this.gameContainer.appendChild(timeDisplay);
  }

  updatePoliticalStatus() {
    // Update region politics based on player actions
  }

  changeRegion(regionName) {
    if (this.regions.has(regionName)) {
      this.currentRegion = this.regions.get(regionName);
      return true;
    }
    return false;
  }

  setupWeatherSystem() {
    // Initialize weather system
  }

  setupTimeSystem() {
    // Initialize time system
  }

  updateWeather() {
    // Update weather conditions
  }

  updateTime() {
    // Update time of day
  }

  renderCurrentRegion() {
    const worldMap = document.getElementById('world-map');
    if (!worldMap) return;

    // Clear existing content
    worldMap.innerHTML = '';

    // Create region visualization
    const regionElement = document.createElement('div');
    regionElement.className = `region ${this.currentRegion.type}`;
    regionElement.innerHTML = `
      <h2>${this.currentRegion.name}</h2>
      <div class="region-climate">${this.currentRegion.climate}</div>
      <div class="region-status">${this.currentRegion.politicalStatus}</div>
    `;

    worldMap.appendChild(regionElement);
  }

  renderWeatherEffects() {
    // Render weather effects
  }

  renderTimeEffects() {
    // Render time of day effects
  }
}

// Assuming NPCSystem, EnvironmentSystem, TimeSystem and WeatherSystem classes are defined elsewhere