export class NPCSystem {
  constructor(world) {
    if (!world) {
      throw new Error('NPCSystem requires a world instance');
    }
    this.world = world;
    this.npcs = new Map();
    this.initializeNPCs();
  }

  initializeNPCs() {
    // Define NPCs for different regions
    const npcData = {
      'Emerald City': [
        {
          id: 'wizard',
          name: 'The Wizard',
          type: 'quest_giver',
          position: { x: 300, y: 200 },
          dialogue: {
            default: {
              text: "Welcome to the Emerald City! How may I be of assistance?",
              choices: [
                {
                  text: "Tell me about the city",
                  nextDialog: 'about_city'
                },
                {
                  text: "I seek an audience",
                  nextDialog: 'request_audience'
                }
              ]
            },
            about_city: {
              text: "The Emerald City is the crown jewel of Oz, a beacon of progress and harmony.",
              choices: [
                {
                  text: "Back",
                  nextDialog: 'default'
                }
              ]
            }
          }
        },
        {
          id: 'madame_morrible',
          name: 'Madame Morrible',
          type: 'mentor',
          position: { x: 500, y: 300 },
          dialogue: {
            default: {
              text: "Ah, a promising young student...",
              choices: [
                {
                  text: "Teach me magic",
                  nextDialog: 'learn_magic'
                }
              ]
            }
          }
        }
      ],
      'Munchkinland': [
        {
          id: 'boq',
          name: 'Boq',
          type: 'merchant',
          position: { x: 200, y: 400 },
          dialogue: {
            default: {
              text: "Welcome to my humble shop!",
              choices: [
                {
                  text: "Show me your wares",
                  consequence: 'openShop'
                }
              ]
            }
          },
          inventory: [
            { id: 'healing_potion', name: 'Healing Potion', price: 50 },
            { id: 'magic_scroll', name: 'Magic Scroll', price: 100 }
          ]
        }
      ]
    };

    // Create NPCs for each region
    for (const [region, npcs] of Object.entries(npcData)) {
      npcs.forEach(npc => {
        this.createNPC(npc, region);
      });
    }
  }

  createNPC(data, region) {
    const npc = {
      ...data,
      region,
      interact: () => this.interactWithNPC(data.id),
      render: () => this.renderNPC(data.id),
      update: () => this.updateNPC(data.id)
    };
    this.npcs.set(data.id, npc);
  }

  interactWithNPC(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    // Trigger dialogue system
    this.world.triggerEvent('startDialog', npc.dialogue.default);
  }

  renderNPC(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc || npc.region !== this.world.currentRegion?.name) return;

    const worldMap = document.getElementById('world-map');
    if (!worldMap) return;

    let npcElement = document.getElementById(`npc-${npcId}`);
    if (!npcElement) {
      npcElement = document.createElement('div');
      npcElement.id = `npc-${npcId}`;
      npcElement.className = 'npc';
      worldMap.appendChild(npcElement);
    }

    npcElement.className = `npc npc-${npc.type}`;
    npcElement.style.transform = `translate(${npc.position.x}px, ${npc.position.y}px)`;
    npcElement.innerHTML = `
      <div class="npc-avatar"></div>
      <div class="npc-name">${npc.name}</div>
      <div class="npc-interaction-hint">Press E to interact</div>
    `;

    // Add interaction listener
    npcElement.onclick = () => this.interactWithNPC(npcId);
  }

  updateNPC(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    // Update NPC behavior based on type
    switch (npc.type) {
      case 'merchant':
        this.updateMerchant(npc);
        break;
      case 'quest_giver':
        this.updateQuestGiver(npc);
        break;
      // Add more NPC type updates as needed
    }
  }

  updateMerchant(npc) {
    // Update merchant inventory, prices, etc.
  }

  updateQuestGiver(npc) {
    // Update available quests, quest status, etc.
  }

  getNPCsInRegion(regionName) {
    return Array.from(this.npcs.values())
      .filter(npc => npc.region === regionName);
  }
}