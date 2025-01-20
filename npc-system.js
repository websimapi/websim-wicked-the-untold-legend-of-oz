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

  update() {
    // Update all NPCs in current region
    if (this.world.currentRegion) {
      this.getNPCsInRegion(this.world.currentRegion.name).forEach(npc => {
        this.updateNPC(npc.id);
      });
    }
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
      case 'mentor':
        this.updateMentor(npc);
        break;
    }

    // Update NPC scheduling based on time
    if (this.world.timeSystem) {
      this.updateNPCSchedule(npc);
    }
  }

  updateNPCSchedule(npc) {
    const currentPeriod = this.world.timeSystem.getCurrentPeriod();
    const schedule = this.getNPCSchedule(npc.type);
    
    if (schedule && schedule[currentPeriod]) {
      const activity = schedule[currentPeriod];
      // Update NPC position and behavior based on schedule
      if (activity.position) {
        npc.position = { ...activity.position };
      }
      if (activity.dialogue) {
        npc.dialogue.default = activity.dialogue;
      }
    }
  }

  getNPCSchedule(npcType) {
    const schedules = {
      merchant: {
        DAWN: { position: { x: 200, y: 200 }, activity: 'preparing_shop' },
        MORNING: { position: { x: 300, y: 300 }, activity: 'selling' },
        AFTERNOON: { position: { x: 300, y: 300 }, activity: 'selling' },
        DUSK: { position: { x: 200, y: 200 }, activity: 'closing_shop' },
        NIGHT: { position: { x: 100, y: 100 }, activity: 'sleeping' }
      },
      quest_giver: {
        DAWN: { position: { x: 400, y: 200 }, activity: 'patrolling' },
        MORNING: { position: { x: 500, y: 300 }, activity: 'giving_quests' },
        AFTERNOON: { position: { x: 500, y: 300 }, activity: 'giving_quests' },
        DUSK: { position: { x: 400, y: 200 }, activity: 'patrolling' },
        NIGHT: { position: { x: 300, y: 100 }, activity: 'resting' }
      }
    };

    return schedules[npcType];
  }

  updateMerchant(npc) {
    // Update merchant inventory based on time of day
    const currentHour = this.world.timeSystem ? this.world.timeSystem.time : 12;
    
    // Merchants restock during early morning
    if (currentHour >= 5 && currentHour < 7) {
      this.restockMerchant(npc);
    }
  }

  updateQuestGiver(npc) {
    // Update available quests based on player progress
    if (this.world.questSystem) {
      const availableQuests = this.world.questSystem.getAvailableQuests();
      npc.availableQuests = availableQuests.filter(quest => 
        quest.questGiver === npc.id
      );
    }
  }

  updateMentor(npc) {
    // Update mentor teaching availability and lessons
    const currentHour = this.world.timeSystem ? this.world.timeSystem.time : 12;
    npc.isTeaching = currentHour >= 9 && currentHour < 17; // Teaching hours
  }

  restockMerchant(npc) {
    // Restock merchant inventory with new items
    if (!npc.lastRestockTime || 
        (this.world.timeSystem && 
         this.world.timeSystem.daysPassed > npc.lastRestockTime)) {
      npc.inventory = this.generateMerchantInventory(npc.type);
      npc.lastRestockTime = this.world.timeSystem ? 
        this.world.timeSystem.daysPassed : 0;
    }
  }

  generateMerchantInventory(merchantType) {
    // Generate appropriate inventory based on merchant type
    const inventoryTemplates = {
      general: [
        { id: 'healing_potion', name: 'Healing Potion', price: 50 },
        { id: 'magic_scroll', name: 'Magic Scroll', price: 100 },
        { id: 'bread', name: 'Fresh Bread', price: 5 }
      ],
      magic: [
        { id: 'mana_potion', name: 'Mana Potion', price: 75 },
        { id: 'spell_book', name: 'Spell Book', price: 200 },
        { id: 'magic_wand', name: 'Magic Wand', price: 150 }
      ]
    };

    return [...inventoryTemplates[merchantType] || inventoryTemplates.general];
  }

  getNPCsInRegion(regionName) {
    return Array.from(this.npcs.values())
      .filter(npc => npc.region === regionName);
  }
}