export class EnvironmentSystem {
  constructor(world) {
    if (!world) {
      throw new Error('EnvironmentSystem requires a world instance');
    }
    this.world = world;
    this.objects = new Map();
    this.interactables = new Map();
    this.initializeEnvironment();
  }

  initializeEnvironment() {
    // Define environmental objects for each region
    const environmentData = {
      'Emerald City': [
        {
          id: 'city_gate',
          type: 'gate',
          position: { x: 100, y: 100 },
          state: 'closed',
          interaction: {
            type: 'toggle',
            requires: 'city_pass'
          }
        },
        {
          id: 'fountain',
          type: 'ambient',
          position: { x: 400, y: 250 },
          effects: ['water_sound', 'particle_spray']
        }
      ],
      'Western Woods': [
        {
          id: 'ancient_tree',
          type: 'resource',
          position: { x: 300, y: 200 },
          resources: ['magic_bark', 'enchanted_leaves'],
          respawnTime: 300
        }
      ]
    };

    // Create environmental objects
    for (const [region, objects] of Object.entries(environmentData)) {
      objects.forEach(obj => this.createEnvironmentObject(obj, region));
    }
  }

  createEnvironmentObject(data, region) {
    const object = {
      ...data,
      region,
      interact: () => this.interactWithObject(data.id),
      render: () => this.renderObject(data.id),
      update: () => this.updateObject(data.id)
    };
    this.objects.set(data.id, object);
  }

  renderObject(objectId) {
    const object = this.objects.get(objectId);
    if (!object || object.region !== this.world.currentRegion?.name) return;

    const worldMap = document.getElementById('world-map');
    if (!worldMap) return;

    let objElement = document.getElementById(`env-${objectId}`);
    if (!objElement) {
      objElement = document.createElement('div');
      objElement.id = `env-${objectId}`;
      objElement.className = 'environment-object';
      worldMap.appendChild(objElement);
    }

    objElement.className = `environment-object ${object.type}`;
    objElement.style.transform = `translate(${object.position.x}px, ${object.position.y}px)`;
    
    // Add specific object rendering based on type
    switch (object.type) {
      case 'gate':
        this.renderGate(objElement, object);
        break;
      case 'resource':
        this.renderResource(objElement, object);
        break;
      case 'ambient':
        this.renderAmbient(objElement, object);
        break;
    }
  }

  renderGate(element, gate) {
    element.innerHTML = `
      <svg class="gate-svg" viewBox="0 0 100 100">
        <rect class="gate-door ${gate.state}" x="10" y="10" width="80" height="80"/>
        <circle class="gate-handle" cx="70" cy="50" r="5"/>
      </svg>
    `;
  }

  renderResource(element, resource) {
    element.innerHTML = `
      <div class="resource-container">
        <div class="resource-icon ${resource.resources[0]}"></div>
        <div class="resource-status"></div>
      </div>
    `;
  }

  renderAmbient(element, ambient) {
    if (ambient.effects.includes('particle_spray')) {
      this.createParticleEffect(element);
    }
  }

  createParticleEffect(element) {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    element.appendChild(particleContainer);

    // Create particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particleContainer.appendChild(particle);
      this.animateParticle(particle);
    }
  }

  animateParticle(particle) {
    const animation = particle.animate([
      { transform: 'translateY(0) translateX(0)', opacity: 1 },
      { transform: 'translateY(-20px) translateX(10px)', opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 1000,
      iterations: Infinity
    });
  }

  interactWithObject(objectId) {
    const object = this.objects.get(objectId);
    if (!object) return;

    switch (object.type) {
      case 'gate':
        this.handleGateInteraction(object);
        break;
      case 'resource':
        this.handleResourceGathering(object);
        break;
    }
  }

  handleGateInteraction(gate) {
    if (gate.interaction.requires) {
      // Check if player has required item
      if (this.world.player?.inventory.has(gate.interaction.requires)) {
        gate.state = gate.state === 'closed' ? 'open' : 'closed';
        this.renderObject(gate.id);
      } else {
        this.world.triggerEvent('showMessage', 'You need a city pass to open this gate.');
      }
    }
  }

  handleResourceGathering(resource) {
    if (resource.lastGathered && Date.now() - resource.lastGathered < resource.respawnTime * 1000) {
      this.world.triggerEvent('showMessage', 'This resource is not ready to be gathered.');
      return;
    }

    // Add resources to player inventory
    resource.resources.forEach(item => {
      this.world.triggerEvent('addInventoryItem', item);
    });

    resource.lastGathered = Date.now();
    this.renderObject(resource.id);
  }

  updateObject(objectId) {
    // Update logic for environmental objects (e.g., animations, state changes)
  }
}