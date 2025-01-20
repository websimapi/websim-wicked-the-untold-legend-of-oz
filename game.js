import { Character } from './character.js';
import { World } from './world.js';
import { QuestSystem } from './quest-system.js';
import { DialogSystem } from './dialog-system.js';
import { CombatSystem } from './combat-system.js';

class Game {
  constructor() {
    // Core game state
    this.selectedCharacter = null;
    this.world = null;
    this.questSystem = null;
    this.dialogSystem = null;
    this.combatSystem = null;
    this.player = null;
    
    // Game state flags
    this.isGameStarted = false;
    this.isPaused = false;
    
    // UI elements cache
    this.gameContainer = document.getElementById('game-container');
    this.worldMap = document.getElementById('world-map');
    this.playerElement = document.getElementById('player');
    this.magicMeter = document.querySelector('.magic-meter');
    this.healthMeter = document.querySelector('.health-meter');
    
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.setupCharacterPreview();
  }

  setupEventListeners() {
    // Character selection events
    document.querySelectorAll('.character').forEach(char => {
      char.addEventListener('click', (e) => {
        this.handleCharacterSelect(e);
        this.updateCharacterPreview(e.currentTarget.dataset.character);
      });
    });

    // Game start event
    document.getElementById('start-game').addEventListener('click', () => {
      if (this.selectedCharacter) {
        this.startGame();
      } else {
        // Show selection required message
        this.showMessage('Please select a character first!');
      }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  handleKeyPress(e) {
    if (!this.isGameStarted) return;

    switch(e.key.toLowerCase()) {
      case 'escape':
        this.togglePause();
        break;
      case 'i':
        this.toggleInventory();
        break;
      case 'q':
        this.toggleQuestLog();
        break;
      // Add more keyboard shortcuts as needed
    }
  }

  setupCharacterPreview() {
    // Create preview animations for character selection
    document.querySelectorAll('.character').forEach(char => {
      const portrait = char.querySelector('.character-portrait');
      
      // Add hover effects
      char.addEventListener('mouseenter', () => {
        gsap.to(portrait, {
          scale: 1.1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      char.addEventListener('mouseleave', () => {
        gsap.to(portrait, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
  }

  updateCharacterPreview(character) {
    // Update character stats preview
    const statsPreview = `
      <div class="stats-preview">
        <h3>Character Stats</h3>
        <ul>
          ${this.getCharacterStats(character).map(stat => 
            `<li>${stat.name}: ${stat.value}</li>`
          ).join('')}
        </ul>
      </div>
    `;
    
    // Update preview section
    const previewSection = document.querySelector('.character-preview') 
      || document.createElement('div');
    previewSection.className = 'character-preview';
    previewSection.innerHTML = statsPreview;
  }

  getCharacterStats(character) {
    return character === 'elphaba' ? [
      { name: 'Dark Magic', value: 80 },
      { name: 'Flight', value: 70 },
      { name: 'Rebellion', value: 90 }
    ] : [
      { name: 'Light Magic', value: 75 },
      { name: 'Charm', value: 90 },
      { name: 'Leadership', value: 85 }
    ];
  }

  startGame() {
    this.isGameStarted = true;
    
    // Hide title screen and show game world
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-world').classList.remove('hidden');

    // Initialize game systems
    this.initializeGameSystems();
    
    // Create and position player
    this.createPlayer();
    
    // Start initial quest
    this.startInitialQuest();
    
    // Begin game loop
    this.gameLoop();
  }

  initializeGameSystems() {
    this.world = new World();
    this.questSystem = new QuestSystem();
    this.dialogSystem = new DialogSystem();
    this.combatSystem = new CombatSystem();
    
    // Set initial world region
    this.world.changeRegion('Emerald City');
  }

  createPlayer() {
    // Create character instance
    this.player = this.selectedCharacter === 'elphaba' 
      ? Character.createElphaba(this.world)
      : Character.createGlinda(this.world);
    
    // Set initial position
    this.player.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Initialize UI elements
    this.updatePlayerUI();
  }

  updatePlayerUI() {
    // Update health and magic meters
    const healthPercent = (this.player.stats.health / 100) * 100;
    const magicPercent = (this.player.stats.magic / 100) * 100;
    
    this.healthMeter.innerHTML = `
      <div class="meter-fill" style="width: ${healthPercent}%"></div>
      <span class="meter-text">Health: ${Math.round(this.player.stats.health)}</span>
    `;
    
    this.magicMeter.innerHTML = `
      <div class="meter-fill" style="width: ${magicPercent}%"></div>
      <span class="meter-text">Magic: ${Math.round(this.player.stats.magic)}</span>
    `;
  }

  startInitialQuest() {
    // Start the first quest based on character
    const initialQuest = this.selectedCharacter === 'elphaba' 
      ? 'wizard-truth' 
      : 'social-reform';
    
    this.questSystem.startQuest(initialQuest);
    
    // Show initial dialog
    this.showInitialDialog();
  }

  showInitialDialog() {
    const initialDialog = {
      text: `Welcome, ${this.selectedCharacter === 'elphaba' ? 'Elphaba' : 'Glinda'}. 
             Your journey in Oz begins now.`,
      choices: [
        {
          text: "I'm ready to begin",
          consequence: () => {
            // Start first mission
            this.world.triggerEvent('gameStart');
          }
        }
      ]
    };
    
    this.dialogSystem.startDialog([initialDialog]);
  }

  gameLoop() {
    const loop = () => {
      if (!this.isPaused) {
        this.update();
        this.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    if (this.player) {
      this.player.update();
      this.updatePlayerUI();
    }
    if (this.world) {
      this.world.update();
    }
    if (this.combatSystem) {
      this.combatSystem.update();
    }
  }

  render() {
    if (this.world) {
      this.world.render();
    }
    if (this.player) {
      this.player.render();
    }
  }

  handleCharacterSelect(e) {
    const character = e.currentTarget.dataset.character;
    document.querySelectorAll('.character').forEach(char => {
      char.style.border = 'none';
    });
    e.currentTarget.style.border = '2px solid white';
    this.selectedCharacter = character;
  }

  // Utility methods
  showMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.textContent = text;
    this.gameContainer.appendChild(messageElement);
    
    setTimeout(() => messageElement.remove(), 3000);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    // Show/hide pause menu
  }

  toggleInventory() {
    // Toggle inventory visibility
  }

  toggleQuestLog() {
    // Toggle quest log visibility
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  new Game();
});