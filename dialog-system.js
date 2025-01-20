export class DialogSystem {
  constructor() {
    this.currentDialog = null;
    this.dialogQueue = [];
    this.dialogHistory = [];
    this.dialogBox = document.getElementById('dialog-box');
  }

  startDialog(dialogData) {
    this.dialogQueue = [...dialogData];
    this.showNextDialog();
  }

  showNextDialog() {
    if (this.dialogQueue.length > 0) {
      const dialog = this.dialogQueue.shift();
      this.currentDialog = dialog;
      this.showDialog(dialog);
    } else {
      this.endDialog();
    }
  }

  showDialog(dialog) {
    this.dialogBox.classList.remove('hidden');
    this.dialogBox.innerHTML = `
      <div class="dialog-content">
        <p>${dialog.text}</p>
        ${this.generateChoices(dialog.choices)}
      </div>
    `;

    this.setupChoiceListeners(dialog.choices);
  }

  generateChoices(choices) {
    if (!choices || choices.length === 0) return '';
    
    return `
      <div class="dialog-choices">
        ${choices.map((choice, index) => `
          <button class="dialog-choice" data-choice="${index}">
            ${choice.text}
          </button>
        `).join('')}
      </div>
    `;
  }

  setupChoiceListeners(choices) {
    if (!choices) return;

    document.querySelectorAll('.dialog-choice').forEach(button => {
      button.addEventListener('click', (e) => {
        const choice = choices[e.target.dataset.choice];
        this.handleChoice(choice);
      });
    });
  }

  handleChoice(choice) {
    if (choice.consequence) {
      choice.consequence();
    }
    
    if (choice.nextDialog) {
      this.dialogQueue.unshift(choice.nextDialog);
    }
    
    this.dialogHistory.push({
      dialog: this.currentDialog,
      choiceMade: choice
    });
    
    this.showNextDialog();
  }

  endDialog() {
    this.currentDialog = null;
    this.dialogBox.classList.add('hidden');
  }
}