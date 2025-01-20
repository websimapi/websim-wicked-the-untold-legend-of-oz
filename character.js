export class Character {
  constructor(world, config) {
    this.world = world;
    this.config = config;
    this.position = { x: 0, y: 0 };
    this.stats = {
      health: 100,
      magic: 100,
      strength: config.baseStrength || 50,
      charisma: config.baseCharisma || 50
    };
    this.abilities = new Set(config.defaultAbilities || []);
    this.relationships = new Map();
    this.inventory = new Set();
    this.characterType = config.characterType || 'none';
  }

  static createElphaba(world) {
    return new Character(world, {
      characterType: 'elphaba',
      baseStrength: 70,
      baseCharisma: 50,
      defaultAbilities: ['darkMagic', 'flight', 'alchemy']
    });
  }

  static createGlinda(world) {
    return new Character(world, {
      characterType: 'glinda',
      baseStrength: 40,
      baseCharisma: 80,
      defaultAbilities: ['lightMagic', 'charm', 'diplomacy']
    });
  }

  update() {
    this.updatePosition();
    this.updateStats();
    this.checkInteractions();
  }

  render() {
    // Get the player element
    const playerElement = document.getElementById('player');
    if (!playerElement) return;

    // Update player position and appearance
    playerElement.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    
    // Update player appearance based on character type
    playerElement.className = `player-character ${this.characterType}`;
  }

  updatePosition() {
    // Basic WASD movement
    document.addEventListener('keydown', (e) => {
      const speed = 5;
      switch(e.key.toLowerCase()) {
        case 'w':
          this.position.y -= speed;
          break;
        case 's':
          this.position.y += speed;
          break;
        case 'a':
          this.position.x -= speed;
          break;
        case 'd':
          this.position.x += speed;
          break;
      }
    });
  }

  updateStats() {
    // Update character stats based on current state
    // For example, regenerate magic over time
    if (this.stats.magic < 100) {
      this.stats.magic += 0.1;
    }
  }

  checkInteractions() {
    // Check for interactions with NPCs and environment
    if (this.world && this.world.currentRegion) {
      // Add interaction logic here
    }
  }

  modifyRelationship(character, amount) {
    const currentValue = this.relationships.get(character) || 0;
    this.relationships.set(character, Math.max(-100, Math.min(100, currentValue + amount)));
  }

  useAbility(ability) {
    if (this.abilities.has(ability)) {
      // Implement ability usage
      console.log(`Using ability: ${ability}`);
    }
  }
}