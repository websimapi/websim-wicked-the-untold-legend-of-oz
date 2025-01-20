import { Character } from './character.js';
import { World } from './world.js';
import { QuestSystem } from './quest-system.js';
import { DialogSystem } from './dialog-system.js';
import { CombatSystem } from './combat-system.js';

class Game {
  constructor() {
    this.selectedCharacter = null;
    this.world = null;
    this.questSystem = null;
    this.dialogSystem = null;
    this.combatSystem = null;
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.querySelectorAll('.character').forEach(char => {
      char.addEventListener('click', (e) => this.handleCharacterSelect(e));
    });

    document.getElementById('start-game').addEventListener('click', () => {
      if (this.selectedCharacter) {
        this.startGame();
      }
    });
  }

  handleCharacterSelect(e) {
    const character = e.currentTarget.dataset.character;
    document.querySelectorAll('.character').forEach(char => {
      char.style.border = 'none';
    });
    e.currentTarget.style.border = '2px solid white';
    this.selectedCharacter = character;
  }

  startGame() {
    document.getElementById('title-screen').classList.remove('active');
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-world').classList.remove('hidden');

    this.world = new World();
    this.questSystem = new QuestSystem();
    this.dialogSystem = new DialogSystem();
    this.combatSystem = new CombatSystem();

    const characterClass = this.selectedCharacter === 'elphaba' ? 
      Character.createElphaba() : Character.createGlinda();
    
    this.player = new characterClass(this.world);
    
    // Start the game loop
    this.gameLoop();
  }

  gameLoop() {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    if (this.player) {
      this.player.update();
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
    if (this.dialogSystem) {
      this.dialogSystem.render();
    }
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  new Game();
});