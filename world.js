import { NPCSystem } from './npc-system.js';
import { EnvironmentSystem } from './environment-system.js';
import { TimeSystem } from './time-system.js';
import { WeatherSystem } from './weather-system.js';

export class World {
  constructor() {
    this.regions = new Map();
    this.currentRegion = null;
    this.events = new Map(); // Event system must be initialized first
    
    // Initialize core systems with this reference
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
    this.events.set('gameStart', (data) => {
      console.log('Game started - world events initialized');
      // Trigger initial world state changes
      this.changeRegion('Emerald City');
      this.updateWeather();
      this.updateTime();
    });

    this.events.set('regionChange', (data) => {
      console.log(`Changing to region: ${data.newRegion}`);
      this.changeRegion(data.newRegion);
    });

    this.events.set('weatherChange', (data) => {
      console.log(`Weather changing to: ${data.weatherType}`);
      // Implement weather change logic
    });
  }

  // Update event trigger method to be more robust
  triggerEvent(eventName, data) {
    if (!this.events.has(eventName)) {
      console.warn(`No handler found for event: ${eventName}`);
      return false;
    }
    try {
      const handler = this.events.get(eventName);
      handler(data);
      return true;
    } catch (error) {
      console.error(`Error triggering event ${eventName}:`, error);
      return false;
    }
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