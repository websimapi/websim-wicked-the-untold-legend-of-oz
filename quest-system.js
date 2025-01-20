export class QuestSystem {
  constructor() {
    this.quests = new Map();
    this.activeQuests = new Set();
    this.completedQuests = new Set();
    this.initializeQuests();
  }

  initializeQuests() {
    const questData = [
      {
        id: 'wizard-truth',
        title: "The Wizard's Truth",
        description: "Uncover the truth about the Wizard's powers",
        type: 'main',
        requirements: []
      },
      {
        id: 'animal-rights',
        title: 'Voice for the Voiceless',
        description: "Fight for Animal rights in Oz",
        type: 'side',
        requirements: ['wizard-truth']
      }
    ];

    questData.forEach(quest => {
      this.quests.set(quest.id, quest);
    });
  }

  startQuest(questId) {
    if (this.quests.has(questId)) {
      const quest = this.quests.get(questId);
      if (this.checkRequirements(quest)) {
        this.activeQuests.add(questId);
        return true;
      }
    }
    return false;
  }

  completeQuest(questId) {
    if (this.activeQuests.has(questId)) {
      this.activeQuests.delete(questId);
      this.completedQuests.add(questId);
      this.checkQuestChains(questId);
    }
  }

  checkRequirements(quest) {
    return quest.requirements.every(req => this.completedQuests.has(req));
  }

  checkQuestChains(completedQuestId) {
    // Check if completing this quest unlocks new quests
  }

  getActiveQuests() {
    return Array.from(this.activeQuests).map(id => this.quests.get(id));
  }

  getAvailableQuests() {
    return Array.from(this.quests.values())
      .filter(quest => !this.activeQuests.has(quest.id) 
        && !this.completedQuests.has(quest.id)
        && this.checkRequirements(quest));
  }
}