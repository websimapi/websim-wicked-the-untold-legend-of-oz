export class TimeSystem {
  constructor(world) {
    this.world = world;
    this.time = 0; // 0-24 hours in game time
    this.daysPassed = 0;
    this.timeScale = 60; // 1 real second = 1 game minute
    this.lastUpdate = Date.now();
    
    // Time periods
    this.periods = {
      DAWN: { start: 5, end: 7 },
      MORNING: { start: 7, end: 12 },
      AFTERNOON: { start: 12, end: 17 },
      DUSK: { start: 17, end: 19 },
      NIGHT: { start: 19, end: 5 }
    };
    
    this.events = new Map();
    this.schedules = new Map();
    this.initializeTimeEvents();
  }

  initializeTimeEvents() {
    // Register default time-based events
    this.events.set('sunrise', () => {
      this.world.triggerEvent('lightingChange', 'sunrise');
      this.world.triggerEvent('npcScheduleChange', 'morning');
    });

    this.events.set('sunset', () => {
      this.world.triggerEvent('lightingChange', 'sunset');
      this.world.triggerEvent('npcScheduleChange', 'evening');
    });

    // Add schedule templates
    this.schedules.set('merchant', {
      MORNING: { activity: 'openShop', location: 'shop' },
      AFTERNOON: { activity: 'sellItems', location: 'marketplace' },
      DUSK: { activity: 'closeShop', location: 'shop' },
      NIGHT: { activity: 'sleep', location: 'home' }
    });

    this.schedules.set('questGiver', {
      DAWN: { activity: 'patrol', location: 'cityWalls' },
      MORNING: { activity: 'giveQuests', location: 'townSquare' },
      AFTERNOON: { activity: 'meeting', location: 'castle' },
      NIGHT: { activity: 'sleep', location: 'quarters' }
    });
  }

  update() {
    const now = Date.now();
    const delta = (now - this.lastUpdate) / 1000; // seconds
    this.lastUpdate = now;

    // Update game time
    this.time += (delta * this.timeScale) / 60; // Convert to hours
    if (this.time >= 24) {
      this.time -= 24;
      this.daysPassed++;
      this.world.triggerEvent('newDay', this.daysPassed);
    }

    this.checkTimeEvents();
    this.updateLighting();
  }

  checkTimeEvents() {
    const period = this.getCurrentPeriod();
    const hour = Math.floor(this.time);
    const minute = Math.floor((this.time % 1) * 60);

    // Check for specific time events
    if (hour === this.periods.DAWN.start && minute === 0) {
      this.events.get('sunrise')();
    } else if (hour === this.periods.DUSK.start && minute === 0) {
      this.events.get('sunset')();
    }
  }

  getCurrentPeriod() {
    for (const [period, timeRange] of Object.entries(this.periods)) {
      if (this.isTimeInRange(this.time, timeRange.start, timeRange.end)) {
        return period;
      }
    }
    return 'NIGHT';
  }

  isTimeInRange(time, start, end) {
    if (start <= end) {
      return time >= start && time < end;
    } else {
      // Handle overnight periods (e.g., NIGHT: 19-5)
      return time >= start || time < end;
    }
  }

  updateLighting() {
    const period = this.getCurrentPeriod();
    let brightness = 1.0;
    let colorTint = '#ffffff';

    switch (period) {
      case 'DAWN':
        brightness = this.calculateTransition(
          this.time,
          this.periods.DAWN.start,
          this.periods.DAWN.end,
          0.4,
          1.0
        );
        colorTint = this.interpolateColor('#2b5fb5', '#ffd700', brightness);
        break;
      case 'DUSK':
        brightness = this.calculateTransition(
          this.time,
          this.periods.DUSK.start,
          this.periods.DUSK.end,
          1.0,
          0.4
        );
        colorTint = this.interpolateColor('#ffd700', '#2b5fb5', 1 - brightness);
        break;
      case 'NIGHT':
        brightness = 0.4;
        colorTint = '#2b5fb5';
        break;
    }

    document.documentElement.style.setProperty('--world-brightness', brightness);
    document.documentElement.style.setProperty('--world-tint', colorTint);
  }

  calculateTransition(current, start, end, startValue, endValue) {
    const progress = (current - start) / (end - start);
    return startValue + (endValue - startValue) * progress;
  }

  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getTimeString() {
    const hours = Math.floor(this.time);
    const minutes = Math.floor((this.time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}