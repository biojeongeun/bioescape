// =========================================================================
// BIO-LAB ESCAPE : 2.5D Isometric RPG Biology Escape Room
// STAGE 1 (평화로운 생명과학 연구소) -> STAGE 2 (생물실 선물 코드 & 글리치 반전)
// -> STAGE 3 (아포칼립스 격리 구역 Sector A / B / C)
// =========================================================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const slotInputs = [
  document.getElementById('slot-0'),
  document.getElementById('slot-1'),
  document.getElementById('slot-2'),
];

const stage3Hud = document.getElementById('stage3-survival-hud');
const stage3SectorIndicator = document.getElementById('stage3-sector-indicator');
const sectorNameBadge = document.getElementById('sector-name-badge');
const canvasWrapper = document.getElementById('canvas-wrapper');
const zombieBar = document.getElementById('zombie-bar');
const zombieDistText = document.getElementById('zombie-dist-text');
const o2MetricRow = document.getElementById('o2-metric-row');
const o2Bar = document.getElementById('o2-bar');
const o2ValText = document.getElementById('o2-val-text');
const atpMetricRow = document.getElementById('atp-metric-row');
const atpBar = document.getElementById('atp-bar');
const atpValText = document.getElementById('atp-val-text');
const bioVitalWarning = document.getElementById('bio-vital-warning');

const terminalModal = document.getElementById('terminal-modal');
const modalStationTag = document.getElementById('modal-station-tag');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalSubjectBadge = document.getElementById('modal-subject-badge');
const modalSlotTarget = document.getElementById('modal-slot-target');
const modalTitle = document.getElementById('modal-title');
const modalLore = document.getElementById('modal-lore');
const modalDiagram = document.getElementById('modal-diagram');
const modalQuestion = document.getElementById('modal-question');
const modalHintArea = document.getElementById('modal-hint-area');
const modalHintBtn = document.getElementById('modal-hint-btn');
const modalHintBox = document.getElementById('modal-hint-box');
const modalOptions = document.getElementById('modal-options');
const modalFeedback = document.getElementById('modal-feedback');

const stage2Screen = document.getElementById('stage2-screen');
const giftCodeInput = document.getElementById('gift-code-input');
const giftSubmitBtn = document.getElementById('gift-submit-btn');
const glitchSequenceScreen = document.getElementById('glitch-sequence-screen');
const glitchDynamicText = document.getElementById('glitch-Dynamic-Text');
const glitchSubText = document.getElementById('glitch-Sub-Text');
const glitchOverlay = document.getElementById('glitch-overlay');
const ingameToast = document.getElementById('ingame-toast');

const charSelectScreen = document.getElementById('character-select-screen');
const selectFemaleBtn = document.getElementById('select-female-btn');
const selectMaleBtn = document.getElementById('select-male-btn');
const startStage1Btn = document.getElementById('start-stage1-btn');
const previewFemaleCanvas = document.getElementById('preview-female-canvas');
const previewMaleCanvas = document.getElementById('preview-male-canvas');
const fullscreenToggleBtn = document.getElementById('fullscreen-toggle-btn');

// -------------------------------------------------------------------------
// 전체화면(Fullscreen API) 제어: 인터넷 탭·주소창을 숨기고 몰입형 전체화면 전환
// -------------------------------------------------------------------------
function enterBrowserFullscreen() {
  try {
    const docEl = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    }
  } catch (_) {}
}

function toggleBrowserFullscreen() {
  try {
    const docEl = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  } catch (_) {}
}

function syncFullscreenBtnLabel() {
  if (!fullscreenToggleBtn) return;
  const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
  fullscreenToggleBtn.textContent = isFull ? '⛶ 창모드' : '⛶ 전체화면';
}

document.addEventListener('fullscreenchange', syncFullscreenBtnLabel);
document.addEventListener('webkitfullscreenchange', syncFullscreenBtnLabel);
if (fullscreenToggleBtn) {
  fullscreenToggleBtn.addEventListener('click', toggleBrowserFullscreen);
}

const finalVictoryScreen = document.getElementById('final-victory-screen');
const victoryStatsBox = document.getElementById('victory-stats-box');
const restartGameBtn = document.getElementById('restart-game-btn');

const gameOverScreen = document.getElementById('game-over-screen');
const gameOverReasonText = document.getElementById('gameover-reason-text');
const retryStage3Btn = document.getElementById('retry-stage3-btn');
const gameOverRestartBtn = document.getElementById('gameover-restart-btn');

// -------------------------------------------------------------------------
// Web Audio Synthesizer (외부 오디오 파일 없이 긴장감 넘치는 효과음/심장박동 생성)
// -------------------------------------------------------------------------
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  try {
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    if (type === 'interact') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'correct') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.15, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.23);
      });
    } else if (type === 'wrong') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.28);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    } else if (type === 'glitch') {
      for (let i = 0; i < 8; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(90 + Math.random() * 920, now + i * 0.09);
        gain.gain.setValueAtTime(0.16, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.08);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.085);
      }
    } else if (type === 'heartbeat') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(62, now);
      osc.frequency.exponentialRampToValueAtTime(34, now + 0.18);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (type === 'window_crack') {
      // 감염체가 유리창을 "쾅!" 내리치며 금이 가는 둔탁한 충격음 + 고주파 유리 균열음
      [0, 0.22].forEach((offset) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(92, now + offset);
        osc.frequency.exponentialRampToValueAtTime(28, now + offset + 0.2);
        gain.gain.setValueAtTime(0.32, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.21);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.22);
      });
      const crackOsc = audioCtx.createOscillator();
      const crackGain = audioCtx.createGain();
      crackOsc.type = 'sawtooth';
      crackOsc.frequency.setValueAtTime(1450, now + 0.05);
      crackOsc.frequency.exponentialRampToValueAtTime(380, now + 0.16);
      crackGain.gain.setValueAtTime(0.09, now + 0.05);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      crackOsc.connect(crackGain).connect(audioCtx.destination);
      crackOsc.start(now + 0.05);
      crackOsc.stop(now + 0.18);
    } else if (type === 'gameover') {
      // 캐릭터가 쓰러질 때 심전도 플랫라인(삐---) + 저음 암전 사운드
      const flatOsc = audioCtx.createOscillator();
      const flatGain = audioCtx.createGain();
      flatOsc.type = 'sine';
      flatOsc.frequency.setValueAtTime(980, now);
      flatGain.gain.setValueAtTime(0.14, now);
      flatGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      flatOsc.connect(flatGain).connect(audioCtx.destination);
      flatOsc.start(now);
      flatOsc.stop(now + 2.25);

      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.8);
      subGain.gain.setValueAtTime(0.22, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
      subOsc.connect(subGain).connect(audioCtx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.95);
    }
  } catch (_) {
    // Ignore audio context restrictions
  }
}

// -------------------------------------------------------------------------
// 배경 이미지 로드 (아이소메트릭 2.5D 연구실 Stage 1 & Stage 3)
// -------------------------------------------------------------------------
const bgStage1 = new Image();
bgStage1.src = 'assets/stage1_bright.jpg';

const bgStage3 = new Image();
bgStage3.src = 'assets/stage3_apocalypse.jpg';

// -------------------------------------------------------------------------
// 아이소메트릭 방 바닥 이동 가능 다각형 및 중앙 실험대 투명 히트박스(충돌영역)
// -------------------------------------------------------------------------
const FLOOR_POLYGON = [
  { x: 520, y: 405 }, // 상단 중앙 코너
  { x: 960, y: 550 }, // 우측 코너
  { x: 640, y: 705 }, // 하단 코너
  { x: 205, y: 535 }, // 좌측 코너
];

// 캐릭터가 뚫고 지나가지 못하는 투명 장애물 히트박스 (중앙 원통 배양기 & 실험대 등)
const OBSTACLE_HITBOXES = [
  // 중앙 메인 유전자/배양 실린더 데스크
  { x: 470, y: 445, w: 265, h: 135, label: '중앙 배양 제어대' },
  // 좌하단 현미경 테이블
  { x: 200, y: 505, w: 235, h: 145, label: '광학 현미경 테이블' },
  // 우하단 유전체 분석 PC 데스크
  { x: 830, y: 540, w: 190, h: 120, label: '유전체 분석 콘솔' },
];

// -------------------------------------------------------------------------
// 교육과정 기반 문제 데이터베이스
// - STAGE 1 (평화로운 연구소, 보안코드 4 - 2 - 3)
// - STAGE 3 (아포칼립스 격리 구역 3개 섹터:
//   * Sector A [대사·신경 격리실]: 보안코드 3 - 4 - 2
//   * Sector B [유전·분자생물학 격리실]: 보안코드 6 - 3 - 5
//   * Sector C [최신 바이오 뉴스·항바이러스 격리실]: 보안코드 2 - 4 - 8 )
// -------------------------------------------------------------------------
const STAGE_DATA = {
  stage1: {
    code: ['4', '2', '3'],
    sectorTitle: 'STAGE 1 : 평화로운 도시 생명과학 연구소',
    stations: [
      {
        id: 's1_screen',
        tag: 'BIO-SCREEN #01',
        name: '좌측 발광 생물학 모식도 스크린',
        x: 335,
        y: 355,
        interactX: 395,
        interactY: 455,
        hitW: 190,
        hitH: 130,
        slotIndex: 0,
        digit: '4',
        subject: '고1 통합과학 · 세포와 물질대사',
        title: '홀로그램 세포소기관 & ATP 합성 모식도',
        lore: '좌측 벽면에서 푸른빛으로 발광하는 생물학 모식도 스크린입니다. 진핵세포 내 두 종류의 에너지 전환 세포소기관 (가)와 (나)의 물질 이동 경로가 표시되어 있습니다.',
        diagram:
`[발광 스크린 모식도]
• 소기관 (가): 빛에너지 → 포도당 합성 (틸라코이드 막 & 스트로마)
• 소기관 (나): 포도당 + O₂ → CO₂ + H₂O + 다량의 ATP (크리스테 & 기질)
• 효소(카탈레이스) 실험: 과산화 수소(H₂O₂) → 물(H₂O) + 산소(O₂) (활성화 에너지 감소)`,
        question: 'Q1. 위 발광 모식도에 대한 설명으로 옳은 것만을 모두 고른 번호(보안코드 1번째 숫자)는?',
        hint: '💡 [연구 노트 힌트] (가)는 광합성이 일어나는 엽록체(식물만 보유), (나)는 세포 호흡이 일어나는 미토콘드리아입니다. 효소는 활성화 에너지를 "낮추며", 엽록체와 미토콘드리아는 모두 외막·내막의 [2중막] 구조이고 자체 DNA와 리보솜을 가집니다!',
        options: [
          { num: '1', text: '① (가)는 동물 세포와 식물 세포에 모두 존재한다.' },
          { num: '2', text: '② (나)에서 합성된 ATP는 생명 활동에 쓰이지 않고 모두 열로만 방출된다.' },
          { num: '3', text: '③ 효소는 화학 반응의 활성화 에너지를 높여 반응 속도를 빠르게 한다.' },
          { num: '4', text: '④ (가)와 (나)는 모두 2중막 구조이며 자체 DNA와 리보솜을 가진다. [정답 → 코드 4]' },
          { num: '5', text: '⑤ 세포막의 인지질 2중층은 친수성 꼬리가 안쪽을 향한다.' },
        ],
        answer: '4',
        explanation: '정답입니다! 엽록체(가)와 미토콘드리아(나)는 모두 2중막 구조를 가지며 자체 DNA와 리보솜이 있어 반자율적 복제가 가능합니다. [보안코드 1번째 자리: 4 획득!]',
      },
      {
        id: 's1_microscope',
        tag: 'BIO-OPTICS #02',
        name: '광학 현미경 & 적혈구 삼투압 분석대',
        x: 295,
        y: 545,
        interactX: 385,
        interactY: 530,
        hitW: 155,
        hitH: 110,
        slotIndex: 1,
        digit: '2',
        subject: '고1 통합과학 · 세포막을 통한 물질 이동',
        title: '세포막의 선택적 투과성과 삼투 현상 실험',
        lore: '연구실 좌측 하단의 고배율 광학 현미경입니다. 적혈구와 양파 표피세포를 각각 저장액, 등장액, 고장액에 넣었을 때의 부피 변화를 측정하고 있습니다.',
        diagram:
`[현미경 관찰 기록]
• 용액 A (체액보다 낮은 농도): 적혈구로 물이 유입되어 세포가 부풀어 오름(용혈 현상)
• 용액 B (체액과 같은 0.9% NaCl): 물의 유입량 = 유출량 (부피 일정)
• 용액 C (체액보다 높은 농도): 식물세포에서 세포벽과 세포막이 분리됨(원형질 분리)`,
        question: 'Q2. 세포막을 통한 물질 이동에 대한 설명으로 옳은 번호(보안코드 2번째 숫자)를 고르시오.',
        hint: '💡 [연구 노트 힌트] 확산(단순 확산·촉진 확산)은 모두 고농도→저농도로 이동하므로 ATP가 소모되지 않습니다! 특히 산소(O₂)와 이산화 탄소(CO₂) 같은 작은 기체 분자는 막단백질 없이 [인지질 2중층을 직접 통과(단순 확산)]합니다.',
        options: [
          { num: '1', text: '① 용액 A는 적혈구 내부보다 삼투압이 높은 고장액이다.' },
          { num: '2', text: '② 산소(O₂)와 이산화 탄소(CO₂)는 세포막의 인지질 2중층을 통해 직접 단순 확산된다. [정답 → 코드 2]' },
          { num: '3', text: '③ 포도당과 아미노산 같은 수용성 물질은 막단백질 도움 없이 인지질 층을 직접 통과한다.' },
          { num: '4', text: '④ 확산 현상이 일어날 때는 반드시 ATP가 소모된다.' },
          { num: '5', text: '⑤ 용액 C에 넣은 적혈구는 물을 흡수하여 터진다.' },
        ],
        answer: '2',
        explanation: '정답입니다! O₂와 CO₂ 같은 기체 분자는 분자 크기가 작고 무극성이어서 ATP 소모 없이 인지질 2중층을 직접 통과하는 단순 확산을 합니다. [보안코드 2번째 자리: 2 획득!]',
      },
      {
        id: 's1_sequencer',
        tag: 'GENE-CORE #03',
        name: '중앙 유전자 전사·번역 시퀀서',
        x: 595,
        y: 485,
        interactX: 550,
        interactY: 575,
        hitW: 165,
        hitH: 135,
        slotIndex: 2,
        digit: '3',
        subject: '고1 통합과학 · 생명 시스템과 유전정보의 흐름',
        title: '중심원리(Central Dogma) 코돈 해독기',
        lore: '연구소 정중앙의 청록색 바이오 실린더와 연결된 유전자 판독 장치입니다. 정상 항체 단백질의 짧은 펩타이드 서열을 분석하고 있습니다.',
        diagram:
`[유전자 분석 데이터]
• 주형 가닥 DNA 염기서열 : 3' - T A C G G C A T T C C A - 5'
• 전사된 mRNA 염기서열   : 5' - A U G C C G U A A G G U - 3'
• 조건: 개시 코돈은 AUG이며, 종결 코돈(UAA, UAG, UGA)은 아미노산을 지정하지 않음.`,
        question: 'Q3. 위 mRNA가 리보솜에서 번역될 때, 종결 코돈에 의해 번역이 멈추기 전까지 합성되는 펩타이드를 구성하는 아미노산의 개수는 몇 개인가? (단, 메싸이오닌이 제거되지 않는다고 가정하며, 정답 번호가 보안코드 3번째 숫자)',
        hint: '💡 [연구 노트 힌트] mRNA 염기를 3개씩(코돈 단위로) 끊어 읽어보세요: [AUG] - [CCG] - [UAA] - [GGU]. 첫 번째 AUG와 두 번째 CCG는 아미노산을 지정하지만, 세 번째 [UAA]는 종결 코돈이라 아미노산을 지정하지 않고 번역이 끝납니다! (총 아미노산 2개 → 선지 ③번)',
        options: [
          { num: '1', text: '① 1개 (AUG만 번역됨)' },
          { num: '2', text: '② 4개 (모든 코돈이 아미노산을 지정함)' },
          { num: '3', text: '③ 2개 (AUG → CCU/CCG 번역 후 3번째 코돈 UAA가 종결 코돈이므로 총 2개 아미노산 결합) [정답 → 코드 3]' },
          { num: '4', text: '④ 6개 (염기 2개당 아미노산 1개 지정)' },
          { num: '5', text: '⑤ 12개 (염기 1개당 아미노산 1개 지정)' },
        ],
        answer: '3',
        explanation: '정답입니다! mRNA 서열 5\'-AUG(개시 코돈, 1번째 아미노산)-CCG(2번째 아미노산)-UAA(종결 코돈)-GGU-3\'에서 UAA는 종결 코돈이므로 총 2개의 아미노산으로 이루어진 다이펩타이드가 합성됩니다. (선지 3번 정답!) [보안코드 3번째 자리: 3 획득!]',
      },
      {
        id: 's1_window',
        tag: 'OBSERVATION WINDOW',
        name: '대형 강화 유리 관찰창 (평화로운 도시)',
        x: 615,
        y: 255,
        interactX: 590,
        interactY: 420,
        hitW: 250,
        hitH: 130,
        slotIndex: null,
        isLoreOnly: true,
        subject: '연구소 외부 관찰창',
        title: '대형 강화 유리 관찰창 — 평화로운 바이오 시티',
        lore: '강화 유리창 너머로 따사로운 햇살이 비치는 도시의 스카이라인이 보입니다. 아직까지는 아무런 이상 징후도 보이지 않는 평화로운 오후입니다.',
        diagram: `[도시 대기 및 생물 안전도 모니터]\n• 외부 대기 산소 농도 : 20.9% (정상)\n• 바이오 해저드 경보 단계 : LEVEL 0 (안전)\n• 안내: 연구실 내 3곳의 실험 장비(!)를 조사하여 보안코드 3자리를 완성한 뒤 우측 EXIT-LOCKED 격리문으로 이동하세요.`,
        question: '관찰창 점검을 마쳤습니다. 다른 실험 장비를 조사해 보안코드를 획득하세요.',
        options: [],
      },
      {
        id: 's1_exit',
        tag: 'EXIT-LOCKED DOOR',
        name: 'EXIT-LOCKED 격리 철문',
        x: 985,
        y: 415,
        interactX: 865,
        interactY: 515,
        hitW: 145,
        hitH: 165,
        slotIndex: null,
        isExitDoor: true,
      },
    ],
  },

  // =========================================================================
  // STAGE 3 : 좀비 아포칼립스 생물연구소 격리 구역 (총 3개 방/구역 연쇄 탈출!)
  // =========================================================================
  stage3_sectors: [
    // -----------------------------------------------------------------------
    // SECTOR A : 세포 호흡 · 물질대사 · 신경계 격리실 (코드: 3 - 4 - 2)
    // -----------------------------------------------------------------------
    {
      code: ['3', '4', '2'],
      sectorTitle: 'STAGE 3 [구역 1/3] : 대사·신경 생리학 격리실',
      stations: [
        {
          id: 's3a_screen',
          tag: 'NEURO-SYNAPSE #A1',
          name: '좌측 변이 신경 전도 모식도 스크린',
          x: 335,
          y: 355,
          interactX: 395,
          interactY: 455,
          hitW: 190,
          hitH: 130,
          slotIndex: 0,
          digit: '3',
          subject: '고2·3 생명과학Ⅰ · 흥분의 전도와 전달',
          title: '감염체 신경독소와 막전위 이온 통로 분석',
          lore: '붉은 비상등 아래 발광하는 신경 생리학 스크린입니다. 외부 감염체(좀비) 바이러스가 분비하는 신경 변이 물질 X를 처리했을 때 축삭돌기 한 지점의 막전위 변화를 분석하고 있습니다.',
          diagram:
`[축삭돌기 막전위 이온 투과도 분석]
• 구간 Ⅰ (탈분극): 전압 개폐성 Na⁺ 통로 열림 → Na⁺이 세포 안으로 대량 유입 (막전위 상승)
• 구간 Ⅱ (재분극): K⁺ 통로 열림 → K⁺이 세포 밖으로 유출 (막전위 하강)
• Na⁺-K⁺ 펌프: ATP를 소모하여 Na⁺을 세포 밖으로, K⁺을 세포 안으로 능동 수송`,
          question: 'Q1. 신경 세포의 흥분 전도와 시냅스 전달에 대한 설명으로 옳은 번호(보안코드 1번째 숫자)는?',
          hint: '💡 [연구 노트 힌트] K⁺ 농도는 항상 세포 안이 밖보다 높고, 이온 통로를 통한 Na⁺·K⁺ 이동은 확산이므로 ATP가 직접 쓰이지 않습니다. 반면 축삭돌기 말단에서 시냅스 소포가 세포막과 융합해 신경전달물질을 분비하는 [세포외배출] 과정에는 ATP가 사용됩니다!',
          options: [
            { num: '1', text: '① 휴지 전위 상태에서 K⁺의 농도는 항상 세포 밖이 세포 안보다 높다.' },
            { num: '2', text: '② 탈분극 시 Na⁺이 통로를 통해 세포 안으로 들어올 때 다량의 ATP가 직접 소모된다.' },
            { num: '3', text: '③ 시냅스 소포에서 아세틸콜린 같은 신경전달물질이 시냅스 틈으로 분비될 때 세포외배출(막융합)이 일어나며 ATP가 사용된다. [정답 → 코드 3]' },
            { num: '4', text: '④ 말이집 신경에서는 말이집으로 싸여 있는 부분에서만 도약전도가 일어난다.' },
            { num: '5', text: '⑤ 흥분의 전달 방향은 가지돌기에서 시냅스 틈을 거쳐 이전 뉴런의 축삭돌기 말단으로 이동한다.' },
          ],
          answer: '3',
          explanation: '정답입니다! 축삭돌기 말단의 시냅스 소포가 세포막과 융합하여 신경전달물질을 분비하는 과정(세포외배출)에는 ATP가 소모됩니다. [구역 1 보안코드 1번째 자리: 3]',
        },
        {
          id: 's3a_sequencer',
          tag: 'ATP-REACTOR #A2',
          name: '중앙 미토콘드리아 ATP-산소 반응기',
          x: 595,
          y: 485,
          interactX: 550,
          interactY: 575,
          hitW: 165,
          hitH: 135,
          slotIndex: 1,
          digit: '4',
          subject: '세포와 물질대사 · 세포 호흡과 산화적 인산화',
          title: '미토콘드리아 내막 전자전달계 & 화학 삼투 분석기',
          lore: '연구실 내 잔여 산소(O₂)와 연구원의 생체 ATP가 급격히 고갈되고 있습니다! 중앙 녹색 발광 반응기에서 미토콘드리아의 전자전달계 저해제를 해독해야 산소 공급 밸브가 열립니다.',
          diagram:
`[미토콘드리아 세포 호흡 경로]
1) 해당 과정 (세포질): 포도당(6C) → 2 피루브산(3C) + 2 ATP + 2 NADH
2) 피루브산 산화 & TCA 회로 (미토콘드리아 기질): NADH, FADH₂, CO₂, 기질수준 인산화(ATP) 생성
3) 산화적 인산화 (미토콘드리아 내막): 전자전달계를 거쳐 최종 전자 수용체인 O₂가 전자와 H⁺을 받아 H₂O 생성`,
          question: 'Q2. 미토콘드리아의 세포 호흡과 ATP 합성에 대한 설명으로 옳은 번호(보안코드 2번째 숫자)는?',
          hint: '💡 [연구 노트 힌트] 미토콘드리아 내막의 전자전달계에서 전자를 최종적으로 받는 수용체는 [산소(O₂)]입니다! 이때 미토콘드리아 기질에서 막사이 공간으로 퍼낸 H⁺ 농도 기울기를 이용해 ATP 합성 효소에서 다량의 ATP가 합성됩니다.',
          options: [
            { num: '1', text: '① 해당 과정은 미토콘드리아 기질에서 일어나며 산소(O₂)가 직접 소모된다.' },
            { num: '2', text: '② 전자전달계가 작동할 때 H⁺은 막사이 공간에서 미토콘드리아 기질로 능동 수송된다.' },
            { num: '3', text: '③ TCA 회로에서는 산화적 인산화를 통해 포도당 1분자당 28분자의 ATP가 직접 합성된다.' },
            { num: '4', text: '④ 전자전달계의 최종 전자 수용체는 산소(O₂)이며, 막사이 공간과 기질의 H⁺ 농도 기울기에 의해 ATP 합성 효소에서 ATP가 합성된다. [정답 → 코드 4]' },
            { num: '5', text: '⑤ 무산소 호흡(젖산 발효) 과정에서도 피루브산이 TCA 회로를 거쳐 CO₂를 방출한다.' },
          ],
          answer: '4',
          explanation: '정답입니다! 산화적 인산화에서 최종 전자 수용체는 산소(O₂)이며, 전자전달계를 통해 형성된 막사이 공간(고농도 H⁺)과 기질(저농도 H⁺) 사이의 수소 이온 농도 기울기를 이용해 화학 삼투적 인산화로 ATP가 합성됩니다. [보너스: 잔여 산소 & ATP 회복! / 코드 2번째 자리: 4]',
        },
        {
          id: 's3a_microscope',
          tag: 'IMMUNE-SCAN #A3',
          name: '항원-항체 면역 반응 현미경',
          x: 295,
          y: 545,
          interactX: 385,
          interactY: 530,
          hitW: 155,
          hitH: 110,
          slotIndex: 2,
          digit: '2',
          subject: '고2·3 생명과학Ⅰ · 방어 작용과 면역',
          title: 'Z-바이러스 특이적 면역 및 기억세포 활성 판독기',
          lore: '감염체의 체액 샘플을 분석 중인 면역 현미경입니다. 백신 후보 물질 투여 후 1차 면역 반응과 2차 면역 반응에서의 혈중 항체 농도 그래프가 출력되어 있습니다.',
          diagram:
`[항원 X 주사 후 항체 농도 변화]
• 1차 침입: 보조 T 림프구 활성화 → B 림프구가 형질세포와 기억세포로 분화 (잠복기 후 항체 생성)
• 2차 침입: 동일 항원 X 재침입 시 [ (가) 세포 ]가 빠르게 형질세포로 분화하여 단시간에 다량의 항체 생성`,
          question: 'Q3. 인체의 특이적 방어 작용에 대한 설명으로 옳은 번호(보안코드 3번째 숫자)는?',
          hint: '💡 [연구 노트 힌트] B 림프구가 형질세포로 분화해 항체를 만드는 것은 체액성 면역이고, 활성화된 [세포독성 T 림프구]가 바이러스에 감염된 세포를 직접 파괴하는 것은 세포성 면역입니다!',
          options: [
            { num: '1', text: '① 형질세포는 다시 기억세포로 분화하여 반영구적으로 체내에 남는다.' },
            { num: '2', text: '② 세포독성 T 림프구는 바이러스에 감염된 세포를 직접 파괴하는 세포성 면역을 담당한다. [정답 → 코드 2]' },
            { num: '3', text: '③ 백신 주사는 이미 만들어진 항체를 직접 넣어주는 수동 면역(혈청 주사)에 해당한다.' },
            { num: '4', text: '④ ABO식 혈액형 판정에서 O형 적혈구 표면에는 응집원 A와 응집원 B가 모두 존재한다.' },
            { num: '5', text: '⑤ 대식세포의 식균 작용은 특정 항원만 선택적으로 인식하는 후천성(특이적) 면역이다.' },
          ],
          answer: '2',
          explanation: '정답입니다! 세포독성 T 림프구는 바이러스 감염 세포나 암세포를 직접 공격하여 파괴하는 세포성 면역을 수행합니다. [구역 1 보안코드 3번째 자리: 2]',
        },
        {
          id: 's3a_window',
          tag: 'APOCALYPSE WINDOW',
          name: '대형 강화 유리 관찰창 (아포칼립스 도시)',
          x: 615,
          y: 255,
          interactX: 590,
          interactY: 420,
          hitW: 250,
          hitH: 130,
          slotIndex: null,
          isLoreOnly: true,
          subject: '외부 격리 구역 관측',
          title: '비상 관측창 — 봉쇄된 아포칼립스 도시',
          lore: '붉은 탐조등과 헬기가 오가는 암흑의 도시가 보입니다. 좀비 떼가 연구소 외벽까지 접근하고 있습니다! 유리창에 충격파 진동이 느껴집니다.',
          diagram: `[경고: ZOMBIE PROXIMITY ALERT]\n• 문제를 틀리거나 시간이 지체되면 좀비와의 거리가 좁혀지고 산소/ATP가 감소합니다!\n• 3개의 구역(대사·신경 → 생물의 유전 → 최신 바이오 뉴스)을 모두 돌파해야 탈출할 수 있습니다.`,
          question: '서둘러 실험 장비를 조사해 보안코드를 완성하고 우측 격리문을 여세요!',
          options: [],
        },
        {
          id: 's3a_exit',
          tag: 'QUARANTINE DOOR',
          name: 'EXIT-LOCKED 제1격리 철문',
          x: 985,
          y: 415,
          interactX: 865,
          interactY: 515,
          hitW: 145,
          hitH: 165,
          slotIndex: null,
          isExitDoor: true,
        },
      ],
    },

    // -----------------------------------------------------------------------
    // SECTOR B : 생물의 유전 · 고난도 유전학 격리실 (코드: 6 - 3 - 5)
    // -----------------------------------------------------------------------
    {
      code: ['6', '3', '5'],
      sectorTitle: 'STAGE 3 [구역 2/3] : 생물의 유전 · 염색체 격리실',
      stations: [
        {
          id: 's3b_screen',
          tag: 'KARYOTYPE-SCREEN #B1',
          name: '좌측 감수 분열 & DNA 상대량 스크린',
          x: 335,
          y: 355,
          interactX: 395,
          interactY: 455,
          hitW: 190,
          hitH: 130,
          slotIndex: 0,
          digit: '6',
          subject: '생물의 유전 · 세포 주기와 감수 분열',
          title: '핵상(2n=6) 생물의 감수 분열 & DNA 상대량 분석',
          lore: '항바이러스 수용체 유전자를 가진 개체(2n=6)의 생식세포 분열 과정을 추적하는 발광 스크린입니다. 감수 1분열 중기 세포에 들어 있는 염색분체의 총수를 이용해 암호를 설정했습니다.',
          diagram:
`[세포 분열 분석 데이터]
• 개체의 체세포 염색체 수 : 2n = 6
• 감수 1분열 중기 세포 1개당 2가 염색체(4분 염색체) 수 = a 개
• 감수 2분열 중기 세포 1개당 염색체 수 = b 개
• 암호 계산식 : (a + b)의 값 = ?`,
          question: 'Q1. 2n = 6인 동물에서 감수 1분열 중기 세포 1개당 관찰되는 [2가 염색체의 수(a)]와 감수 2분열 중기 세포 1개당 [염색체 수(b)]를 더한 값(a + b)은 얼마인가? (정답 숫자가 보안코드 1번째 자리)',
          hint: '💡 [연구 노트 힌트] 2n = 6이므로 상동 염색체가 3쌍입니다. 감수 1분열 중기에는 상동 염색체끼리 접합한 [2가 염색체]가 3개(a=3) 관찰되고, 감수 2분열 중기에는 핵상이 n=3이므로 염색체가 3개(b=3) 들어 있습니다. 따라서 a + b = 3 + 3 = 6입니다!',
          options: [
            { num: '3', text: '① 3 (a=1, b=2)' },
            { num: '4', text: '② 4 (a=2, b=2)' },
            { num: '6', text: '③ 6 (2n=6이므로 2가 염색체 수 a=3, 감수 2분열 중기 핵상 n=3이므로 염색체 수 b=3 → 3+3=6) [정답 → 코드 6]' },
            { num: '8', text: '④ 8 (a=4, b=4)' },
            { num: '9', text: '⑤ 9 (a=6, b=3)' },
          ],
          answer: '6',
          explanation: '정답입니다! 2n=6인 세포에서 상동 염색체는 3쌍이므로 감수 1분열 중기에 형성되는 2가 염색체 수(a)는 3개입니다. 감수 1분열에서 상동 염색체가 분리되므로 감수 2분열 중기 세포(n=3)의 염색체 수(b)도 3개입니다. 따라서 a + b = 6입니다! [구역 2 보안코드 1번째 자리: 6]',
        },
        {
          id: 's3b_microscope',
          tag: 'PEDIGREE-LAB #B2',
          name: '가계도 & 반성유전 분석 현미경',
          x: 295,
          y: 545,
          interactX: 385,
          interactY: 530,
          hitW: 155,
          hitH: 110,
          slotIndex: 1,
          digit: '3',
          subject: '생물의 유전 · 사람의 유전과 가계도 분석',
          title: '바이러스 저항성 유전자(X 염색체 연관) 가계도 판독',
          lore: '좀비 바이러스에 감염되지 않는 희귀 면역 형질(유전자 R/r)을 가진 가족의 가계도 분석표입니다. 우열 관계와 염색체 위치를 판독해야 합니다.',
          diagram:
`[가계도 핵심 단서]
• 형질 결정 유전자: 대립유전자 A와 a에 의해 결정 (A는 a에 대해 완전 우성)
• 부모 (아버지: 정상 표현형, 어머니: 정상 표현형) 사이에서 [유전병을 가진 아들]이 태어남.
• 단, 아버지는 유전병 대립유전자를 전혀 가지고 있지 않음(DNA 상대량 = 0).`,
          question: 'Q2. 위 가계도 단서에 대한 분석으로 옳은 번호(보안코드 2번째 숫자)를 고르시오.',
          hint: '💡 [연구 노트 힌트] "정상 부모 사이에서 유전병 자녀 출생 → 유전병은 열성!" 또한 아버지가 유전병 대립유전자를 전혀 안 가졌는데도 유전병 아들이 태어났다면, 아들은 아버지에게 Y를 받고 어머니에게 유전병 유전자가 있는 [X 염색체]를 물려받은 것입니다!',
          options: [
            { num: '1', text: '① 이 유전병 형질은 정상에 대해 우성 형질이다.' },
            { num: '2', text: '② 이 유전병 유전자는 상염색체에 존재한다.' },
            { num: '3', text: '③ 유전병은 열성 형질이며 X 염색체에 존재하고, 어머니는 보인자(X^A X^a)이다. [정답 → 코드 3]' },
            { num: '4', text: '④ 유전병 아들의 유전병 대립유전자는 아버지로부터 물려받은 것이다.' },
            { num: '5', text: '⑤ 이 부모 사이에서 딸이 태어날 때 그 딸이 유전병을 나타낼 확률은 50%이다.' },
          ],
          answer: '3',
          explanation: '정답입니다! 정상 부모 사이에서 유전병 자녀가 태어났으므로 유전병은 열성(a)입니다. 아버지가 유전병 대립유전자(a)를 전혀 가지지 않는데도 유전병 아들이 태어났으므로 X 염색체 반성유전(아들은 X^a Y)이며, 어머니는 이형접합 보인자(X^A X^a)입니다! [구역 2 보안코드 2번째 자리: 3]',
        },
        {
          id: 's3b_sequencer',
          tag: 'NONDISJUNCTION #B3',
          name: '우하단 염색체 비분리 & 돌연변이 콘솔',
          x: 915,
          y: 575,
          interactX: 805,
          interactY: 565,
          hitW: 165,
          hitH: 115,
          slotIndex: 2,
          digit: '5',
          subject: '생물의 유전 · 염색체 수 이상과 비분리',
          title: '감수 분열 염색체 비분리 시기 판독 콘솔',
          lore: '우측 하단 유전체 분석 콘솔에서 생식세포 형성 과정 중 성염색체 비분리가 일어난 시기를 역추적하고 있습니다.',
          diagram:
`[적록 색맹(X 염색체 열성, X') 비분리 분석]
• 아버지: 정상 시력 (XY)
• 어머니: 정상 시력 보인자 (X X')
• 태어난 자녀 ㉠: 클라인펠터 증후군(44 + XXY)이면서 동시에 [적록 색맹(X'X'Y)]을 나타냄!
  (단, 염색체 비분리는 부모 중 한 사람의 생식세포 형성 과정에서만 1회 일어남)`,
          question: 'Q3. 위 자녀 ㉠(X\'X\'Y, 적록 색맹)이 태어난 원인으로 가장 타당한 번호(보안코드 3번째 숫자)는?',
          hint: '💡 [연구 노트 힌트] 아버지는 정상(XY)이라 색맹 대립유전자(X\')가 아예 없습니다! 따라서 자녀(X\'X\'Y)가 가진 2개의 X\'는 모두 보인자 어머니(XX\')에게서 온 것이며, 동일한 X\'가 2개 들어갔으므로 어머니의 [감수 2분열]에서 염색분체 비분리가 일어난 것입니다!',
          options: [
            { num: '1', text: '① 아버지의 감수 1분열에서 성염색체 비분리가 일어났다.' },
            { num: '2', text: '② 아버지의 감수 2분열에서 Y 염색체 비분리가 일어났다.' },
            { num: '3', text: '③ 어머니의 감수 1분열에서 X 염색체 비분리가 일어나 X X\' 난자가 형성되었다.' },
            { num: '4', text: '④ 부모 모두 정상 생식세포를 만들었으나 수정 후 체세포 분열에서 Y가 소실되었다.' },
            { num: '5', text: '⑤ 어머니의 감수 2분열에서 X\' 염색분체가 비분리되어 형성된 난자(X\'X\')와 정상 정자(Y)가 수정되었다. [정답 → 코드 5]' },
          ],
          answer: '5',
          explanation: '정답입니다! 아버지는 X\'가 없는 정상(XY)이고 어머니는 보인자(XX\')이므로, 자녀 ㉠(X\'X\'Y)의 X\' 2개는 모두 어머니의 감수 2분열에서 X\'의 염색분체 비분리로 형성된 난자(X\'X\')에서 유래한 것입니다! [구역 2 보안코드 3번째 자리: 5]',
        },
        {
          id: 's3b_exit',
          tag: 'QUARANTINE DOOR',
          name: 'EXIT-LOCKED 제2격리 철문',
          x: 985,
          y: 415,
          interactX: 865,
          interactY: 515,
          hitW: 145,
          hitH: 165,
          slotIndex: null,
          isExitDoor: true,
        },
      ],
    },

    // -----------------------------------------------------------------------
    // SECTOR C : 최신 생명과학 뉴스 · 노벨상 · 유전자 가위 격리실 (코드: 2 - 4 - 8)
    // -----------------------------------------------------------------------
    {
      code: ['2', '4', '8'],
      sectorTitle: 'STAGE 3 [최종 구역 3/3] : 최신 바이오 기술 · 최종 탈출 구역',
      stations: [
        {
          id: 's3c_screen',
          tag: 'CRISPR-CAS9 #C1',
          name: '좌측 CRISPR-Cas9 유전자 가위 스크린',
          x: 335,
          y: 355,
          interactX: 395,
          interactY: 455,
          hitW: 190,
          hitH: 130,
          slotIndex: 0,
          digit: '2',
          subject: '최신 생명과학 뉴스 · 유전자 편집 기술 (CRISPR-Cas9)',
          title: '크리스퍼 유전자 가위(CRISPR-Cas9) 바이러스 수용체 교정',
          lore: '최신 임상 승인된 유전자 가위 치료제(Casgevy 등)의 원리를 응용해 좀비 바이러스가 결합하는 세포 표면 수용체 유전자를 정밀 교정하려는 발광 스크린입니다.',
          diagram:
`[CRISPR-Cas9 복합체 구성 요소]
• 구성 1 [가이드 RNA (gRNA)] : 표적 DNA의 특정 염기서열과 상보적으로 결합하여 위치를 안내함
• 구성 2 [Cas9 단백질] : 표적 위치의 DNA 이중 가닥을 절단하는 핵산가수분해효소(가위 역할)`,
          question: 'Q1. 최신 유전자 편집 기술인 CRISPR-Cas9에 대한 설명으로 옳은 번호(보안코드 1번째 숫자)는?',
          hint: '💡 [연구 노트 힌트] 크리스퍼 유전자 가위에서 [가이드 RNA(gRNA)]는 표적 DNA 염기서열과 상보적으로 결합해 길잡이(안내) 역할을 하고, 실제로 DNA 사슬을 자르는 가위 역할은 [Cas9 단백질 효소]가 담당합니다!',
          options: [
            { num: '1', text: '① 가이드 RNA(gRNA)가 직접 DNA의 인산디에스테르 결합을 가수분해하여 절단한다.' },
            { num: '2', text: '② 가이드 RNA가 표적 DNA 서열과 상보적으로 결합해 위치를 안내하고, Cas9 효소가 DNA를 절단한다. [정답 → 코드 2]' },
            { num: '3', text: '③ CRISPR-Cas9은 본래 진핵생물(포유류)의 적혈구에서만 발견되던 산소 운반 단백질이다.' },
            { num: '4', text: '④ 원하는 유전자를 편집하기 위해서는 매번 새로운 제한효소 단백질을 처음부터 합성해야만 표적을 바꿀 수 있다.' },
            { num: '5', text: '⑤ DNA가 아닌 지질 이중층의 지방산 사슬만 선택적으로 절단하는 기술이다.' },
          ],
          answer: '2',
          explanation: '정답입니다! 세균의 적응 면역 체계에서 유래한 CRISPR-Cas9은 가이드 RNA(gRNA)가 상보적 염기 결합으로 표적 DNA를 찾아가고, Cas9 단백질이 DNA를 절단합니다. [최종 구역 보안코드 1번째 자리: 2]',
        },
        {
          id: 's3c_sequencer',
          tag: 'NOBEL-BIO #C2',
          name: '중앙 마이크로RNA(miRNA) & mRNA 백신 제어기',
          x: 595,
          y: 485,
          interactX: 550,
          interactY: 575,
          hitW: 165,
          hitH: 135,
          slotIndex: 1,
          digit: '4',
          subject: '최신 생명과학 논문·뉴스 · 노벨 생리의학상 (miRNA & mRNA)',
          title: '전사 후 유전자 발현 조절(miRNA) 및 mRNA 백신 기술',
          lore: '최근 노벨 생리의학상 수상 주제로 학계와 뉴스에서 크게 주목받은 마이크로RNA(miRNA)의 유전자 조절 기작과 지질 나노입자(LNP) 기반 mRNA 백신 합성기입니다.',
          diagram:
`[최신 바이오 연구 브리핑]
• 2023 노벨 생리의학상: 변형 뉴클레오사이드(슈도유리딘 등)를 이용해 염증 반응을 줄인 mRNA 백신 개발
• 2024 노벨 생리의학상: 빅터 앰브로스 & 개리 러브컨 — 작은 비번역 RNA인 [마이크로RNA(miRNA)]를 발견하여 다세포 생물의 [전사 후(post-transcriptional) 유전자 발현 조절] 원리 규명`,
          question: 'Q2. 마이크로RNA(miRNA)와 mRNA 백신에 대한 최신 생명과학 지식으로 옳은 번호(보안코드 2번째 숫자)는?',
          hint: '💡 [연구 노트 힌트] 2024 노벨 생리의학상을 수상한 [마이크로RNA(miRNA)]는 그 자체가 단백질로 번역되지 않는 작은 비번역 RNA입니다. 표적 mRNA에 상보적으로 결합하여 리보솜의 번역을 막거나 mRNA를 분해해 유전자 발현을 조절합니다!',
          options: [
            { num: '1', text: '① 마이크로RNA(miRNA)는 리보솜에서 직접 거대한 구조 단백질로 번역되어 근육을 구성한다.' },
            { num: '2', text: '② mRNA 백신은 숙주 세포의 핵 속으로 들어가 사람의 유전체 DNA에 영구적으로 삽입되어야만 작동한다.' },
            { num: '3', text: '③ 모든 세포는 분화 과정에서 불필요한 유전자 DNA를 염색체에서 완전히 삭제하여 세포마다 유전체가 다르다.' },
            { num: '4', text: '④ 마이크로RNA(miRNA)는 표적 mRNA에 상보적으로 결합하여 mRNA의 분해를 촉진하거나 번역을 억제함으로써 유전자 발현을 조절한다. [정답 → 코드 4]' },
            { num: '5', text: '⑤ mRNA 백신에서 지질 나노입자(LNP)는 mRNA를 분해하기 위해 넣는 소화 효소이다.' },
          ],
          answer: '4',
          explanation: '정답입니다! 2024년 노벨 생리의학상 수상 업적인 마이크로RNA(miRNA)는 단백질로 번역되지 않는 작은 비번역 RNA로, 표적 mRNA와 상보적으로 결합해 번역을 억제하거나 mRNA를 분해하여 전사 후 유전자 발현을 정밀하게 조절합니다! [최종 구역 보안코드 2번째 자리: 4]',
        },
        {
          id: 's3c_microscope',
          tag: 'PCR-DIAGNOSTIC #C3',
          name: '우하단 실시간 PCR & 알파폴드 단백질 구조 콘솔',
          x: 915,
          y: 575,
          interactX: 805,
          interactY: 565,
          hitW: 165,
          hitH: 115,
          slotIndex: 2,
          digit: '8',
          subject: '생물의 유전 · 최신 바이오 기술 (PCR 증폭 & AI 단백질 구조 예측)',
          title: '중합효소 연쇄 반응(PCR) 증폭 배수 & AlphaFold 분석기',
          lore: '우측 하단 마지막 단말기입니다! 인공지능 단백질 구조 예측(AlphaFold, 2024 노벨 화학상)으로 설계한 항바이러스제의 효과를 검증하기 위해 PCR로 바이러스 표적 DNA를 증폭하고 있습니다.',
          diagram:
`[PCR (Polymerase Chain Reaction) 회전 단계]
1단계: 변성 (약 95℃) — 이중 가닥 DNA를 단일 가닥으로 분리
2단계: 프라이머 결합 (약 55~60℃) — 표적 서열 양 끝에 프라이머 결합
3단계: 신장 (약 72℃) — 내열성 Taq DNA 중합효소에 의해 새로운 DNA 가닥 합성
★ 문제 계산: 처음 주형 이중가닥 DNA 1분자를 넣고 PCR을 정확히 3회(3 사이클) 반복했을 때 생성되는 총 이중가닥 DNA 분자 수는? (2³ = ?)`,
          question: 'Q3. 이중가닥 DNA 1분자를 주형으로 하여 이상적인 조건에서 PCR(변성→결합→신장)을 3사이클 완료했을 때 얻어지는 총 이중가닥 DNA 분자 수는 몇 개인가? (정답 숫자가 최종 보안코드 3번째 자리!)',
          hint: '💡 [연구 노트 힌트] PCR은 1사이클마다 이중가닥 DNA가 2배씩 복제(2^n)됩니다. 1사이클 후 2개 → 2사이클 후 4개 → 3사이클 후에는 2³ = [ 8개 ]가 됩니다! (선지 ④번의 정답 숫자 8이 보안코드 세 번째 자리입니다)',
          options: [
            { num: '3', text: '① 3개' },
            { num: '4', text: '② 4개 (2²)' },
            { num: '6', text: '③ 6개 (2×3)' },
            { num: '8', text: '④ 8개 (1사이클마다 2배씩 증폭되므로 2³ = 8개 생성) [정답 → 코드 8]' },
            { num: '9', text: '⑤ 9개 (3²)' },
          ],
          answer: '8',
          explanation: '정답입니다! PCR은 1사이클이 진행될 때마다 DNA의 양이 2배씩 기하급수적으로 증폭(2^n)되므로, 3사이클 후에는 2³ = 8개의 이중가닥 DNA가 생성됩니다! [최종 보안코드 3번째 자리: 8 획득! 이제 우측 EXIT-LOCKED 철문으로 달려가 탈출하세요!]',
        },
        {
          id: 's3c_exit',
          tag: 'FINAL ESCAPE DOOR',
          name: 'EXIT-LOCKED 최종 외부 탈출 격리문',
          x: 985,
          y: 415,
          interactX: 865,
          interactY: 515,
          hitW: 145,
          hitH: 165,
          slotIndex: null,
          isExitDoor: true,
        },
      ],
    },
  ],
};

// -------------------------------------------------------------------------
// 게임 상태 관리
// -------------------------------------------------------------------------
const gameState = {
  stage: 1, // 1 = 평화로운 연구소, 2 = 생물실 선물 코드 화면, 3 = 아포칼립스 격리 구역
  sectorIndex: 0, // Stage 3 내 0, 1, 2 (총 3개 구역)
  solvedStations: new Set(),
  enteredCode: ['', '', ''],
  activeStation: null,
  // 플레이어 캐릭터 상태 (오픈소스 LPC 도트 RPG 스타일 연구원: female / male)
  player: {
    gender: 'female',
    x: 560,
    y: 625,
    vx: 0,
    vy: 0,
    speed: 4.1,
    dir: 'up', // 'up', 'down', 'left', 'right'
    walkFrame: 0,
    targetX: null,
    targetY: null,
    pendingStation: null,
  },
  // Stage 3 서바이벌 수치 (좀비 거리 / 산소 / ATP) 및 시각 효과 상태
  survival: {
    zombieDist: 85.0,
    o2: 96,
    atp: 92,
    wrongCount: 0,
    lastTick: performance.now(),
    lastImpactTime: 0,
    windowImpactFlash: 0,
  },
  // GAME OVER 쓰러짐 애니메이션 및 화면 페이드아웃 상태
  gameOverState: {
    isDying: false,
    isDead: false,
    startTime: 0,
    collapseProgress: 0, // 0(서 있음) -> 1(바닥에 완전히 쓰러짐)
    fadeAlpha: 0,        // 0(투명) -> 1(완전 암전 페이드아웃)
    reason: '',
  },
  nearestStation: null,
  toastTimeout: null,
};

const keysPressed = {};

// -------------------------------------------------------------------------
// 현재 스테이지/섹터의 스테이션 목록 및 정답 코드 가져오기
// -------------------------------------------------------------------------
function getCurrentSectorData() {
  if (gameState.stage === 1) {
    return STAGE_DATA.stage1;
  }
  return STAGE_DATA.stage3_sectors[gameState.sectorIndex];
}

function showToast(msg, duration = 2800) {
  ingameToast.textContent = msg;
  ingameToast.classList.remove('hidden');
  if (gameState.toastTimeout) clearTimeout(gameState.toastTimeout);
  gameState.toastTimeout = setTimeout(() => {
    ingameToast.classList.add('hidden');
  }, duration);
}

// -------------------------------------------------------------------------
// 보안코드 슬롯 UI 동기화 및 정답 여부 체크
// -------------------------------------------------------------------------
function syncCodeSlotsUI() {
  const sector = getCurrentSectorData();
  slotInputs.forEach((input, idx) => {
    input.value = gameState.enteredCode[idx] || '';
    if (gameState.enteredCode[idx] && gameState.enteredCode[idx] === sector.code[idx]) {
      input.classList.add('solved');
    } else {
      input.classList.remove('solved');
    }
  });
}

function isCurrentCodeComplete() {
  const sector = getCurrentSectorData();
  return (
    gameState.enteredCode[0] === sector.code[0] &&
    gameState.enteredCode[1] === sector.code[1] &&
    gameState.enteredCode[2] === sector.code[2]
  );
}

slotInputs.forEach((input, idx) => {
  input.addEventListener('input', (e) => {
    const val = e.target.value.replace(/[^0-9A-Za-z]/g, '').slice(-1);
    gameState.enteredCode[idx] = val;
    syncCodeSlotsUI();
    if (val && idx < 2) {
      slotInputs[idx + 1].focus();
    }
    if (isCurrentCodeComplete()) {
      playSound('correct');
      showToast('🔓 보안코드 [' + gameState.enteredCode.join('') + '] 일치! 우측 EXIT-LOCKED 격리문에서 [E] 또는 [SPACE]를 누르세요!');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && idx > 0) {
      slotInputs[idx - 1].focus();
    }
    e.stopPropagation();
  });
});

// -------------------------------------------------------------------------
// 다각형 내부 판정 및 투명 히트박스 충돌 판정
// -------------------------------------------------------------------------
function isPointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi + 0.0001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function collidesWithObstacles(px, py) {
  for (const box of OBSTACLE_HITBOXES) {
    // 발밑 충돌 원(반지름 약 16px)이 중앙 배양기 데스크의 코어 영역과 겹치는지 검사
    const coreX = box.x + 28;
    const coreY = box.y + 32;
    const coreW = box.w - 56;
    const coreH = box.h - 52;
    if (px > coreX && px < coreX + coreW && py > coreY && py < coreY + coreH) {
      return true;
    }
  }
  return false;
}

function canMoveTo(nx, ny) {
  // 방 상단/좌우 벽면 밖으로 나가지 않도록 마진 적용
  if (nx < 195 || nx > 1020 || ny < 395 || ny > 695) return false;
  if (!isPointInPolygon(nx, ny, FLOOR_POLYGON)) {
    // 아이소메트릭 코너 여유 범위 허용
    const nearFloor =
      nx >= 210 && nx <= 965 && ny >= 405 && ny <= 685 &&
      (ny - 400) >= Math.abs(nx - 560) * 0.28;
    if (!nearFloor) return false;
  }
  if (collidesWithObstacles(nx, ny)) return false;
  return true;
}

// -------------------------------------------------------------------------
// 키보드 및 마우스(클릭 이동/상호작용) 이벤트
// -------------------------------------------------------------------------
// STAGE 1 시작 전 캐릭터 선택 이벤트 핸들링
function selectCharacterGender(gender) {
  playSound('interact');
  gameState.player.gender = gender;
  if (selectFemaleBtn && selectMaleBtn) {
    selectFemaleBtn.classList.toggle('selected', gender === 'female');
    selectMaleBtn.classList.toggle('selected', gender === 'male');
  }
}

if (selectFemaleBtn) {
  selectFemaleBtn.addEventListener('click', () => selectCharacterGender('female'));
}
if (selectMaleBtn) {
  selectMaleBtn.addEventListener('click', () => selectCharacterGender('male'));
}
if (startStage1Btn) {
  startStage1Btn.addEventListener('click', () => {
    playSound('correct');
    enterBrowserFullscreen();
    if (charSelectScreen) charSelectScreen.classList.add('hidden');
    showToast('💡 방향키(WASD) 또는 마우스 클릭으로 이동해 노란 느낌표(!) 장비를 조사하세요!');
  });
}

window.addEventListener('keydown', (e) => {
  // 캐릭터 선택 창이 열려 있을 때
  if (charSelectScreen && !charSelectScreen.classList.contains('hidden')) {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      selectCharacterGender('female');
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      selectCharacterGender('male');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startStage1Btn.click();
    }
    return;
  }

  // 모달이 열려 있을 때
  if (!terminalModal.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      closeTerminalModal();
    } else if (e.key.toLowerCase() === 'h' && gameState.activeStation && gameState.activeStation.hint) {
      e.preventDefault();
      toggleStationHint();
    } else if (['1', '2', '3', '4', '5'].includes(e.key) && gameState.activeStation) {
      const st = gameState.activeStation;
      if (st.options && st.options.length >= Number(e.key)) {
        submitStationOption(st, st.options[Number(e.key) - 1]);
      }
    }
    return;
  }

  if (gameState.stage === 2) return;

  keysPressed[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === 'e' || e.key === ' ') {
    e.preventDefault();
    if (gameState.nearestStation) {
      triggerStationInteraction(gameState.nearestStation);
    }
  }
});

window.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

// 캔버스 클릭 시 해당 장비로 걸어가서 조사하거나 바닥 이동
canvas.addEventListener('click', (e) => {
  if (!terminalModal.classList.contains('hidden') || gameState.stage === 2) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;

  const sector = getCurrentSectorData();
  // 클릭한 위치가 특정 실험 장비 히트박스 내부인지 확인
  for (const st of sector.stations) {
    const left = st.x - st.hitW / 2;
    const top = st.y - st.hitH / 2;
    if (cx >= left && cx <= left + st.hitW && cy >= top && cy <= top + st.hitH) {
      gameState.player.targetX = st.interactX;
      gameState.player.targetY = st.interactY;
      gameState.player.pendingStation = st;
      return;
    }
  }

  // 바닥 클릭 이동
  gameState.player.targetX = Math.max(220, Math.min(940, cx));
  gameState.player.targetY = Math.max(415, Math.min(675, cy));
  gameState.player.pendingStation = null;
});

// -------------------------------------------------------------------------
// 장비 상호작용 및 문제 풀이 모달
// -------------------------------------------------------------------------
function triggerStationInteraction(station) {
  playSound('interact');

  // EXIT-LOCKED 격리 철문인 경우
  if (station.isExitDoor) {
    if (isCurrentCodeComplete()) {
      handleExitDoorSuccess();
    } else {
      playSound('wrong');
      showToast('🔒 EXIT-LOCKED : 상단 보안코드 3자리가 아직 맞지 않습니다! 느낌표(!) 장비를 조사해 문제를 풀어주세요.');
    }
    return;
  }

  gameState.activeStation = station;
  modalStationTag.textContent = station.tag;
  modalSubjectBadge.textContent = station.subject;

  if (station.slotIndex !== null && station.slotIndex !== undefined) {
    modalSlotTarget.textContent = `보안코드 ${station.slotIndex + 1}번째 자리 단서`;
    modalSlotTarget.classList.remove('hidden');
  } else {
    modalSlotTarget.classList.add('hidden');
  }

  modalTitle.textContent = station.title;
  modalLore.textContent = station.lore;
  modalDiagram.textContent = station.diagram;
  modalQuestion.textContent = station.question;
  modalFeedback.classList.add('hidden');
  modalOptions.innerHTML = '';

  if (station.hint) {
    modalHintArea.classList.remove('hidden');
    modalHintBox.textContent = station.hint;
    modalHintBox.classList.add('hidden');
    modalHintBtn.textContent = '💡 연구 노트 힌트 보기 [H]';
  } else {
    modalHintArea.classList.add('hidden');
    modalHintBox.classList.add('hidden');
  }

  if (station.options && station.options.length > 0) {
    station.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-item';
      btn.innerHTML = `
        <span class="option-key">${idx + 1}</span>
        <span>${opt.text.replace(/\s*\[정답.*?\]/g, '')}</span>
      `;
      btn.addEventListener('click', () => submitStationOption(station, opt));
      modalOptions.appendChild(btn);
    });
  }

  terminalModal.classList.remove('hidden');
}

function submitStationOption(station, selectedOpt) {
  modalFeedback.classList.remove('hidden', 'correct', 'wrong');

  if (selectedOpt.num === station.answer) {
    playSound('correct');
    modalFeedback.classList.add('correct');
    modalFeedback.textContent = '✅ ' + station.explanation;

    gameState.solvedStations.add(station.id);
    if (station.slotIndex !== null && station.slotIndex !== undefined) {
      gameState.enteredCode[station.slotIndex] = station.digit;
      syncCodeSlotsUI();
    }

    // Stage 3에서 정답을 맞히면 산소와 ATP가 소폭 회복되고 좀비 접근이 저지됨
    if (gameState.stage === 3) {
      gameState.survival.o2 = Math.min(100, gameState.survival.o2 + 8);
      gameState.survival.atp = Math.min(100, gameState.survival.atp + 10);
      gameState.survival.zombieDist = Math.min(95, gameState.survival.zombieDist + 6);
      updateSurvivalHudUI();
    }

    setTimeout(() => {
      if (isCurrentCodeComplete()) {
        showToast('🔓 보안코드 [' + gameState.enteredCode.join('') + '] 해독 완료! 우측 EXIT-LOCKED 격리문으로 이동하세요!');
      }
    }, 400);
  } else {
    playSound('wrong');
    modalFeedback.classList.add('wrong');
    if (gameState.stage === 3) {
      gameState.survival.wrongCount++;
      gameState.survival.zombieDist = Math.max(0, gameState.survival.zombieDist - 12.0);
      gameState.survival.o2 = Math.max(0, gameState.survival.o2 - 12);
      gameState.survival.atp = Math.max(0, gameState.survival.atp - 14);
      triggerLabImpactShake();
      updateSurvivalHudUI();
      modalFeedback.textContent =
        '⚠️ 오답입니다! 경보음에 반응해 좀비가 창문을 강타하며 연구소가 흔들리고, 산소(O₂)와 ATP가 급격히 소모되었습니다!';
      checkStage3GameOverCondition();
    } else {
      modalFeedback.textContent =
        '❌ 오답입니다! 모식도와 생명과학 개념을 다시 확인한 뒤 다른 번호를 선택해 보세요.';
    }
  }
}

function toggleStationHint() {
  if (!gameState.activeStation || !gameState.activeStation.hint) return;
  playSound('interact');
  const isHidden = modalHintBox.classList.contains('hidden');
  if (isHidden) {
    modalHintBox.classList.remove('hidden');
    modalHintBtn.textContent = '💡 연구 노트 힌트 접기 [H]';
  } else {
    modalHintBox.classList.add('hidden');
    modalHintBtn.textContent = '💡 연구 노트 힌트 보기 [H]';
  }
}

modalHintBtn.addEventListener('click', toggleStationHint);

function closeTerminalModal() {
  terminalModal.classList.add('hidden');
  gameState.activeStation = null;
}

modalCloseBtn.addEventListener('click', closeTerminalModal);

// -------------------------------------------------------------------------
// 격리문 탈출 처리 (Stage 1 -> Stage 2 -> Stage 3 구역 1/2/3 -> 최종 탈출)
// -------------------------------------------------------------------------
function handleExitDoorSuccess() {
  playSound('correct');

  if (gameState.stage === 1) {
    // STAGE 1 클리어 -> STAGE 2 생물실 선물 교환 코드 입력 화면으로 이동
    gameState.stage = 2;
    giftCodeInput.value = '';
    stage2Screen.classList.remove('hidden');
    setTimeout(() => giftCodeInput.focus(), 150);
    return;
  }

  if (gameState.stage === 3) {
    if (gameState.sectorIndex < STAGE_DATA.stage3_sectors.length - 1) {
      // 다음 격리 구역(방)으로 이동!
      gameState.sectorIndex++;
      gameState.enteredCode = ['', '', ''];
      syncCodeSlotsUI();
      gameState.player.x = 520;
      gameState.player.y = 630;
      gameState.player.targetX = null;
      gameState.player.targetY = null;

      const nextSector = getCurrentSectorData();
      sectorNameBadge.textContent = nextSector.sectorTitle;

      // 잠깐의 글리치 전환 효과
      glitchOverlay.classList.remove('hidden');
      setTimeout(() => glitchOverlay.classList.add('hidden'), 550);

      showToast(`🚪 격리 구역 돌파! [${nextSector.sectorTitle}]로 진입했습니다. 새로운 느낌표(!) 장비를 조사하세요!`, 4000);
    } else {
      // STAGE 3 모든 격리 구역 최종 탈출 성공!
      triggerFinalVictory();
    }
  }
}

// -------------------------------------------------------------------------
// STAGE 2 : 선물 교환 코드 입력 순간 글리치(지지직) 공포 반전 시퀀스!
// -------------------------------------------------------------------------
function triggerStage2GlitchTransition() {
  const codeVal = giftCodeInput.value.trim();
  if (!codeVal) {
    giftCodeInput.focus();
    return;
  }

  enterBrowserFullscreen();
  playSound('glitch');
  glitchOverlay.classList.remove('hidden');
  glitchSequenceScreen.classList.remove('hidden');

  glitchDynamicText.textContent = `선물 교환 코드 [${codeVal}] 서버 검증 중... 치명적 오류 발생!!`;
  glitchSubText.textContent =
    '지지직—!! 외부 아포칼립스 도시에서 변이 감염체(좀비) 군집이 연구소 외벽을 돌파했습니다! 생물실 전체가 비상 격리 구역(STAGE 3)으로 전환됩니다!';

  setTimeout(() => {
    playSound('glitch');
    glitchDynamicText.textContent = '⚠️ BIOHAZARD LOCKDOWN : STAGE 3 격리 구역 강제 진입';
    glitchSubText.textContent =
      '생존 조건: 좀비가 도달하기 전에 산소(O₂)와 ATP를 유지하며 3개 격리 구역의 고난도 생명과학·유전·최신 바이오 암호를 해독하라!';
  }, 2100);

  setTimeout(() => {
    // STAGE 3 본격 시작
    stage2Screen.classList.add('hidden');
    glitchSequenceScreen.classList.add('hidden');
    glitchOverlay.classList.add('hidden');

    document.body.classList.add('apocalypse-mode');
    gameState.stage = 3;
    gameState.sectorIndex = 0;
    gameState.enteredCode = ['', '', ''];
    syncCodeSlotsUI();

    gameState.player.x = 540;
    gameState.player.y = 630;
    gameState.player.targetX = null;
    gameState.player.targetY = null;

    stage3Hud.classList.remove('hidden');
    stage3SectorIndicator.classList.remove('hidden');
    sectorNameBadge.textContent = getCurrentSectorData().sectorTitle;

    gameState.survival.zombieDist = 85.0;
    gameState.survival.o2 = 95;
    gameState.survival.atp = 92;
    gameState.survival.lastTick = performance.now();
    gameState.survival.lastImpactTime = performance.now();
    updateSurvivalHudUI();

    showToast('🚨 [STAGE 3 돌입] 좀비가 연구소로 다가옵니다! 느낌표(!) 장비를 조사해 보안코드를 해독하세요!', 4500);
  }, 4400);
}

giftSubmitBtn.addEventListener('click', triggerStage2GlitchTransition);
giftCodeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') triggerStage2GlitchTransition();
});

// -------------------------------------------------------------------------
// STAGE 3 서바이벌 타이머 (좀비 접근 & 산소/ATP 변화)
// -------------------------------------------------------------------------
// 좀비가 접근하며 창문을 강타할 때 연구소 화면 흔들림 & 균열 충격 효과
function triggerLabImpactShake() {
  playSound('window_crack');
  gameState.survival.windowImpactFlash = 1.0;
  if (canvasWrapper) {
    canvasWrapper.classList.remove('lab-impact-shake');
    void canvasWrapper.offsetWidth;
    canvasWrapper.classList.add('lab-impact-shake');
    setTimeout(() => {
      canvasWrapper.classList.remove('lab-impact-shake');
    }, 520);
  }
}

function updateSurvivalHudUI() {
  const dist = Math.max(0.0, gameState.survival.zombieDist);
  const dangerPct = Math.min(100, Math.max(12, ((100 - dist) / 100) * 100));
  zombieBar.style.width = `${dangerPct.toFixed(0)}%`;
  zombieDistText.textContent = `${dist.toFixed(1)}m 접근중`;

  const o2Val = Math.max(0, Math.round(gameState.survival.o2));
  const atpVal = Math.max(0, Math.round(gameState.survival.atp));

  o2Bar.style.width = `${o2Val}%`;
  o2ValText.textContent = `${o2Val}%`;

  atpBar.style.width = `${atpVal}%`;
  atpValText.textContent = `${atpVal} mmol`;

  // 잔여 산소(O₂)나 세포 ATP가 65 이하로 내려가면 위험 점멸 표시
  const isO2Critical = o2Val <= 65;
  const isAtpCritical = atpVal <= 65;

  if (o2MetricRow) o2MetricRow.classList.toggle('critical-vital', isO2Critical);
  if (atpMetricRow) atpMetricRow.classList.toggle('critical-vital', isAtpCritical);

  if (bioVitalWarning) {
    if (isO2Critical || isAtpCritical) {
      bioVitalWarning.classList.remove('hidden');
      if (isO2Critical && isAtpCritical) {
        bioVitalWarning.textContent = '🚨 HYPOXIA & ATP DEPLETION : 산소·ATP 고갈 위험!';
      } else if (isO2Critical) {
        bioVitalWarning.textContent = '⚠️ HYPOXIA ALERT : 잔여 산소(O₂) 부족 위험!';
      } else {
        bioVitalWarning.textContent = '⚠️ ATP DEPLETION : 세포 ATP 에너지 부족 위험!';
      }
    } else {
      bioVitalWarning.classList.add('hidden');
    }
  }
}

// 좀비 거리 0.0m 도달 / 잔여 산소 0% / 세포 ATP 0 고갈 시 캐릭터 쓰러짐 & 페이드아웃 GAME OVER 발동
function checkStage3GameOverCondition() {
  if (gameState.stage !== 3 || gameState.gameOverState.isDying || gameState.gameOverState.isDead) {
    return false;
  }

  let reason = '';
  if (gameState.survival.zombieDist <= 0.0) {
    gameState.survival.zombieDist = 0.0;
    reason = '감염체(좀비)와의 거리가 0.0m가 되어 연구실 격리 방어선이 돌파되었습니다!';
  } else if (gameState.survival.o2 <= 0) {
    gameState.survival.o2 = 0;
    reason = '연구실 내 잔여 산소(O₂)가 0%로 완전히 고갈되어 질식으로 의식을 잃고 쓰러졌습니다!';
  } else if (gameState.survival.atp <= 0) {
    gameState.survival.atp = 0;
    reason = '세포 내 에너지 화폐인 ATP 잔량이 0 mmol로 완전히 고갈되어 생명 활동이 정지했습니다!';
  } else {
    return false;
  }

  updateSurvivalHudUI();
  closeTerminalModal();
  playSound('gameover');
  triggerLabImpactShake();

  gameState.gameOverState.isDying = true;
  gameState.gameOverState.isDead = false;
  gameState.gameOverState.startTime = performance.now();
  gameState.gameOverState.collapseProgress = 0;
  gameState.gameOverState.fadeAlpha = 0;
  gameState.gameOverState.reason = reason;
  gameState.player.targetX = null;
  gameState.player.targetY = null;

  showToast('🚨 VITAL SIGNAL LOST — 연구원이 쓰러집니다...', 2600);
  return true;
}

function tickStage3Survival(now) {
  if (gameState.stage !== 3) return;
  if (!finalVictoryScreen.classList.contains('hidden')) return;

  // 캐릭터가 쓰러지며 화면이 어두워지는(페이드아웃) 연출 진행
  if (gameState.gameOverState.isDying) {
    const elapsedDying = (now - gameState.gameOverState.startTime) / 1000;
    // 0.0초 ~ 1.1초 동안 캐릭터가 바닥으로 90도 쓰러짐
    gameState.gameOverState.collapseProgress = Math.min(1, elapsedDying / 1.05);
    // 0.3초 ~ 2.4초 동안 화면이 점점 검게 페이드아웃
    gameState.gameOverState.fadeAlpha = Math.max(0, Math.min(1, (elapsedDying - 0.25) / 2.0));

    if (elapsedDying >= 2.35 && !gameState.gameOverState.isDead) {
      gameState.gameOverState.isDead = true;
      if (gameOverReasonText) {
        gameOverReasonText.textContent = gameState.gameOverState.reason;
      }
      if (gameOverScreen) {
        gameOverScreen.classList.remove('hidden');
      }
    }
    return;
  }

  // 동아리 학생들이 생물실 밖에서 정확히 40초마다 1번씩(30초~50초 사이의 정중앙 40.0초 주기) 실제 "쾅!" 소리를 맞출 수 있도록 고정 40초 주기 설정!
  if (now - gameState.survival.lastImpactTime >= 40000) {
    gameState.survival.lastImpactTime = now;
    triggerLabImpactShake();
    showToast('💥 쾅! 콰직! — 외부 좀비가 강화유리창을 강타하여 창문에 금이 가고 연구소가 흔들립니다!', 2600);
  }

  const elapsedSec = (now - gameState.survival.lastTick) / 1000;
  if (elapsedSec >= 1.2) {
    gameState.survival.lastTick = now;
    gameState.survival.zombieDist = Math.max(0.0, gameState.survival.zombieDist - 0.65);
    gameState.survival.o2 = Math.max(0, gameState.survival.o2 - 0.55);
    gameState.survival.atp = Math.max(0, gameState.survival.atp - 0.6);

    // 산소나 ATP가 낮거나 좀비가 가까울 때 심장박동 사운드 재생
    if (
      gameState.survival.zombieDist < 42 ||
      gameState.survival.o2 <= 60 ||
      gameState.survival.atp <= 60
    ) {
      playSound('heartbeat');
    }

    updateSurvivalHudUI();
    checkStage3GameOverCondition();
  }
}

// -------------------------------------------------------------------------
// 최종 승리 화면 & 초기화
// -------------------------------------------------------------------------
function triggerFinalVictory() {
  victoryStatsBox.innerHTML = `
    <p style="margin-bottom:8px; color:#a7f3d0;">
      • 최종 잔여 산소(O₂): <strong>${Math.round(gameState.survival.o2)}%</strong> &nbsp;|&nbsp;
      잔여 세포 ATP: <strong>${Math.round(gameState.survival.atp)} mmol</strong> &nbsp;|&nbsp;
      감염체 최종 방어 거리: <strong>${gameState.survival.zombieDist.toFixed(1)}m</strong>
    </p>
  `;
  finalVictoryScreen.classList.remove('hidden');
}

function resetAllToStage1() {
  document.body.classList.remove('apocalypse-mode');
  finalVictoryScreen.classList.add('hidden');
  if (gameOverScreen) gameOverScreen.classList.add('hidden');
  stage2Screen.classList.add('hidden');
  stage3Hud.classList.add('hidden');
  stage3SectorIndicator.classList.add('hidden');

  gameState.stage = 1;
  gameState.sectorIndex = 0;
  gameState.solvedStations.clear();
  gameState.enteredCode = ['', '', ''];
  gameState.gameOverState.isDying = false;
  gameState.gameOverState.isDead = false;
  gameState.gameOverState.collapseProgress = 0;
  gameState.gameOverState.fadeAlpha = 0;
  syncCodeSlotsUI();

  gameState.player.x = 560;
  gameState.player.y = 625;
  gameState.player.targetX = null;
  gameState.player.targetY = null;

  if (charSelectScreen) {
    charSelectScreen.classList.remove('hidden');
  }
  showToast('✨ 다음 참여 학생을 위해 캐릭터 선택 및 STAGE 1 화면으로 초기화되었습니다.');
}

restartGameBtn.addEventListener('click', resetAllToStage1);

if (gameOverRestartBtn) {
  gameOverRestartBtn.addEventListener('click', resetAllToStage1);
}

if (retryStage3Btn) {
  retryStage3Btn.addEventListener('click', () => {
    playSound('correct');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    gameState.gameOverState.isDying = false;
    gameState.gameOverState.isDead = false;
    gameState.gameOverState.collapseProgress = 0;
    gameState.gameOverState.fadeAlpha = 0;

    gameState.survival.zombieDist = 85.0;
    gameState.survival.o2 = 95;
    gameState.survival.atp = 92;
    gameState.survival.lastTick = performance.now();
    gameState.survival.lastImpactTime = performance.now();
    updateSurvivalHudUI();

    gameState.player.x = 540;
    gameState.player.y = 630;
    gameState.player.targetX = null;
    gameState.player.targetY = null;
    showToast('⚡ 응급 소생 완료! 현재 격리 구역에서 다시 탈출을 시도합니다!');
  });
}

// -------------------------------------------------------------------------
// 2.5D 아이소메트릭 렌더링 루프
// -------------------------------------------------------------------------
function updatePlayerMovement() {
  if (
    !terminalModal.classList.contains('hidden') ||
    gameState.stage === 2 ||
    gameState.gameOverState.isDying ||
    gameState.gameOverState.isDead
  ) {
    return;
  }

  let dx = 0;
  let dy = 0;

  if (keysPressed['arrowleft'] || keysPressed['a']) dx -= 1;
  if (keysPressed['arrowright'] || keysPressed['d']) dx += 1;
  if (keysPressed['arrowup'] || keysPressed['w']) dy -= 1;
  if (keysPressed['arrowdown'] || keysPressed['s']) dy += 1;

  if (dx !== 0 || dy !== 0) {
    // 키보드 입력 시 마우스 자동 이동 취소
    gameState.player.targetX = null;
    gameState.player.targetY = null;
    gameState.player.pendingStation = null;

    const len = Math.hypot(dx, dy);
    dx = (dx / len) * gameState.player.speed;
    dy = (dy / len) * gameState.player.speed * 0.82; // 아이소메트릭 Y축 비율 보정
  } else if (gameState.player.targetX !== null && gameState.player.targetY !== null) {
    const tx = gameState.player.targetX - gameState.player.x;
    const ty = gameState.player.targetY - gameState.player.y;
    const dist = Math.hypot(tx, ty);
    if (dist < 8) {
      gameState.player.targetX = null;
      gameState.player.targetY = null;
      if (gameState.player.pendingStation) {
        const st = gameState.player.pendingStation;
        gameState.player.pendingStation = null;
        triggerStationInteraction(st);
      }
    } else {
      dx = (tx / dist) * gameState.player.speed;
      dy = (ty / dist) * gameState.player.speed;
    }
  }

  if (dx !== 0 || dy !== 0) {
    if (Math.abs(dx) > Math.abs(dy)) {
      gameState.player.dir = dx > 0 ? 'right' : 'left';
    } else {
      gameState.player.dir = dy > 0 ? 'down' : 'up';
    }
    gameState.player.walkFrame += 0.22;

    const nextX = gameState.player.x + dx;
    const nextY = gameState.player.y + dy;

    if (canMoveTo(nextX, nextY)) {
      gameState.player.x = nextX;
      gameState.player.y = nextY;
    } else if (canMoveTo(nextX, gameState.player.y)) {
      gameState.player.x = nextX;
    } else if (canMoveTo(gameState.player.x, nextY)) {
      gameState.player.y = nextY;
    }
  }

  // 가장 가까운 조사 가능 장비 탐색
  const sector = getCurrentSectorData();
  let closest = null;
  let minDist = 118; // 근접 반경

  for (const st of sector.stations) {
    const dist = Math.hypot(gameState.player.x - st.interactX, gameState.player.y - st.interactY);
    if (dist < minDist) {
      minDist = dist;
      closest = st;
    }
  }
  gameState.nearestStation = closest;
}

// 반짝이는 노란 느낌표 (!) 아이콘 렌더링
function drawExclamationIcon(x, y, isSolved, isExitDoor, time) {
  const floatOffset = Math.sin(time * 0.0055 + x * 0.01) * 5;
  const drawY = y + floatOffset;

  ctx.save();
  // 외곽 발광 후광
  const glowColor = isExitDoor
    ? (isCurrentCodeComplete() ? 'rgba(74, 222, 128, 0.7)' : 'rgba(251, 113, 133, 0.65)')
    : (isSolved ? 'rgba(74, 222, 128, 0.6)' : 'rgba(250, 204, 21, 0.85)');

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 16;

  // RPG풍 다이아몬드/원형 배지 배경
  ctx.fillStyle = isSolved ? '#064e3b' : '#1e1b4b';
  ctx.beginPath();
  ctx.arc(x, drawY, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = isSolved ? '#4ade80' : '#facc15';
  ctx.stroke();

  // 노란 느낌표 (!) 텍스트
  ctx.font = '900 21px "JetBrains Mono", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isSolved ? '#4ade80' : '#fde047';
  ctx.fillText(isSolved ? '✓' : '!', x, drawY + 1);
  ctx.restore();
}

// 캐릭터가 가까이가면 장비 바로 위에 검은색 [E] 키캡 배지 혹은 [SPACE]만 깔끔하게 표시
function drawMinimalKeycapBadge(x, y, time) {
  const floatY = y - 34 + Math.sin(time * 0.007) * 3;
  ctx.save();

  const label = '[E] / [SPACE]';
  ctx.font = '800 13px "JetBrains Mono", monospace';
  const textWidth = ctx.measureText(label).width;
  const padX = 12;
  const boxW = textWidth + padX * 2;
  const boxH = 28;
  const boxX = x - boxW / 2;
  const boxY = floatY - boxH / 2;

  // 검은색 키캡 스타일 박스
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(10, 12, 18, 0.94)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 7);
  ctx.fill();

  // 키캡 하단 입체 베벨 테두리
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#fde047';
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fef08a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, floatY + 0.5);

  ctx.restore();
}

// -------------------------------------------------------------------------
// 오픈소스 Liberated Pixel Cup (LPC, CC-BY-SA 3.0 / GPL 3.0) 규격 기반
// 고해상도 도트 RPG 연구원(여학생 연구원 / 남학생 연구원) 픽셀 스프라이트 렌더러
// -------------------------------------------------------------------------
function drawLPCPixelResearcher(targetCtx, cx, footY, gender, dir, walkFrame, isMoving, isApocalypse, scale = 3.2) {
  const step = isMoving ? Math.sin(walkFrame * 2.2) : 0;
  const bob = isMoving ? Math.abs(Math.sin(walkFrame * 2.2)) * -1.5 : 0;
  const legLeftOffset = Math.round(step * 2.2);
  const legRightOffset = -legLeftOffset;
  const armSwing = Math.round(step * 1.8);

  targetCtx.save();
  targetCtx.translate(cx, footY);

  // 바닥 도트 타원 그림자
  targetCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  targetCtx.beginPath();
  targetCtx.ellipse(0, 2, 7.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
  targetCtx.fill();

  // Stage 3 바이오랜턴 바닥 후광
  if (isApocalypse && targetCtx === ctx) {
    const grad = targetCtx.createRadialGradient(0, -14 * scale, 6, 0, -14 * scale, 42 * scale);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.24)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    targetCtx.fillStyle = grad;
    targetCtx.beginPath();
    targetCtx.arc(0, -14 * scale, 42 * scale, 0, Math.PI * 2);
    targetCtx.fill();
  }

  // 도트 픽셀 헬퍼 (1유닛 = scale px, 중심 x=0, 바닥 y=0 기준)
  function pxRect(ux, uy, uw, uh, color) {
    targetCtx.fillStyle = color;
    targetCtx.fillRect(
      Math.round(ux * scale),
      Math.round((uy + bob) * scale),
      Math.ceil(uw * scale),
      Math.ceil(uh * scale)
    );
  }

  const eyeShift = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const isBack = dir === 'up';

  // 1) 여학생 연구원 뒤쪽 긴 머리 / 포니테일 레이어
  if (gender === 'female') {
    pxRect(-6, -24, 12, 8, '#2a1b2e'); // 뒷머리 볼륨
    pxRect(-7, -20, 2, 7, '#2a1b2e');  // 좌측 옆머리 묶음
    pxRect(5, -20, 2, 7, '#2a1b2e');   // 우측 옆머리 묶음
  }

  // 2) 다리 & 연구실 구두 (슬림한 장신 도트 비율)
  // 왼다리
  pxRect(-4, -9 + legLeftOffset * 0.4, 3, 7, '#1e293b');
  pxRect(-4, -8 + legLeftOffset * 0.4, 1, 6, '#334155'); // 바지 하이라이트
  pxRect(-4.5, -2 + legLeftOffset * 0.4, 3.5, 2, '#0f172a'); // 신발
  // 오른다리
  pxRect(1, -9 + legRightOffset * 0.4, 3, 7, '#1e293b');
  pxRect(1, -8 + legRightOffset * 0.4, 1, 6, '#334155');
  pxRect(1, -2 + legRightOffset * 0.4, 3.5, 2, '#0f172a');

  // 3) 하얀 연구원 롱 가운(Lab Coat) & 이너 셔츠/타이
  // 가운 자락 외곽선 (다크 슬레이트 도트 아웃라인)
  pxRect(-6, -19, 12, 13, '#334155');
  // 가운 메인 화이트 바디 & 명암
  pxRect(-5, -18, 10, 11, '#f8fafc');
  pxRect(-5, -18, 2, 11, '#e2e8f0'); // 좌측 음영
  pxRect(3, -18, 2, 11, '#e2e8f0');  // 우측 음영

  if (!isBack) {
    // 이너 셔츠 & 넥타이/리본
    pxRect(-2, -18, 4, 7, '#1e293b');
    pxRect(-1, -18, 2, 5, isApocalypse ? '#f43f5e' : (gender === 'female' ? '#ec4899' : '#0284c7'));
    // 가운 오픈 라인 & 하단 슬릿
    pxRect(-1, -11, 2, 4, '#1e293b');
    // 가슴 사원증(ID 카드) 도트 디테일
    pxRect(2, -15, 2.5, 3, '#38bdf8');
    pxRect(2, -16, 2.5, 1, '#fde047');
  } else {
    // 뒷모습 가운 허리 벨트 라인
    pxRect(-4, -13, 8, 1.5, '#cbd5e1');
  }

  // 4) 양팔 (가운 소매 + 손 + 손목 바이오워치)
  // 왼팔
  pxRect(-7.5, -18 + armSwing * 0.3, 2.5, 8, '#334155');
  pxRect(-7, -17.5 + armSwing * 0.3, 2, 7, '#f1f5f9');
  pxRect(-7, -10.5 + armSwing * 0.3, 2, 2, '#fcd34d'); // 왼손
  // 오른팔
  pxRect(5, -18 - armSwing * 0.3, 2.5, 8, '#334155');
  pxRect(5, -17.5 - armSwing * 0.3, 2, 7, '#f1f5f9');
  pxRect(5, -11.5 - armSwing * 0.3, 2, 1.2, '#06b6d4'); // 청록 발광 바이오워치
  pxRect(5, -10.5 - armSwing * 0.3, 2, 2, '#fcd34d'); // 오른손

  // 5) 목 & 얼굴 (LPC 표준 정통 RPG 도트 헤드)
  pxRect(-1.5, -20, 3, 2, '#eab308'); // 목 그림자
  pxRect(-1.5, -20.5, 3, 1.5, '#fde68a');

  // 머리 외곽 아웃라인
  pxRect(-5.5, -29.5, 11, 9.5, '#1e1b4b');
  // 얼굴 피부톤
  pxRect(-4.5, -28.5, 9, 8, '#fef08a');
  pxRect(-4.5, -23.5, 9, 3, '#fde68a'); // 볼/턱 소프트 셰이딩

  if (!isBack) {
    // 눈 (선명한 JRPG 도트 눈동자)
    pxRect(-3 + eyeShift, -25.5, 1.8, 2.2, '#0f172a');
    pxRect(1.2 + eyeShift, -25.5, 1.8, 2.2, '#0f172a');
    pxRect(-2.6 + eyeShift, -25.3, 0.8, 0.9, '#ffffff'); // 눈 하이라이트
    pxRect(1.6 + eyeShift, -25.3, 0.8, 0.9, '#ffffff');

    // 여학생 속눈썹/블러셔 vs 남학생 짙은 눈썹
    if (gender === 'female') {
      pxRect(-3.8 + eyeShift, -23.5, 1.4, 0.8, '#fda4af');
      pxRect(2.4 + eyeShift, -23.5, 1.4, 0.8, '#fda4af');
    } else {
      pxRect(-3.2 + eyeShift, -26.5, 2.2, 0.8, '#1e1b4b');
      pxRect(1.0 + eyeShift, -26.5, 2.2, 0.8, '#1e1b4b');
    }
  }

  // 6) 헤어스타일 & 이마 연구용 보안 고글
  if (gender === 'female') {
    // 여학생 연구원: 다크 브라운/블랙 단정한 뱅헤어 + 사이드 브레이드
    pxRect(-5.5, -30.5, 11, 3.8, '#2a1b2e');
    pxRect(-4.5, -29.8, 9, 1.5, '#4a304d'); // 머릿결 엔젤링 하이라이트
    if (!isBack) {
      pxRect(-5.5, -27.5, 2, 5.5, '#2a1b2e'); // 옆머리
      pxRect(3.5, -27.5, 2, 5.5, '#2a1b2e');
      pxRect(-2.5, -27.5, 5, 1.5, '#2a1b2e'); // 앞머리 시스루 뱅
    } else {
      pxRect(-5.5, -28.5, 11, 8, '#2a1b2e');
    }
  } else {
    // 남학생 연구원: 네이비블랙 댄디 숏컷 도트 헤어
    pxRect(-5.8, -30.8, 11.6, 4.2, '#0f172a');
    pxRect(-4.5, -30.0, 9, 1.5, '#334155'); // 머릿결 하이라이트
    if (!isBack) {
      pxRect(-5.5, -27.2, 1.8, 3.2, '#0f172a');
      pxRect(3.7, -27.2, 1.8, 3.2, '#0f172a');
      pxRect(-3, -27.5, 2.5, 1.6, '#0f172a');
      pxRect(0.8, -27.5, 2.2, 1.4, '#0f172a');
    } else {
      pxRect(-5.5, -28.5, 11, 6.5, '#0f172a');
    }
  }

  // 이마 위에 올려 쓴 연구원 사이버 고글 (포인트 아이템)
  pxRect(-5, -29.2, 10, 2.2, '#0f172a');
  pxRect(-4.2, -28.8, 3.6, 1.4, isApocalypse ? '#34d399' : '#38bdf8');
  pxRect(0.6, -28.8, 3.6, 1.4, isApocalypse ? '#34d399' : '#38bdf8');

  targetCtx.restore();
}

function drawPlayerSprite(p, time) {
  const isMoving =
    !gameState.gameOverState.isDying &&
    (p.targetX !== null ||
      keysPressed['w'] ||
      keysPressed['a'] ||
      keysPressed['s'] ||
      keysPressed['d'] ||
      keysPressed['arrowup'] ||
      keysPressed['arrowdown'] ||
      keysPressed['arrowleft'] ||
      keysPressed['arrowright']);

  ctx.save();
  // GAME OVER 시 캐릭터가 발밑을 축으로 스르륵 옆으로 쓰러지는 모션
  if (gameState.gameOverState.isDying || gameState.gameOverState.isDead) {
    const prog = gameState.gameOverState.collapseProgress;
    // easeOutQuad 회전으로 바닥에 90도 쓰러짐
    const angle = (1 - Math.pow(1 - prog, 2)) * (Math.PI / 2);
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.translate(-p.x, -p.y);
  }

  drawLPCPixelResearcher(
    ctx,
    p.x,
    p.y,
    p.gender || 'female',
    p.dir,
    p.walkFrame,
    isMoving,
    gameState.stage === 3,
    3.1
  );
  ctx.restore();
}

// 캐릭터 선택 창 미리보기 캔버스 렌더링
function renderCharacterSelectPreviews(now) {
  if (!charSelectScreen || charSelectScreen.classList.contains('hidden')) return;
  if (previewFemaleCanvas) {
    const fCtx = previewFemaleCanvas.getContext('2d');
    fCtx.clearRect(0, 0, previewFemaleCanvas.width, previewFemaleCanvas.height);
    drawLPCPixelResearcher(fCtx, 48, 114, 'female', 'down', now * 0.003, true, false, 3.2);
  }
  if (previewMaleCanvas) {
    const mCtx = previewMaleCanvas.getContext('2d');
    mCtx.clearRect(0, 0, previewMaleCanvas.width, previewMaleCanvas.height);
    drawLPCPixelResearcher(mCtx, 48, 114, 'male', 'down', now * 0.003, true, false, 3.2);
  }
}

// -------------------------------------------------------------------------
// STAGE 3 시각적 공포 효과:
// 1) 좀비가 접근할수록 중앙 대형 관찰창 유리가 단계별로 깨지는 균열(Cracks) 효과
// 2) 잔여 산소(O₂)와 세포 ATP가 줄어들수록 화면 가장자리 적색 맥박·저산소 시야 협착 위험 효과
// -------------------------------------------------------------------------
function drawWindowCrackNetwork(cx, cy, scale, alpha, isImpactFlash) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.strokeStyle = isImpactFlash
    ? `rgba(254, 202, 202, ${Math.min(1, alpha + 0.3).toFixed(2)})`
    : `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
  ctx.shadowColor = isImpactFlash ? '#ef4444' : 'rgba(56, 189, 248, 0.7)';
  ctx.shadowBlur = isImpactFlash ? 16 : 6;
  ctx.lineWidth = isImpactFlash ? 2.4 : 1.6;

  // 방사형 주 균열선
  const branches = [
    [0, 0, -28, -22, -64, -48],
    [0, 0, 32, -18, 72, -42],
    [0, 0, 26, 24, 58, 56],
    [0, 0, -30, 20, -68, 46],
    [0, 0, 6, -34, 14, -70],
    [0, 0, -10, 32, -22, 68],
    [0, 0, 40, 4, 82, 12],
  ];

  ctx.beginPath();
  for (const [x0, y0, x1, y1, x2, y2] of branches) {
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();

  // 거미줄 동심원 연결 균열선
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-28, -22);
  ctx.lineTo(6, -34);
  ctx.lineTo(32, -18);
  ctx.lineTo(40, 4);
  ctx.lineTo(26, 24);
  ctx.lineTo(-10, 32);
  ctx.lineTo(-30, 20);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function drawStage3VisualDangerEffects(now) {
  if (gameState.stage !== 3) return;

  const dist = gameState.survival.zombieDist;
  // 좀비 접근 비율 (85m -> 0%, 10m -> 100%)
  const zombieApproachRatio = Math.max(0, Math.min(1, (85 - dist) / 75));
  const isFlash = gameState.survival.windowImpactFlash > 0.05;

  // 1) 좀비가 접근할수록 중앙 관찰창(x: 430~645, y: 145~345) 유리가 점점 더 많이 깨지는 효과
  if (zombieApproachRatio > 0.08 || isFlash) {
    const baseAlpha = Math.min(0.92, 0.28 + zombieApproachRatio * 0.65);

    // 1단계 균열 (78m 이하부터 좌측 창문 균열 생성)
    drawWindowCrackNetwork(465, 235, 0.75 + zombieApproachRatio * 0.35, baseAlpha, isFlash);

    // 2단계 균열 (58m 이하부터 우측 상단 대형 균열 추가)
    if (dist < 58 || isFlash) {
      drawWindowCrackNetwork(595, 210, 0.85 + zombieApproachRatio * 0.4, baseAlpha, isFlash);
    }

    // 3단계 균열 (40m 이하부터 중앙 하단 관통 균열 추가)
    if (dist < 40) {
      drawWindowCrackNetwork(530, 285, 1.05 + zombieApproachRatio * 0.35, baseAlpha, isFlash);
    }

    // 4단계 균열 (24m 이하 위기 상황: 유리창 전체에 붉은 경보 균열 확산)
    if (dist < 24) {
      drawWindowCrackNetwork(435, 295, 0.9, 0.9, true);
      drawWindowCrackNetwork(625, 275, 0.95, 0.9, true);
    }
  }

  if (gameState.survival.windowImpactFlash > 0.01) {
    gameState.survival.windowImpactFlash *= 0.9;
  }

  // 2) 잔여 산소(O₂)와 세포 ATP가 줄어들수록 위험하다는 시각 효과 (저산소 시야 협착 + 붉은 심장박동 비네팅 + 경고 배너)
  const o2Deficit = Math.max(0, (85 - gameState.survival.o2) / 70);   // 0 ~ 1
  const atpDeficit = Math.max(0, (85 - gameState.survival.atp) / 70); // 0 ~ 1
  const vitalDanger = Math.max(o2Deficit, atpDeficit);

  if (vitalDanger > 0.05) {
    ctx.save();
    const pulseSpeed = 0.004 + vitalDanger * 0.008;
    const pulseWave = (Math.sin(now * pulseSpeed) + 1) * 0.5; // 0 ~ 1

    // 화면 가장자리가 붉고 어둡게 조여오는 저산소·ATP 고갈 터널 시야(Tunnel Vision) 효과
    const innerRadius = Math.max(160, 440 - vitalDanger * 220 - pulseWave * 35);
    const outerRadius = 720;
    const vignetteGrad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      innerRadius,
      canvas.width / 2,
      canvas.height / 2,
      outerRadius
    );

    const redAlpha = Math.min(0.82, vitalDanger * 0.55 + pulseWave * vitalDanger * 0.28);
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.55, `rgba(127, 29, 29, ${(redAlpha * 0.45).toFixed(3)})`);
    vignetteGrad.addColorStop(1, `rgba(20, 2, 5, ${redAlpha.toFixed(3)})`);

    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ATP/산소가 65 이하일 때 화면 테두리 적색 위험 펄스 라인 및 상단 경고 텍스트 렌더링
    if (gameState.survival.o2 <= 65 || gameState.survival.atp <= 65) {
      ctx.strokeStyle = `rgba(248, 113, 113, ${(0.3 + pulseWave * 0.55).toFixed(2)})`;
      ctx.lineWidth = 6 + vitalDanger * 6;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // 화면 하단 호흡/대사 위험 경고 홀로그램 바
      ctx.font = '800 14px "JetBrains Mono", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(254, 202, 202, ${(0.55 + pulseWave * 0.45).toFixed(2)})`;
      const warnText =
        gameState.survival.o2 <= 50 || gameState.survival.atp <= 50
          ? '🚨 [위험: 저산소증 & ATP 고갈 심각] 시야가 좁아지고 있습니다! 정답을 맞혀 산소와 ATP를 회복하세요!'
          : '⚠️ [생체 경고] 잔여 산소(O₂) 및 세포 ATP 수치가 감소하고 있습니다!';
      ctx.fillText(warnText, canvas.width / 2, canvas.height - 64);
    }

    ctx.restore();
  }
}

function renderGame(now) {
  renderCharacterSelectPreviews(now);
  updatePlayerMovement();
  tickStage3Survival(now);

  // 좀비가 매우 가까워지면(35m 이내) 연구소 전체에 미세한 지속 진동(Tremor) 발생
  let shakeX = 0;
  let shakeY = 0;
  if (gameState.stage === 3) {
    const dist = gameState.survival.zombieDist;
    const impactBoost = gameState.survival.windowImpactFlash * 9;
    const proximityTremor = dist < 40 ? ((40 - dist) / 40) * 2.6 : 0;
    const totalShake = impactBoost + proximityTremor;
    if (totalShake > 0.2) {
      shakeX = (Math.random() - 0.5) * totalShake * 2;
      shakeY = (Math.random() - 0.5) * totalShake * 2;
    }
  }

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (shakeX !== 0 || shakeY !== 0) {
    ctx.translate(shakeX, shakeY);
  }

  // 1) 아이소메트릭 배경 이미지 렌더링
  const bgImg = gameState.stage === 3 ? bgStage3 : bgStage1;
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 2) STAGE 3 좀비 접근에 따른 창문 깨짐(균열) & 산소/ATP 고갈 위험 시각 효과 렌더링
  drawStage3VisualDangerEffects(now);

  const sector = getCurrentSectorData();

  // 3) 플레이어 캐릭터 렌더링
  drawPlayerSprite(gameState.player, now);

  // 4) 조사 가능한 실험 장비마다 반짝이는 노란 느낌표 (!) 아이콘 렌더링
  for (const st of sector.stations) {
    const isSolved = gameState.solvedStations.has(st.id);
    drawExclamationIcon(st.x, st.y - 26, isSolved, !!st.isExitDoor, now);
  }

  // 5) 캐릭터가 가까이가면 장비 바로 위에 검은색 [E] 키캡 배지 혹은 [SPACE]만 깔끔하게 표시
  if (gameState.nearestStation && !gameState.gameOverState.isDying) {
    drawMinimalKeycapBadge(
      gameState.nearestStation.x,
      gameState.nearestStation.y - 26,
      now
    );
  }

  // 6) GAME OVER 시 캐릭터가 쓰러지면서 화면이 점점 어두워지는(페이드아웃) 암전 오버레이
  if (gameState.gameOverState.isDying || gameState.gameOverState.isDead) {
    const fade = gameState.gameOverState.fadeAlpha;
    if (fade > 0.01) {
      ctx.fillStyle = `rgba(3, 1, 2, ${fade.toFixed(3)})`;
      ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100);
    }
  }

  ctx.restore();
  requestAnimationFrame(renderGame);
}

// 초기 실행
syncCodeSlotsUI();
showToast('💡 방향키(WASD) 또는 마우스 클릭으로 이동해 노란 느낌표(!) 장비를 조사하세요!');
requestAnimationFrame(renderGame);
