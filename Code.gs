const TVQ = {
  CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  DEFAULT_SETTINGS: {
    level: 1,
    minLevel: 1,
    maxLevel: 5,
    adaptiveMode: false,
    textSize: 'large',
    redBrightness: 100,
    greenBrightness: 100,
    targetContrast: 1,
    swapColors: false,
    hideDecor: false,
    eyeForRed: 'right',
    eyeForGreen: 'left',
    sessionMinutes: 30,
    timerEnabled: true,
    distractionMode: 'off',
    maxRestMinutes: 2,
    showDebug: false
  },
  LEVELS: {
    1: { choices: 3, timeLimit: 60, text: 'large', distraction: 0 },
    2: { choices: 4, timeLimit: 50, text: 'medium', distraction: 1 },
    3: { choices: 5, timeLimit: 40, text: 'small', distraction: 3 },
    4: { choices: 6, timeLimit: 32, text: 'small', distraction: 5 },
    5: { choices: 7, timeLimit: 25, text: 'small', distraction: 7 }
  },
  LOCATIONS: [
    { name: 'Whisker Cave', category: 'animals', clue: 'The soft paws of the moonlight friend hide the treasure.' },
    { name: 'Golden Jungle', category: 'fruit', clue: 'The treasure is hidden among the bright jungle treats.' },
    { name: 'Cloud Bridge', category: 'vehicles', clue: 'Look for the bright traveler that moves across the sky.' },
    { name: 'Moonlit Harbour', category: 'clothing', clue: 'The treasure is hidden among the harbor garments.' },
    { name: 'Frozen Mountain', category: 'household objects', clue: 'The treasure is near the cozy mountain helper.' },
    { name: 'Wizard Library', category: 'gardening tools', clue: 'The treasure rests beside a tool the wizard treasures.' },
    { name: 'Dragon Garden', category: 'royal objects', clue: 'The treasure glows like a royal jewel in the garden.' },
    { name: 'Crystal Castle', category: 'animals', clue: 'The treasure follows the shining creature of the castle.' }
  ],
  ITEM_POOLS: {
    animals: ['fox', 'owl', 'bear', 'rabbit', 'dolphin', 'tiger', 'panda', 'falcon'],
    fruit: ['apple', 'mango', 'pear', 'banana', 'grape', 'orange', 'peach', 'plum'],
    vehicles: ['bus', 'train', 'rocket', 'boat', 'car', 'bike', 'truck', 'plane'],
    clothing: ['hat', 'scarf', 'boots', 'coat', 'gloves', 'suit', 'dress', 'socks'],
    'household objects': ['lamp', 'cup', 'chair', 'clock', 'pillow', 'blanket', 'basket', 'bottle'],
    'gardening tools': ['spade', 'rake', 'trowel', 'watering can', 'shears', 'fork', 'hoe', 'bucket'],
    'royal objects': ['crown', 'shield', 'scepter', 'gem', 'castle', 'banner', 'throne', 'crown jewel']
  }
};

function doGet(e) {
  return HtmlService.createHtmlOutput(buildGamePage())
    .setTitle('Treasure Vision Quest')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function buildGamePage() {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>Treasure Vision Quest</title>
    <style>
      :root {
        --sky: #eaf6ff;
        --wood: #ffefdf;
        --forest: #1f7a45;
        --sun: #ffd861;
        --gold: #f0b53d;
        --red: #da2d2d;
        --green: #2fbf71;
        --ink: #1d2b39;
        --muted: #586b7a;
        --card: #ffffff;
        --nearbg: #f4fbff;
        --farbg: #fffaf0;
        --shadow: rgba(15, 23, 42, 0.14);
        --danger: #d84858;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #eef6ff; color: var(--ink); }
      body { min-height: 100vh; }
      .app {
        max-width: 1200px; margin: 0 auto; padding: 16px;
      }
      .topbar {
        display: flex; justify-content: space-between; align-items: center;
        background: linear-gradient(135deg, #9fe1ff, #d2f0ff 35%, #ffe9a8);
        border: 3px solid rgba(21, 63, 99, 0.2); border-radius: 22px; padding: 12px 18px; box-shadow: 0 8px 20px var(--shadow);
      }
      .brand { font-size: clamp(22px, 2.5vw, 36px); font-weight: 800; letter-spacing: 0.04em; }
      .status-pill {
        display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.7); border-radius: 999px; padding: 8px 14px; font-weight: 700;
      }
      .dot { width: 12px; height: 12px; border-radius: 50%; background: #28b562; display: inline-block; }
      .dot.offline { background: #d9534f; }
      .main-card {
        margin-top: 18px; background: var(--card); border: 3px solid rgba(29,43,57,.12); border-radius: 24px; box-shadow: 0 10px 30px var(--shadow); overflow: hidden;
      }
      .screen { display: none; padding: 18px; }
      .screen.active { display: block; }
      .home-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-top: 18px;
      }
      .choice-panel {
        background: linear-gradient(180deg, #f5fbff, #eaedf8); border: 2px solid rgba(38,68,91,.15); border-radius: 20px; padding: 20px; min-height: 240px;
      }
      .choice-panel h3 { margin-top: 0; font-size: clamp(22px, 2.8vw, 30px); }
      .big-btn, .small-btn, .ghost-btn { border: none; border-radius: 14px; font-weight: 800; cursor: pointer; transition: transform 0.12s ease; }
      .big-btn { background: linear-gradient(180deg, #ffdb65, #f0b541); color: #1d2b39; padding: 18px 22px; font-size: clamp(18px,2vw,24px); width: 100%; }
      .small-btn { background: linear-gradient(180deg, #3abf7d, #1ea55d); color: white; padding: 14px 18px; font-size: 18px; }
      .ghost-btn { background: #ecf3fa; color: var(--ink); padding: 12px 16px; border: 2px solid rgba(29,43,57, 0.14); font-size: 16px; }
      button:active { transform: translateY(2px) scale(0.99); }
      .warning-box {
        background: #fff7d6; border-left: 6px solid #f7c948; border-radius: 14px; padding: 12px 14px; color: #5e4c22; line-height: 1.5; font-weight: 600; margin-top: 12px;
      }
      .device-shell { display: grid; gap: 16px; }
      .device-header {
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
      }
      .role-tag {
        display: inline-flex; padding: 6px 12px; border-radius: 999px; font-weight: 800; font-size: 14px; color: white; background: #2984d5;
      }
      .role-tag.far { background: linear-gradient(135deg, #f7a947, #f0b53d); color: #2a1a00; }
      .role-tag.near { background: linear-gradient(135deg, #3ec8a0, #2cb57c); }
      .pair-box {
        background: linear-gradient(180deg, #fffdea, #fff); border: 3px dashed rgba(14,56,86,.4); border-radius: 18px; padding: 20px; text-align: center; margin: 10px 0 16px;
      }
      .pair-code {
        letter-spacing: 0.28em; background: #f6f8ff; border: 2px solid rgba(32,61,85,.18); border-radius: 14px; padding: 16px 20px; font-weight: 900; font-size: clamp(30px, 4vw, 48px); color: var(--ink);
      }
      .clue-panel {
        background: linear-gradient(180deg, var(--nearbg), #ffffff); border-radius: 24px; border: 3px solid rgba(17,72,103,.1); padding: 18px; min-height: 280px;
      }
      .far-panel {
        background: linear-gradient(180deg, var(--farbg), #fffef8); border-radius: 24px; border: 3px solid rgba(208,151,62,.18); padding: 18px; min-height: 300px;
      }
      .location-title {
        font-size: clamp(26px, 3vw, 40px); font-weight: 900; margin: 0 0 12px; color: #204d54;
      }
      .prompt-text {
        font-size: clamp(18px, 2vw, 28px); line-height: 1.4; margin: 8px 0 16px; font-weight: 700;
      }
      .key-block {
        background: rgba(52,170,86,0.14); border: 3px solid rgba(46,150,94,.4); border-radius: 18px; padding: 14px 18px; display: inline-flex; align-items: center; gap: 12px; margin-bottom: 14px; font-size: clamp(20px, 2vw, 28px); font-weight: 800;
      }
      .key-icon {
        width: 28px; height: 28px; background: linear-gradient(180deg, #54d676, #2fbf71); border-radius: 10px; box-shadow: inset 0 0 0 3px rgba(255,255,255,.5);
      }
      .footsteps {
        display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0 18px;
      }
      .step {
        width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(180deg, #76f19d, #2bbd71); box-shadow: inset 0 0 0 3px rgba(255,255,255,0.6);
      }
      .step.hollow { background: rgba(43,189,113,0.20); border: 2px solid rgba(43,189,113,.7); box-shadow: none; }
      .time-box {
        display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,.7); border: 2px solid rgba(32,61,85,.14); border-radius: 12px; padding: 10px 14px; font-weight: 800; font-size: 18px;
      }
      .timer {
        font-size: clamp(22px, 3vw, 34px); font-weight: 900; color: var(--danger);
      }
      .treasure-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-top: 18px;
      }
      .treasure-card {
        background: linear-gradient(180deg, #fff1f1, #ffe4e5); border: 3px solid rgba(218, 45, 45, 0.25); border-radius: 20px; padding: 16px 14px; text-align: center; cursor: pointer; min-height: 120px; font-size: clamp(18px, 2vw, 24px); font-weight: 800; color: var(--ink);
        box-shadow: 0 6px 16px rgba(218,45,45,0.08);
      }
      .treasure-card.red {
        background: linear-gradient(180deg, #ffcaca, #ff8c97); border-color: rgba(186,40,47,0.4);
      }
      .treasure-card:hover { transform: translateY(-2px); }
      .treasure-card.selected { outline: 4px solid rgba(54, 145, 255, 0.75); }
      .reward-wrap {
        display: grid; gap: 16px; margin-top: 18px; padding: 18px; border-radius: 22px; background: linear-gradient(180deg, #f4fff6, #edf8f0); border: 3px solid rgba(18,116,62,.18);
      }
      .stars {
        font-size: clamp(28px, 4vw, 52px); letter-spacing: 0.18em; color: #ffbf3e; text-shadow: 0 3px 0 rgba(250,180,70,.32);
      }
      .summary-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 12px; margin-top: 18px;
      }
      .summary-box { background: #eef8ff; border: 2px solid rgba(39,91,121,.12); border-radius: 14px; padding: 12px; }
      .setup-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 10px;
      }
      label { display: flex; flex-direction: column; gap: 6px; font-weight: 700; font-size: 14px; }
      input, select { border: 2px solid rgba(28,53,69,.18); border-radius: 10px; background: white; padding: 10px 12px; font-size: 16px; }
      input[type="range"] { padding: 0; }
      .muted { color: var(--muted); }
      .btn-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
      .danger-btn { background: linear-gradient(180deg, #ff7a7a, #ec4f5d); color: white; }
      .notice { font-size: 14px; }
      .distraction-zone {
        position: relative; margin-top: 22px; border: 2px dashed rgba(32,61,85,.18); border-radius: 18px; min-height: 80px; overflow: hidden; background: rgba(255,255,255,0.28);
      }
      .moving-dot {
        position: absolute; width: 18px; height: 18px; border-radius: 50%; background: rgba(126, 130, 143, 0.85);
        animation: drift 7s ease-in-out infinite alternate; opacity: 0.75;
      }
      @keyframes drift {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(30px, -18px) scale(1.3); }
      }
      @media (max-width: 700px) {
        .topbar { flex-direction: column; align-items: flex-start; }
        .app { padding: 10px; }
        .main-card { border-radius: 18px; }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <header class="topbar">
        <div class="brand">Treasure Vision Quest</div>
        <div class="status-pill"><span id="statusDot" class="dot"></span><span id="connectionText">Waiting</span></div>
      </header>

      <div id="homeScreen" class="main-card screen active">
        <div class="screen-inner" style="padding: 18px;">
          <div class="warning-box">
            This game should be used under the direction of a qualified eye-care professional. Clinician settings determine viewing distance, filter orientation, contrast, text size, session duration, and stopping points.
          </div>
          <div class="home-grid">
            <div class="choice-panel">
              <h3>FAR Device</h3>
              <p class="muted">Create a new session and display the code for the iPad or tablet.</p>
              <button class="big-btn" id="createFarSessionBtn">Create Game Session</button>
            </div>
            <div class="choice-panel">
              <h3>NEAR Device</h3>
              <p class="muted">Join with a five-character pairing code from the FAR screen.</p>
              <div style="margin-top: 14px; display: grid; gap: 12px;">
                <input id="joinCodeInput" maxlength="5" style="font-size: 24px; text-transform: uppercase; letter-spacing: 0.3em; text-align:center;" placeholder="ABCDE" />
                <button class="big-btn" id="joinNearSessionBtn">Join Session</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="deviceScreen" class="main-card screen">
        <div class="device-shell" style="padding: 18px;">
          <div class="device-header">
            <div class="role-tag" id="roleTag">FAR</div>
            <div class="time-box"><span>Score</span><span id="scoreBox" style="font-size: 20px;">0</span></div>
            <div class="time-box"><span>Timer</span><span id="timerBox" class="timer">60</span></div>
          </div>

          <div id="farCodeSection" class="pair-box" style="display:none;">
            <div class="muted" style="font-size: 17px; font-weight: 700;">Pairing Code</div>
            <div id="pairCode" class="pair-code">—</div>
            <div id="connectedStatus" class="muted" style="font-size: 16px; margin-top: 8px;">Waiting for a near device...</div>
          </div>

          <div id="setupSection" class="pair-box" style="display:none;">
            <div class="muted" style="font-size:17px; font-weight: 700;">Clinician Setup</div>
            <div class="setup-grid">
              <label>
                Level
                <select id="levelSelect">
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                  <option value="5">Level 5</option>
                </select>
              </label>
              <label>
                Adaptive Mode
                <select id="adaptiveSelect">
                  <option value="false">Off</option>
                  <option value="true">On</option>
                </select>
              </label>
              <label>
                Session Length (min)
                <input id="sessionMinutesInput" type="number" min="5" max="90" value="30" />
              </label>
              <label>
                Eye for RED
                <select id="redEyeSelect">
                  <option value="right">Right eye</option>
                  <option value="left">Left eye</option>
                </select>
              </label>
              <label>
                Eye for GREEN
                <select id="greenEyeSelect">
                  <option value="left">Left eye</option>
                  <option value="right">Right eye</option>
                </select>
              </label>
              <label>
                Text Size
                <select id="textSizeSelect">
                  <option value="large">Large</option>
                  <option value="medium">Medium</option>
                  <option value="small">Small</option>
                </select>
              </label>
              <label>
                Red Brightness
                <input id="redBrightnessInput" type="range" min="20" max="100" value="100" />
              </label>
              <label>
                Green Brightness
                <input id="greenBrightnessInput" type="range" min="20" max="100" value="100" />
              </label>
              <label>
                Target Contrast
                <input id="contrastInput" type="range" min="0.7" max="1.7" step="0.1" value="1" />
              </label>
              <label>
                Hide Decor
                <select id="hideDecorSelect">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
              <label>
                Timer
                <select id="timerEnabledSelect">
                  <option value="true">On</option>
                  <option value="false">Off</option>
                </select>
              </label>
            </div>
            <div class="btn-row">
              <button class="small-btn" id="saveSettingsBtn">Save Settings</button>
              <button class="ghost-btn" id="startGameBtn">Start Session</button>
              <button class="ghost-btn" id="pauseBtn">Pause</button>
              <button class="danger-btn small-btn" id="endSessionBtn">Emergency Stop</button>
            </div>
          </div>

          <div id="gameContent" class="device-content" style="display:none;">
            <div id="instructionBanner" class="prompt-text" style="margin-top: 10px;">Ready for the next adventure.</div>
            <div id="nearClueArea" class="clue-panel" style="display:none;">
              <div class="location-title" id="locationName">Whisker Cave</div>
              <div class="prompt-text" id="nearPrompt">Follow the green footsteps to the key.</div>
              <div class="key-block"><span class="key-icon"></span> Green key needed</div>
              <div id="footStepArea" class="footsteps"></div>
              <button class="small-btn" id="nearReadBtn">Clue Read: Look FAR</button>
            </div>

            <div id="farInfoArea" class="far-panel" style="display:none;">
              <div class="location-title" id="farLocation">Far clue</div>
              <div class="prompt-text" id="farPrompt">Look at the iPad clue and remember the key detail.</div>
              <button class="small-btn" id="showTreasuresBtn">Show Treasures on iPad</button>
            </div>

            <div id="treasureArea" class="far-panel" style="display:none;">
              <div class="location-title">Treasure Choices</div>
              <div class="prompt-text" id="selectPrompt">Choose the treasure on the iPad.</div>
              <div id="treasureGrid" class="treasure-grid"></div>
            </div>

            <div id="resultArea" class="reward-wrap" style="display:none;">
              <div id="resultTitle" class="location-title" style="margin:0;">Great Job!</div>
              <div id="resultText" class="prompt-text" style="margin:0;">You found the treasure.</div>
              <div id="starsBox" class="stars">★ ★ ★</div>
              <button class="small-btn" id="nextRoundBtn">Next Round</button>
            </div>

            <div id="timeoutArea" class="reward-wrap" style="display:none;">
              <div class="location-title" style="margin:0;">A little rest is good.</div>
              <div class="prompt-text" style="margin:0;">Time is up. Take a breath and get ready for the next challenge.</div>
              <button class="small-btn" id="nextRoundAfterTimeoutBtn">Next Challenge</button>
            </div>

            <div id="distractionZone" class="distraction-zone" style="display:none;"></div>
          </div>

          <div id="summarySection" class="reward-wrap" style="display:none; margin-top: 20px;">
            <div class="location-title" style="margin:0;">Session Summary</div>
            <div class="summary-grid" id="summaryGrid"></div>
            <div class="btn-row">
              <button class="small-btn" id="exportCsvBtn">Export CSV</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      const app = {
        role: null,
        sessionCode: null,
        session: null,
        pollId: null,
        timerHandle: null,
        lastRoundState: null,
        isActive: false,
        listening: false,
      };

      const ui = {
        homeScreen: document.getElementById('homeScreen'),
        deviceScreen: document.getElementById('deviceScreen'),
        roleTag: document.getElementById('roleTag'),
        connectionText: document.getElementById('connectionText'),
        statusDot: document.getElementById('statusDot'),
        scoreBox: document.getElementById('scoreBox'),
        timerBox: document.getElementById('timerBox'),
        farCodeSection: document.getElementById('farCodeSection'),
        pairCode: document.getElementById('pairCode'),
        connectedStatus: document.getElementById('connectedStatus'),
        setupSection: document.getElementById('setupSection'),
        gameContent: document.getElementById('gameContent'),
        instructionBanner: document.getElementById('instructionBanner'),
        nearClueArea: document.getElementById('nearClueArea'),
        farInfoArea: document.getElementById('farInfoArea'),
        treasureArea: document.getElementById('treasureArea'),
        resultArea: document.getElementById('resultArea'),
        timeoutArea: document.getElementById('timeoutArea'),
        summarySection: document.getElementById('summarySection'),
        summaryGrid: document.getElementById('summaryGrid'),
        distractionZone: document.getElementById('distractionZone'),
        locationName: document.getElementById('locationName'),
        nearPrompt: document.getElementById('nearPrompt'),
        footStepArea: document.getElementById('footStepArea'),
        farLocation: document.getElementById('farLocation'),
        farPrompt: document.getElementById('farPrompt'),
        treasureGrid: document.getElementById('treasureGrid'),
        selectPrompt: document.getElementById('selectPrompt'),
        resultTitle: document.getElementById('resultTitle'),
        resultText: document.getElementById('resultText'),
        starsBox: document.getElementById('starsBox'),
        levelSelect: document.getElementById('levelSelect'),
        adaptiveSelect: document.getElementById('adaptiveSelect'),
        sessionMinutesInput: document.getElementById('sessionMinutesInput'),
        redEyeSelect: document.getElementById('redEyeSelect'),
        greenEyeSelect: document.getElementById('greenEyeSelect'),
        textSizeSelect: document.getElementById('textSizeSelect'),
        redBrightnessInput: document.getElementById('redBrightnessInput'),
        greenBrightnessInput: document.getElementById('greenBrightnessInput'),
        contrastInput: document.getElementById('contrastInput'),
        hideDecorSelect: document.getElementById('hideDecorSelect'),
        timerEnabledSelect: document.getElementById('timerEnabledSelect')
      };

      function setStatus(connected) {
        ui.statusDot.classList.toggle('offline', !connected);
        ui.connectionText.textContent = connected ? 'Connected' : 'Waiting';
      }

      function showHome() {
        ui.homeScreen.classList.add('active');
        ui.deviceScreen.classList.remove('active');
      }

      function showDeviceScreen() {
        ui.homeScreen.classList.remove('active');
        ui.deviceScreen.classList.add('active');
      }

      function resetUI() {
        ui.nearClueArea.style.display = 'none';
        ui.farInfoArea.style.display = 'none';
        ui.treasureArea.style.display = 'none';
        ui.resultArea.style.display = 'none';
        ui.timeoutArea.style.display = 'none';
        ui.summarySection.style.display = 'none';
        ui.farCodeSection.style.display = 'none';
        ui.setupSection.style.display = 'none';
        ui.gameContent.style.display = 'none';
        ui.distractionZone.innerHTML = '';
        ui.distractionZone.style.display = 'none';
      }

      function loadSettingsIntoControls(settings) {
        ui.levelSelect.value = String(settings.level || 1);
        ui.adaptiveSelect.value = String(Boolean(settings.adaptiveMode));
        ui.sessionMinutesInput.value = settings.sessionMinutes || 30;
        ui.redEyeSelect.value = settings.eyeForRed || 'right';
        ui.greenEyeSelect.value = settings.eyeForGreen || 'left';
        ui.textSizeSelect.value = settings.textSize || 'large';
        ui.redBrightnessInput.value = settings.redBrightness || 100;
        ui.greenBrightnessInput.value = settings.greenBrightness || 100;
        ui.contrastInput.value = settings.targetContrast || 1;
        ui.hideDecorSelect.value = String(Boolean(settings.hideDecor));
        ui.timerEnabledSelect.value = String(Boolean(settings.timerEnabled));
      }

      function roleDisplay(role) {
        app.role = role;
        ui.roleTag.textContent = role === 'far' ? 'FAR DEVICE' : 'NEAR DEVICE';
        ui.roleTag.className = 'role-tag ' + role;
      }

      function setConnectionStatus(state) {
        setStatus(Boolean(state && state.connected));
      }

      function renderNearClue(session) {
        if (!session || !session.round) return;
        ui.nearClueArea.style.display = 'block';
        ui.farInfoArea.style.display = 'none';
        ui.treasureArea.style.display = 'none';
        ui.resultArea.style.display = 'none';
        ui.timeoutArea.style.display = 'none';
        ui.distractionZone.style.display = session.settings.hideDecor ? 'none' : (session.settings.distractionMode === 'off' ? 'none' : 'block');
        ui.locationName.textContent = session.round.location;
        ui.nearPrompt.textContent = session.round.nearText || 'Follow the green pathway.';
        ui.footStepArea.innerHTML = '';
        const steps = 6;
        for (let i = 0; i < steps; i++) {
          const d = document.createElement('div');
          d.className = 'step ' + (i < session.round.steps ? '' : 'hollow');
          ui.footStepArea.appendChild(d);
        }
        ui.instructionBanner.textContent = 'Look NEAR — Read the clue on the iPad.';
      }

      function renderFarInfo(session) {
        if (!session || !session.round) return;
        ui.nearClueArea.style.display = 'none';
        ui.farInfoArea.style.display = 'block';
        ui.treasureArea.style.display = 'none';
        ui.resultArea.style.display = 'none';
        ui.timeoutArea.style.display = 'none';
        ui.farLocation.textContent = session.round.location;
        ui.farPrompt.textContent = session.round.farText || 'Read the clue, remember the answer, and then choose on the iPad.';
        ui.instructionBanner.textContent = 'Look FAR — Read the clue on the FAR screen.';
        if (session.settings.distractionMode !== 'off' && !session.settings.hideDecor) {
          renderDistractions(session.settings.distractionMode, 'far');
        }
      }

      function renderTreasureSelection(session) {
        if (!session || !session.round) return;
        ui.nearClueArea.style.display = 'none';
        ui.farInfoArea.style.display = 'none';
        ui.treasureArea.style.display = 'block';
        ui.resultArea.style.display = 'none';
        ui.timeoutArea.style.display = 'none';
        ui.selectPrompt.textContent = 'Look near and choose the treasure on the iPad.';
        ui.treasureGrid.innerHTML = '';
        const selected = session.round.selectedChoice;
        session.round.choices.forEach((choice, index) => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'treasure-card red' + (selected === choice ? ' selected' : '');
          card.textContent = choice;
          card.addEventListener('click', () => {
            if (app.role === 'near') {
              google.script.run.withSuccessHandler((res) => {
                if (res && res.ok) {
                  fetchSession();
                }
              }).answerChoice(app.sessionCode, choice);
            }
          });
          ui.treasureGrid.appendChild(card);
        });
        ui.instructionBanner.textContent = 'Look NEAR — Choose the treasure on the iPad.';
      }

      function renderResult(session) {
        if (!session) return;
        const outcome = session.lastOutcome || 'correct';
        ui.resultArea.style.display = 'block';
        ui.resultTitle.textContent = outcome === 'correct' ? 'You did it!' : 'Nice try!';
        ui.resultText.textContent = outcome === 'correct'
          ? 'The green key unlocked the red treasure. Excellent focus and teamwork.'
          : 'The clue is still waiting. Keep looking, and have another try.';
        ui.starsBox.textContent = outcome === 'correct' ? '★ ★ ★' : '★ ★';
        ui.instructionBanner.textContent = 'See your reward on the FAR screen.';
      }

      function renderTimeout(session) {
        ui.timeoutArea.style.display = 'block';
        ui.instructionBanner.textContent = 'A calm rest is helpful. Get ready for the next challenge.';
      }

      function renderSummary(session) {
        if (!session || !session.summary) return;
        ui.summarySection.style.display = 'block';
        ui.summaryGrid.innerHTML = '';
        const items = [
          ['Overall accuracy', session.summary.overallAccuracy + '%'],
          ['First-attempt accuracy', session.summary.firstAttemptAccuracy + '%'],
          ['Mean response', session.summary.meanResponse + 's'],
          ['Correct answers', session.summary.correctAnswers],
          ['Timeouts', session.summary.timeouts],
          ['Level reached', session.summary.highestLevel],
          ['Performance trend', session.summary.trend]
        ];
        items.forEach(([label, value]) => {
          const box = document.createElement('div');
          box.className = 'summary-box';
          box.innerHTML = `<div class="muted">${label}</div><div style="font-size: 22px; font-weight: 900; margin-top: 6px;">${value}</div>`;
          ui.summaryGrid.appendChild(box);
        });
      }

      function renderDistractions(mode, screen) {
        if (mode === 'off') {
          ui.distractionZone.style.display = 'none';
          return;
        }
        ui.distractionZone.style.display = 'block';
        ui.distractionZone.innerHTML = '';
        const count = mode === 'mild' ? 3 : mode === 'moderate' ? 6 : 9;
        for (let i = 0; i < count; i++) {
          const dot = document.createElement('div');
          dot.className = 'moving-dot';
          dot.style.left = (Math.random() * 72 + 8) + '%';
          dot.style.top = (Math.random() * 52 + 12) + '%';
          dot.style.background = i % 2 === 0 ? 'rgba(104,108,118,0.75)' : 'rgba(160,165,180,0.75)';
          dot.style.width = (12 + Math.random() * 18) + 'px';
          dot.style.height = dot.style.width;
          dot.style.animationDelay = (i * 0.7) + 's';
          ui.distractionZone.appendChild(dot);
        }
      }

      function parseSession(session) {
        app.session = session;
        if (!session) return;
        if (app.role === 'far') {
          ui.farCodeSection.style.display = 'block';
          ui.setupSection.style.display = 'block';
          ui.gameContent.style.display = 'block';
          ui.pairCode.textContent = session.code || '—';
          ui.connectedStatus.textContent = session.nearConnected ? 'Near device connected.' : 'Waiting for a near device...';
          loadSettingsIntoControls(session.settings || {});
          ui.scoreBox.textContent = String(session.score || 0);
        } else {
          ui.setupSection.style.display = 'none';
          ui.farCodeSection.style.display = 'none';
          ui.gameContent.style.display = 'block';
          ui.scoreBox.textContent = String(session.score || 0);
        }

        if (!session.phase || session.phase === 'waiting') {
          if (app.role === 'far') {
            ui.instructionBanner.textContent = 'Create the session, then start the next adventure.';
            ui.nearClueArea.style.display = 'none';
            ui.farInfoArea.style.display = 'none';
          }
          return;
        }

        if (session.phase === 'near_clue') { renderNearClue(session); }
        if (session.phase === 'far_info') { renderFarInfo(session); }
        if (session.phase === 'near_selection') { renderTreasureSelection(session); }
        if (session.phase === 'correct' || session.phase === 'wrong') { renderResult(session); }
        if (session.phase === 'timeout') { renderTimeout(session); }
        if (session.phase === 'summary') { renderSummary(session); }
        if (session.phase === 'completed') { ui.instructionBanner.textContent = 'The adventure is complete.'; }
      }

      function updateTimerDisplay() {
        const session = app.session;
        if (!session || !session.phaseStartedAt || !session.round || !session.round.timeLimit) {
          ui.timerBox.textContent = '—';
          return;
        }
        const now = Date.now();
        const limit = Number(session.round.timeLimit || 0);
        const elapsed = (now - Number(session.phaseStartedAt || now)) / 1000;
        const remaining = Math.max(0, limit - elapsed);
        ui.timerBox.textContent = remaining.toFixed(0);
        if (remaining <= 0 && session.phase !== 'correct' && session.phase !== 'wrong' && session.phase !== 'summary') {
          if (app.role === 'far' || app.role === 'near') {
            google.script.run.withSuccessHandler((res) => {
              if (res && res.ok) fetchSession();
            }).timeoutRound(app.sessionCode);
          }
        }
      }

      function pollSession() {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((session) => {
          app.session = session;
          parseSession(session);
          updateTimerDisplay();
          setConnectionStatus({ connected: Boolean(session && session.connected) });
        }).getSessionState(app.sessionCode);
      }

      function fetchSession() {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((session) => {
          app.session = session;
          parseSession(session);
          updateTimerDisplay();
          setConnectionStatus({ connected: Boolean(session && session.connected) });
        }).getSessionState(app.sessionCode);
      }

      function startPolling() {
        if (app.pollId) clearInterval(app.pollId);
        app.pollId = setInterval(() => {
          if (app.sessionCode) {
            pollSession();
          }
        }, 1200);
      }

      document.getElementById('createFarSessionBtn').addEventListener('click', () => {
        roleDisplay('far');
        showDeviceScreen();
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) {
            app.sessionCode = res.code;
            app.session = res.session;
            parseSession(res.session);
            startPolling();
          }
        }).createSession();
      });

      document.getElementById('joinNearSessionBtn').addEventListener('click', () => {
        const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
        if (!code || code.length !== 5) {
          alert('Please enter a valid five-character session code.');
          return;
        }
        roleDisplay('near');
        showDeviceScreen();
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) {
            app.sessionCode = code;
            app.session = res.session;
            parseSession(res.session);
            startPolling();
          } else {
            alert('Unable to join that session. Please check the code and try again.');
            showHome();
          }
        }).joinSession(code);
      });

      document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        const settings = {
          level: Number(ui.levelSelect.value),
          adaptiveMode: ui.adaptiveSelect.value === 'true',
          sessionMinutes: Number(ui.sessionMinutesInput.value || 30),
          eyeForRed: ui.redEyeSelect.value,
          eyeForGreen: ui.greenEyeSelect.value,
          textSize: ui.textSizeSelect.value,
          redBrightness: Number(ui.redBrightnessInput.value),
          greenBrightness: Number(ui.greenBrightnessInput.value),
          targetContrast: Number(ui.contrastInput.value),
          hideDecor: ui.hideDecorSelect.value === 'true',
          timerEnabled: ui.timerEnabledSelect.value === 'true'
        };
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) {
            fetchSession();
          }
        }).updateSettings(app.sessionCode, settings);
      });

      document.getElementById('startGameBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) fetchSession();
        }).startSession(app.sessionCode);
      });

      document.getElementById('pauseBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) fetchSession();
        }).pauseSession(app.sessionCode);
      });

      document.getElementById('endSessionBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        if (confirm('End the session now?')) {
          google.script.run.withSuccessHandler(() => {
            showHome();
          }).endSession(app.sessionCode);
        }
      });

      document.getElementById('nearReadBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) fetchSession();
        }).advancePhase(app.sessionCode, 'far_info');
      });

      document.getElementById('showTreasuresBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) fetchSession();
        }).advancePhase(app.sessionCode, 'near_selection');
      });

      document.getElementById('nextRoundBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) fetchSession();
        }).nextRound(app.sessionCode);
      });

      document.getElementById('nextRoundAfterTimeoutBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((res) => {
          if (res && res.ok) fetchSession();
        }).nextRound(app.sessionCode);
      });

      document.getElementById('exportCsvBtn').addEventListener('click', () => {
        if (!app.sessionCode) return;
        google.script.run.withSuccessHandler((csv) => {
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'treasure-vision-quest-summary.csv';
          a.click();
        }).exportSessionCsv(app.sessionCode);
      });

      setInterval(updateTimerDisplay, 250);
      showHome();
    </script>
  </body>
  </html>`;
}

function generateIdCode() {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * TVQ.CODE_CHARS.length);
    s += TVQ.CODE_CHARS.charAt(idx);
  }
  return s;
}

function getLevelConfig(level) {
  const base = TVQ.LEVELS[Number(level)] || TVQ.LEVELS[1];
  return {
    choices: base.choices,
    timeLimit: base.timeLimit,
    text: base.text,
    distraction: base.distraction
  };
}

function getCategoryPool(category) {
  return (TVQ.ITEM_POOLS[category] || TVQ.ITEM_POOLS.animals).slice();
}

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function createRound(level, roundIndex) {
  const loc = TVQ.LOCATIONS[(roundIndex + level) % TVQ.LOCATIONS.length];
  const category = loc.category;
  const pool = getCategoryPool(category);
  const choices = shuffle(pool).slice(0, Math.min(getLevelConfig(level).choices, pool.length));
  const correct = choices[0];
  const items = shuffle(choices.slice());
  const nearText = `Location: ${loc.name}. ${loc.clue}. Follow the green footsteps to the key.`;
  const farText = `The treasure belongs to the ${category} family. Look for the ${correct} among the red targets.`;
  return {
    location: loc.name,
    nearText,
    farText,
    choices: items,
    correct,
    timeLimit: getLevelConfig(level).timeLimit,
    steps: 6,
    clue: loc.clue
  };
}

function buildDefaultSession(code) {
  return {
    code: code,
    createdAt: new Date().toISOString(),
    connected: true,
    farConnected: true,
    nearConnected: false,
    status: 'waiting',
    phase: 'waiting',
    phaseStartedAt: Date.now(),
    score: 0,
    round: 0,
    level: 1,
    settings: { ...TVQ.DEFAULT_SETTINGS },
    summary: null,
    lastOutcome: null,
    stats: {
      attempts: 0,
      correct: 0,
      wrong: 0,
      timeouts: 0,
      firstAttemptCorrect: 0,
      firstAttemptTotal: 0,
      responseTimes: [],
      totalRounds: 0,
      sessionsMinutes: 30,
      difficultyChanges: []
    },
    currentRoundData: null,
    paused: false
  };
}

function saveSession(code, session) {
  try {
    PropertiesService.getScriptProperties().setProperty('tvq_' + code, JSON.stringify(session));
    return true;
  } catch (err) {
    return false;
  }
}

function loadSession(code) {
  const raw = PropertiesService.getScriptProperties().getProperty('tvq_' + code);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function createSession() {
  const code = generateIdCode();
  const session = buildDefaultSession(code);
  saveSession(code, session);
  return { ok: true, code, session };
}

function joinSession(code) {
  const session = loadSession(code.toUpperCase());
  if (!session) {
    return { ok: false, error: 'Session not found.' };
  }
  session.nearConnected = true;
  session.connected = true;
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function getSessionState(code) {
  const session = loadSession(String(code || '').toUpperCase());
  if (!session) {
    return { ok: false, error: 'Session not found.' };
  }
  return session;
}

function updateSettings(code, settings) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  session.settings = { ...session.settings, ...settings };
  session.level = Math.max(session.settings.minLevel || 1, Math.min(session.settings.maxLevel || 5, Number(session.settings.level || session.level)));
  session.settings.level = session.level;
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function startSession(code) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  session.status = 'playing';
  session.phase = 'near_clue';
  session.round += 1;
  session.currentRoundData = createRound(session.level, session.round);
  session.roundData = session.currentRoundData;
  session.phaseStartedAt = Date.now();
  session.roundTimer = session.currentRoundData.timeLimit;
  session.roundTimeLimit = session.currentRoundData.timeLimit;
  session.stats.totalRounds += 1;
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function pauseSession(code) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  session.paused = !session.paused;
  if (session.paused) {
    session.phase = 'paused';
  } else {
    session.phase = session.lastPhase || 'near_clue';
  }
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function advancePhase(code, phase) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  if (!session.currentRoundData) {
    if (!session.roundData) {
      session.currentRoundData = createRound(session.level, session.round || 1);
    } else {
      session.currentRoundData = session.roundData;
    }
  }
  session.phase = phase;
  session.phaseStartedAt = Date.now();
  session.lastPhase = phase;
  if (phase === 'near_selection') {
    session.currentRoundData = { ...session.currentRoundData, selectedChoice: null };
  }
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function answerChoice(code, answer) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  const round = session.currentRoundData || session.roundData;
  if (!round) return { ok: false };
  const elapsed = (Date.now() - Number(session.phaseStartedAt || Date.now())) / 1000;
  const isTimedOut = elapsed > Number(round.timeLimit || 0);
  session.stats.attempts += 1;
  session.stats.firstAttemptTotal += 1;
  session.stats.responseTimes.push(Math.min(30, Math.max(1, elapsed)));

  if (isTimedOut) {
    session.stats.timeouts += 1;
    session.phase = 'timeout';
    session.lastOutcome = 'timeout';
    session.stats.wrong += 1;
    session.score = Math.max(0, session.score - 5);
    saveSession(code.toUpperCase(), session);
    return { ok: true, session, result: 'timeout' };
  }

  if (String(answer).toLowerCase() === String(round.correct).toLowerCase()) {
    session.stats.correct += 1;
    session.stats.firstAttemptCorrect += 1;
    session.score += Math.max(10, Math.round((round.timeLimit - elapsed) * 3));
    session.lastOutcome = 'correct';
    session.phase = 'correct';
    adjustDifficulty(session, true);
  } else {
    session.stats.wrong += 1;
    session.score = Math.max(0, session.score - 3);
    session.lastOutcome = 'wrong';
    session.phase = 'wrong';
    session.stats.firstAttemptCorrect += 0;
    adjustDifficulty(session, false);
  }

  session.phaseStartedAt = Date.now();
  saveSession(code.toUpperCase(), session);
  return { ok: true, session, result: session.lastOutcome };
}

function timeoutRound(code) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  session.stats.timeouts += 1;
  session.stats.wrong += 1;
  session.phase = 'timeout';
  session.lastOutcome = 'timeout';
  session.score = Math.max(0, session.score - 5);
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function adjustDifficulty(session, correct) {
  if (!session.settings.adaptiveMode) return;
  const minLevel = Number(session.settings.minLevel || 1);
  const maxLevel = Number(session.settings.maxLevel || 5);
  if (correct) {
    session.level = Math.min(maxLevel, session.level + 1);
    session.stats.difficultyChanges.push({ type: 'up', level: session.level });
  } else {
    session.level = Math.max(minLevel, session.level - 1);
    session.stats.difficultyChanges.push({ type: 'down', level: session.level });
  }
}

function nextRound(code) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  session.phase = 'near_clue';
  session.round += 1;
  session.roundData = createRound(session.level, session.round);
  session.currentRoundData = session.roundData;
  session.phaseStartedAt = Date.now();
  session.roundTimeLimit = session.roundData.timeLimit;
  session.lastOutcome = null;
  session.stats.totalRounds += 1;
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function endSession(code) {
  const session = loadSession(code.toUpperCase());
  if (!session) return { ok: false };
  session.phase = 'summary';
  session.summary = computeSessionSummary(session);
  saveSession(code.toUpperCase(), session);
  return { ok: true, session };
}

function computeSessionSummary(session) {
  const total = Math.max(1, Number(session.stats.attempts || 0));
  const accuracy = Math.round((Number(session.stats.correct || 0) / total) * 100);
  const firstAttempt = (session.stats.firstAttemptTotal || 0) === 0 ? 0 : Math.round((Number(session.stats.firstAttemptCorrect || 0) / Number(session.stats.firstAttemptTotal || 1)) * 100);
  const mean = session.stats.responseTimes.length ? (session.stats.responseTimes.reduce((a, b) => a + b, 0) / session.stats.responseTimes.length).toFixed(1) : '0.0';
  const highestLevel = session.level || 1;
  const trend = session.score >= 0 ? 'stable' : 'declined';
  return {
    overallAccuracy: accuracy,
    firstAttemptAccuracy: firstAttempt,
    meanResponse: mean,
    correctAnswers: Number(session.stats.correct || 0),
    timeouts: Number(session.stats.timeouts || 0),
    highestLevel,
    trend,
    score: session.score || 0
  };
}

function exportSessionCsv(code) {
  const session = loadSession(code.toUpperCase());
  if (!session) return 'code,session_error\n';
  const summary = computeSessionSummary(session);
  const rows = [
    'Field,Value',
    `code,${session.code}`,
    `date,${new Date(session.createdAt || Date.now()).toISOString()}`,
    `score,${session.score || 0}`,
    `overall_accuracy,${summary.overallAccuracy}%`,
    `first_attempt_accuracy,${summary.firstAttemptAccuracy}%`,
    `mean_response_seconds,${summary.meanResponse}`,
    `correct_answers,${summary.correctAnswers}`,
    `timeouts,${summary.timeouts}`,
    `highest_level,${summary.highestLevel}`,
    `performance_trend,${summary.trend}`,
    `difficulty_level,${session.level || 1}`,
    `red_eye,${session.settings.eyeForRed || 'right'}`,
    `green_eye,${session.settings.eyeForGreen || 'left'}`
  ];
  return rows.join('\n');
}

function getActiveSessions() {
  const props = PropertiesService.getScriptProperties();
  const keys = props.getKeys();
  return keys.filter((k) => k.indexOf('tvq_') === 0).map((k) => props.getProperty(k));
}

function resetGameState() {
  const props = PropertiesService.getScriptProperties();
  const keys = props.getKeys();
  keys.filter((key) => key.indexOf('tvq_') === 0).forEach((key) => props.deleteProperty(key));
  return { ok: true };
}

function getPracticeSummary() {
  const sessions = getActiveSessions().map((s) => JSON.parse(s));
  return sessions;
}

function scriptTest() {
  const code = generateIdCode();
  const s = buildDefaultSession(code);
  saveSession(code, s);
  const created = createSession();
  const joined = joinSession(created.code);
  const started = startSession(created.code);
  const result = answerChoice(created.code, started.session.currentRoundData.correct);
  const csv = exportSessionCsv(created.code);
  return { code: created.code, joined, started, result, csv };
}

console.log('Treasure Vision Quest script loaded.');

