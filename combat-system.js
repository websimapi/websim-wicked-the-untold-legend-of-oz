export class CombatSystem {
  constructor() {
    this.inCombat = false;
    this.currentBeat = 0;
    this.tempo = 120;
    this.combatants = new Set();
    this.spellQueue = [];
    
    // Musical combat settings
    this.beatInterval = (60 / this.tempo) * 1000; // Convert BPM to milliseconds
    this.perfectWindow = 100; // ms window for perfect timing
    this.goodWindow = 200; // ms window for good timing
  }

  startCombat(enemies) {
    this.inCombat = true;
    this.combatants.clear();
    enemies.forEach(enemy => this.combatants.add(enemy));
    this.startMusicBeat();
  }

  startMusicBeat() {
    this.beatInterval = setInterval(() => {
      this.currentBeat++;
      this.checkSpellTiming();
    }, this.beatInterval);
  }

  queueSpell(spell, caster, target) {
    this.spellQueue.push({
      spell,
      caster,
      target,
      timestamp: performance.now()
    });
  }

  checkSpellTiming() {
    const now = performance.now();
    this.spellQueue = this.spellQueue.filter(spell => {
      const timeDiff = Math.abs(now - spell.timestamp);
      
      if (timeDiff <= this.perfectWindow) {
        this.castSpell(spell, 'perfect');
        return false;
      } else if (timeDiff <= this.goodWindow) {
        this.castSpell(spell, 'good');
        return false;
      }
      
      return true;
    });
  }

  castSpell(spellData, timing) {
    const { spell, caster, target } = spellData;
    const damageMultiplier = timing === 'perfect' ? 1.5 : 1.0;
    
    const damage = spell.baseDamage * damageMultiplier;
    target.takeDamage(damage);
    
    this.createSpellEffect(spell, caster, target, timing);
  }

  createSpellEffect(spell, caster, target, timing) {
    // Create visual and audio effects for the spell
    const effect = document.createElement('div');
    effect.classList.add('spell-effect', spell.type, timing);
    
    // Position the effect
    const start = caster.position;
    const end = target.position;
    
    gsap.to(effect, {
      x: end.x,
      y: end.y,
      duration: 1,
      ease: "power2.out",
      onComplete: () => effect.remove()
    });
  }

  endCombat() {
    this.inCombat = false;
    clearInterval(this.beatInterval);
    this.currentBeat = 0;
    this.spellQueue = [];
  }

  update() {
    if (!this.inCombat) return;
    
    // Check for combat end conditions
    if (this.checkCombatEnd()) {
      this.endCombat();
      return;
    }
    
    // Update combatants
    this.combatants.forEach(combatant => {
      if (combatant.update) {
        combatant.update();
      }
    });
  }

  checkCombatEnd() {
    // Check if all enemies are defeated or if player has fled
    return false;
  }
}