// Utility: panel switching
const panels = document.querySelectorAll('.panel');
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

/* =======================
   Tic Tac Toe (Minimax)
======================= */
const t3grid = document.getElementById('t3grid');
const t3status = document.getElementById('t3status');
const t3reset = document.getElementById('t3reset');

let board = Array(9).fill(null);
let human = 'X', ai = 'O', t3over = false;

function renderT3() {
  t3grid.innerHTML = '';
  board.forEach((v, i) => {
    const b = document.createElement('button');
    b.textContent = v || '';
    b.addEventListener('click', () => humanMove(i));
    t3grid.appendChild(b);
  });
}
renderT3();

function winner(b) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,c,d] of wins) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(Boolean)) return 'draw';
  return null;
}

function humanMove(i) {
  if (t3over || board[i]) return;
  board[i] = human;
  updateAfterMove();
  if (!t3over) {
    setTimeout(aiMove, 150);
  }
}

function updateAfterMove() {
  renderT3();
  const w = winner(board);
  if (w) {
    t3over = true;
    t3status.textContent = w === 'draw' ? 'Draw!' : `${w} wins!`;
  } else {
    t3status.textContent = 'AI thinking…';
  }
}

function aiMove() {
  const best = minimax(board, ai, -Infinity, Infinity);
  board[best.index] = ai;
  renderT3();
  const w = winner(board);
  if (w) {
    t3over = true;
    t3status.textContent = w === 'draw' ? 'Draw!' : `${w} wins!`;
  } else {
    t3status.textContent = 'Your turn (X)';
  }
}

function minimax(b, player, alpha, beta) {
  const w = winner(b);
  if (w) {
    if (w === ai) return { score: 10 };
    if (w === human) return { score: -10 };
    return { score: 0 };
  }
  const moves = [];
  b.forEach((v,i) => {
    if (!v) {
      const newB = b.slice();
      newB[i] = player;
      const result = minimax(newB, player === ai ? human : ai, alpha, beta);
      moves.push({ index: i, score: result.score });
      if (player === ai) {
        alpha = Math.max(alpha, result.score);
      } else {
        beta = Math.min(beta, result.score);
      }
    }
  });
  // Alpha-beta pruning break
  if (alpha >= beta) {
    // pick something reasonable
  }
  let bestMove;
  if (player === ai) {
    let bestScore = -Infinity;
    for (const m of moves) if (m.score > bestScore) { bestScore = m.score; bestMove = m; }
  } else {
    let bestScore = Infinity;
    for (const m of moves) if (m.score < bestScore) { bestScore = m.score; bestMove = m; }
  }
  return bestMove;
}

t3reset.addEventListener('click', () => {
  board = Array(9).fill(null);
  t3over = false;
  t3status.textContent = 'Your turn (X)';
  renderT3();
});

/* =======================
   Lights Out 5x5
======================= */
const loGridEl = document.getElementById('loGrid');
const loStatus = document.getElementById('loStatus');
const loShuffle = document.getElementById('loShuffle');
const N = 5;
let lo = [];
function initLights(seedRandom = true) {
  lo = Array.from({length: N}, () => Array(N).fill(false));
  if (seedRandom) {
    for (let i=0;i<10;i++) toggleRandom();
  }
  renderLights();
  updateLoStatus();
}
function toggle(i,j) {
  const flip = (x,y)=>{ if (x>=0&&x<N&&y>=0&&y<N) lo[x][y] = !lo[x][y]; };
  flip(i,j); flip(i-1,j); flip(i+1,j); flip(i,j-1); flip(i,j+1);
}
function toggleRandom() { toggle(Math.floor(Math.random()*N), Math.floor(Math.random()*N)); }
function renderLights() {
  loGridEl.innerHTML = '';
  for (let i=0;i<N;i++) {
    for (let j=0;j<N;j++) {
      const d = document.createElement('div');
      d.className = 'light-cell'+(lo[i][j]?' on':'');
      d.addEventListener('click', ()=>{
        toggle(i,j); renderLights(); updateLoStatus();
      });
      loGridEl.appendChild(d);
    }
  }
}
function updateLoStatus() {
  const onCount = lo.flat().filter(Boolean).length;
  if (onCount===0) loStatus.textContent = 'Solved! All lights out ✅';
  else loStatus.textContent = `${onCount} lights on`;
}
loShuffle.addEventListener('click', ()=>initLights(true));
initLights(true);

/* =======================
   Memory Match
======================= */
const memGrid = document.getElementById('memGrid');
const memReset = document.getElementById('memReset');
const memStatus = document.getElementById('memStatus');
const symbols = ['🍎','🍌','🍒','🍇','🍉','🍑','🥝','🍍'];
let deck = [], first=null, second=null, lock=false, pairs=0, moves=0;
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function newMemory() {
  deck = shuffle([...symbols, ...symbols]).map((s, idx) => ({ id: idx, s, matched:false }));
  first=second=null; lock=false; pairs=0; moves=0;
  renderMemory();
  memStatus.textContent = 'Find all pairs!';
}
function renderMemory() {
  memGrid.innerHTML = '';
  deck.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card' + (card.matched ? ' flipped' : '');
    const inner = document.createElement('div'); inner.className='card-inner';
    const front = document.createElement('div'); front.className='card-face front'; front.textContent='?';
    const back = document.createElement('div'); back.className='card-face back'; back.textContent=card.s;
    inner.appendChild(front); inner.appendChild(back); el.appendChild(inner);
    el.addEventListener('click', ()=>flipCard(card, el));
    memGrid.appendChild(el);
  });
}
function flipCard(card, el) {
  if (lock || card.matched) return;
  el.classList.add('flipped');
  if (!first) { first = {card, el}; return; }
  if (first.card.id === card.id) return; // same card
  second = {card, el}; lock = true; moves++;
  if (first.card.s === second.card.s) {
    first.card.matched = second.card.matched = true;
    pairs++;
    lock=false; first=second=null;
    memStatus.textContent = `Nice! Pairs: ${pairs} | Moves: ${moves}`;
    if (pairs === symbols.length) memStatus.textContent = `All matched in ${moves} moves! 🎉`;
  } else {
    setTimeout(()=>{
      first.el.classList.remove('flipped'); second.el.classList.remove('flipped');
      lock=false; first=second=null;
      memStatus.textContent = `Try again. Moves: ${moves}`;
    }, 700);
  }
}
memReset.addEventListener('click', newMemory);
newMemory();

/* =======================
   Monty Hall Lab
======================= */
const doorBtns = document.querySelectorAll('.door');
const stayBtn = document.getElementById('stayBtn');
const switchBtn = document.getElementById('switchBtn');
const montyReset = document.getElementById('montyReset');
const mGames = document.getElementById('mGames');
const mStayWins = document.getElementById('mStayWins');
const mSwitchWins = document.getElementById('mSwitchWins');
const montyMsg = document.getElementById('montyMsg');

let prize, chosen=null, opened=null, phase='pick'; // 'pick' -> 'choose'
let games=0, stayWins=0, switchWins=0;

function resetMonty() {
  prize = Math.floor(Math.random()*3);
  chosen = null; opened = null; phase='pick';
  doorBtns.forEach((b,i)=>{ b.disabled=false; b.textContent='🚪'; b.className='door'; });
  stayBtn.disabled = true; switchBtn.disabled = true;
  montyMsg.textContent = 'Pick a door.';
}
resetMonty();

doorBtns.forEach((btn,i)=>{
  btn.addEventListener('click',()=>{
    if (phase!=='pick') return;
    chosen = i;
    // Host opens a goat door that's not chosen and not prize
    const candidates = [0,1,2].filter(d => d!==chosen && d!==prize);
    opened = candidates[Math.floor(Math.random()*candidates.length)];
    doorBtns[opened].textContent = '🐐';
    doorBtns[opened].disabled = true;
    phase='choose';
    stayBtn.disabled = false; switchBtn.disabled = false;
    montyMsg.textContent = 'Stay or switch?';
  });
});

stayBtn.addEventListener('click', ()=>{
  endMonty(chosen===prize, 'stay');
});
switchBtn.addEventListener('click', ()=>{
  const switched = [0,1,2].find(d => d!==chosen && d!==opened);
  endMonty(switched===prize, 'switch');
});
function endMonty(win, how) {
  games++;
  if (win) {
    if (how==='stay') stayWins++; else switchWins++;
  }
  doorBtns.forEach((b,i)=>{
    b.textContent = (i===prize) ? '🚗' : (i===opened ? '🐐' : '🐐');
    b.disabled = true;
  });
  mGames.textContent = games;
  mStayWins.textContent = stayWins;
  mSwitchWins.textContent = switchWins;
  montyMsg.textContent = win ? `You win by choosing to ${how}!` : `You lose by choosing to ${how}.`;
  stayBtn.disabled = true; switchBtn.disabled = true;
  setTimeout(resetMonty, 1200);
}
montyReset.addEventListener('click', ()=>{ games=stayWins=switchWins=0;
  mGames.textContent = mStayWins.textContent = mSwitchWins.textContent = 0; resetMonty(); });

/* =======================
   Nonsense Button
======================= */
const nScoreEl = document.getElementById('nScore');
const nButton = document.getElementById('nButton');
const nMsg = document.getElementById('nMsg');
const nReset = document.getElementById('nReset');
let nScore = 0, chaosLevel = 0;

function updateNonsense(msg) {
  nScoreEl.textContent = nScore;
  if (msg) nMsg.textContent = msg;
}
nButton.addEventListener('click', ()=>{
  // random chaos rules
  const r = Math.random();
  if (r < 0.2) { nScore += 5; updateNonsense('Lucky! +5'); }
  else if (r < 0.4) { nScore -= 4; updateNonsense('Oops… -4'); }
  else if (r < 0.55) { nScore *= -1; updateNonsense('Reality inverted. Score flipped!'); }
  else if (r < 0.7) { nScore += chaosLevel; updateNonsense(`Chaos echoes +${chaosLevel}`); }
  else if (r < 0.85) { chaosLevel++; updateNonsense('Chaos level increased. Future clicks hurt/help more.'); }
  else { nScore = Math.floor(Math.random()*50); updateNonsense('The universe rerolled your score.'); }
});
nReset.addEventListener('click', ()=>{ nScore=0; chaosLevel=0; updateNonsense('Reset.'); });
updateNonsense('Press to embrace nonsense.');

/* =======================
   Luck Lab
======================= */
const luckGuess = document.getElementById('luckGuess');
const luckTry = document.getElementById('luckTry');
const luckNew = document.getElementById('luckNew');
const luckMsg = document.getElementById('luckMsg');
const lRounds = document.getElementById('lRounds');
const lWins = document.getElementById('lWins');
const lTwists = document.getElementById('lTwists');

let secret=null, rounds=0, wins=0, twists=0, twistActive=false;

function newRound() {
  secret = 1 + Math.floor(Math.random()*10);
  rounds++; twistActive = Math.random() < 0.35; // sometimes unfair
  lRounds.textContent = rounds;
  luckMsg.textContent = twistActive ? 'New round! (…rumors of unfairness)' : 'New round! Fair odds? Maybe.';
}
newRound();

luckTry.addEventListener('click', ()=>{
  const g = parseInt(luckGuess.value,10);
  if (!g || g<1 || g>10) { luckMsg.textContent='Enter 1–10.'; return; }
  let actual = secret;
  if (twistActive) {
    // Move the target away from user's guess occasionally
    if (Math.random() < 0.5) {
      twists++;
      actual = (secret % 10) + 1; // shift number
      lTwists.textContent = twists;
    }
  }
  if (g === actual) { wins++; lWins.textContent = wins; luckMsg.textContent = `You guessed ${g}. Secret was ${actual}. You win!`; }
  else { luckMsg.textContent = `You guessed ${g}. Secret was ${actual}. Not this time.`; }
});
luckNew.addEventListener('click', newRound);
