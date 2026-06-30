/* ===========================================================
   メディスポット プロトタイプ 共通スクリプト (assets/app.js)
   - localStorageを擬似DBとして使用
   =========================================================== */

const DB_KEY = 'medispot_db_v1';
const SESSION_KEY = 'medispot_session';

const EMPLOYMENT_TYPES = ['常勤', '非常勤', 'スポット（単発）', '業務委託'];
const SKILL_OTHER = 'その他（自由記載）';

const PAYMENT_METHOD_LABEL = {
  payjp: 'Pay.jp（カード決済）',
  invoice: '請求書払い',
};

const DEFAULT_CATEGORIES = [
  '看護師', '保健師', '助産師', '臨床検査技師', '放射線技師',
  '理学療法士（PT）', '作業療法士（OT）', '言語聴覚士（ST）', 'ヘルパー',
];

const DEFAULT_SKILL_MAP = {
  '看護師': ['急性期病棟', '外来対応', '訪問看護', '点滴・採血', '夜勤対応', 'NICU'],
  '保健師': ['健診業務', '保健指導', '母子保健', '産業保健', '地域保健', '特定保健指導'],
  '助産師': [],
  '臨床検査技師': ['採血', '生理検査', '微生物検査', '病理検査', '健診業務'],
  '放射線技師': ['一般撮影', 'CT', 'MRI', 'マンモグラフィ', '健診業務'],
  '理学療法士（PT）': ['整形外科リハビリ', '回復期リハビリ', '訪問リハビリ', '訪問看護リハビリ'],
  '作業療法士（OT）': [],
  '言語聴覚士（ST）': ['嚥下訓練', '言語訓練', '小児言語訓練', '外来対応'],
  'ヘルパー': ['訪問介護', '身体介護', '生活援助', '直行直帰OK'],
};

/* ----------------------------------------------------------
   DB 読み書き
   ---------------------------------------------------------- */
function loadDB() {
  let raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const fresh = seedDB();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const db = JSON.parse(raw);
    // 後方互換: 足りないキーを補完
    db.users = db.users || [];
    db.jobs = db.jobs || [];
    db.applications = db.applications || [];
    db.matches = db.matches || [];
    db.messages = db.messages || [];
    db.categories = db.categories || DEFAULT_CATEGORIES.slice();
    db.skillMap = db.skillMap || JSON.parse(JSON.stringify(DEFAULT_SKILL_MAP));
    return db;
  } catch (e) {
    const fresh = seedDB();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDB() {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(SESSION_KEY);
  location.href = 'index.html';
}

/* ----------------------------------------------------------
   初期デモデータ
   ---------------------------------------------------------- */
function seedDB() {
  const now = new Date();
  const fmt = (d) => d.toLocaleDateString('ja-JP');

  const users = [
    {
      id: 'seeker-demo',
      role: 'seeker',
      name: '佐藤 花子',
      email: 'seeker@example.com',
      password: 'demo1234',
      profile: {
        category: '看護師',
        birthdate: '1992-04-10',
        residence: '東京都世田谷区',
        experience: '8年',
        skills: ['急性期病棟', '夜勤対応'],
        skillOther: '',
        desiredType: 'こだわらない',
        license: '看護師免許',
      },
      certificates: ['cert1.pdf', 'cert2.pdf'],
      resume: {
        summary: '急性期病棟を中心に8年間勤務してきました。',
        careers: [
          { period: '2018/04〜現在', company: '〇〇総合病院', dept: '内科病棟', detail: '夜勤を含むシフト勤務、新人指導も担当' },
        ],
        education: [
          { ym: '2014/03', content: '〇〇看護専門学校 卒業' },
        ],
        licenses: [
          { ym: '2014/04', name: '看護師免許' },
        ],
        strengths: '急変対応、患者・家族とのコミュニケーション',
        selfPr: '丁寧な観察と記録を心がけ、チーム医療を大切にしています。',
      },
      suspended: false,
      createdAt: fmt(now),
    },
    {
      id: 'seeker-2',
      role: 'seeker',
      name: '田中 太郎',
      email: 'tanaka@example.com',
      password: 'demo1234',
      profile: {
        category: '理学療法士（PT）',
        birthdate: '1995-07-22',
        residence: '東京都新宿区',
        experience: '5年',
        skills: ['整形外科リハビリ'],
        skillOther: '',
        desiredType: '常勤',
        license: '理学療法士免許',
      },
      certificates: [],
      resume: null,
      suspended: false,
      createdAt: fmt(now),
    },
    {
      id: 'seeker-3',
      role: 'seeker',
      name: '鈴木 一郎',
      email: 'suzuki@example.com',
      password: 'demo1234',
      profile: {
        category: '放射線技師',
        birthdate: '1989-02-14',
        residence: '東京都渋谷区',
        experience: '10年',
        skills: [],
        skillOther: '',
        desiredType: 'こだわらない',
        license: '診療放射線技師免許',
      },
      certificates: [],
      resume: null,
      suspended: false,
      createdAt: fmt(now),
    },
    {
      id: 'employer-demo',
      role: 'employer',
      name: '山田',
      email: 'employer@example.com',
      password: 'demo1234',
      org: {
        name: 'ブランチ総合クリニック',
        facility: 'クリニック（無床）',
        address: '東京都世田谷区branch1-2-3',
        location: '東京都世田谷区',
      },
      suspended: false,
      createdAt: fmt(now),
    },
    {
      id: 'admin-demo',
      role: 'admin',
      name: '運営事務局',
      email: 'admin@example.com',
      password: 'demo1234',
      suspended: false,
      createdAt: fmt(now),
    },
  ];

  const jobs = [
    {
      id: 'job-1',
      employerId: 'employer-demo',
      title: '【日勤のみ】外来看護師（ブランクOK・週3日〜）',
      category: '看護師',
      type: '非常勤',
      salary: '時給 2,200円〜2,600円',
      location: '東京都世田谷区',
      description: '日勤のみのクリニック外来勤務です。ブランクのある方も歓迎します。',
      requirements: '看護師免許をお持ちの方',
      status: 'open',
      createdAt: '2026/05/12',
    },
    {
      id: 'job-2',
      employerId: 'employer-demo',
      title: '放射線技師（健診・一般撮影／土日休み）',
      category: '放射線技師',
      type: '常勤',
      salary: '月給 28万円〜35万円',
      location: '東京都世田谷区',
      description: '健診センターでの一般撮影業務がメインです。',
      requirements: '診療放射線技師免許',
      status: 'open',
      createdAt: '2026/05/20',
    },
    {
      id: 'job-3',
      employerId: 'employer-demo',
      title: '作業療法士（OT）（回復期リハ・週3日〜）',
      category: '作業療法士（OT）',
      type: '非常勤',
      salary: '時給 2,000円〜2,400円',
      location: '東京都世田谷区',
      description: '回復期病棟でのリハビリ業務です。',
      requirements: '作業療法士免許',
      status: 'open',
      createdAt: '2026/05/28',
    },
    {
      id: 'job-4',
      employerId: 'employer-demo',
      title: '理学療法士（PT)　（整形外科クリニック・新設リハ室）',
      category: '理学療法士（PT）',
      type: '常勤',
      salary: '月給 28万円〜34万円',
      location: '東京都世田谷区',
      description: '新設のリハビリ室での整形外科リハビリ業務です。',
      requirements: '理学療法士免許',
      status: 'open',
      createdAt: '2026/06/01',
    },
    {
      id: 'job-5',
      employerId: 'employer-demo',
      title: '言語聴覚士（ST)　（外来・小児言語訓練）',
      category: '言語聴覚士（ST）',
      type: '非常勤',
      salary: '時給 2,100円〜2,500円',
      location: '東京都世田谷区',
      description: '小児を中心とした言語訓練業務です。',
      requirements: '言語聴覚士免許',
      status: 'open',
      createdAt: '2026/06/05',
    },
    {
      id: 'job-6',
      employerId: 'employer-demo',
      title: '臨床検査技師（健診センター・年間休日125日）',
      category: '臨床検査技師',
      type: '常勤',
      salary: '月給 26万円〜32万円',
      location: '東京都世田谷区',
      description: '健診センターでの採血・生理検査業務です。',
      requirements: '臨床検査技師免許',
      status: 'open',
      createdAt: '2026/06/08',
    },
    {
      id: 'job-7',
      employerId: 'employer-demo',
      title: 'ヘルパー（訪問介護・直行直帰OK）',
      category: 'ヘルパー',
      type: '非常勤',
      salary: '時給 1,500円〜1,800円',
      location: '東京都世田谷区',
      description: '訪問介護業務です。直行直帰OKです。',
      requirements: '介護職員初任者研修以上',
      status: 'open',
      createdAt: '2026/06/10',
    },
  ];

  const applications = [
    {
      id: 'app-1',
      jobId: 'job-1',
      seekerId: 'seeker-demo',
      message: '日勤のみとのことで、ぜひ働かせていただきたいです。',
      status: 'matched',
      createdAt: '2026/05/12 10:15',
    },
    {
      id: 'app-2',
      jobId: 'job-2',
      seekerId: 'seeker-3',
      message: '一般撮影の経験が豊富にあります。よろしくお願いいたします。',
      status: 'matched',
      createdAt: '2026/05/20 11:00',
    },
    {
      id: 'app-3',
      jobId: 'job-3',
      seekerId: 'seeker-2',
      message: '回復期リハビリに興味があり応募しました。',
      status: 'applied',
      createdAt: '2026/05/28 09:00',
    },
    {
      id: 'app-4',
      jobId: 'job-4',
      seekerId: 'seeker-2',
      message: '整形外科リハビリの経験を活かしたいです。',
      status: 'matched',
      createdAt: '2026/06/01 14:00',
    },
    {
      id: 'app-5',
      jobId: 'job-5',
      seekerId: 'seeker-3',
      message: '小児言語訓練に関心があります。',
      status: 'matched',
      createdAt: '2026/06/05 10:30',
    },
    {
      id: 'app-6',
      jobId: 'job-6',
      seekerId: 'seeker-2',
      message: '健診業務の経験があります。',
      status: 'applied',
      createdAt: '2026/06/08 13:20',
    },
    {
      id: 'app-7',
      jobId: 'job-7',
      seekerId: 'seeker-demo',
      message: '訪問介護の経験はありませんが、意欲があります。',
      status: 'applied',
      createdAt: '2026/06/10 16:00',
    },
  ];

  const matches = [
    {
      id: 'match-1',
      applicationId: 'app-1',
      jobId: 'job-1',
      seekerId: 'seeker-demo',
      employerId: 'employer-demo',
      fee: 55000,
      paymentMethod: 'payjp',
      paymentStatus: 'paid',
      paid: true,
      invoiceNo: 'INV-202606-0HJN',
      invoiceIssuedAt: '2026/6/30 11:46',
      createdAt: '2026/06/13 10:15',
    },
    {
      id: 'match-2',
      applicationId: 'app-2',
      jobId: 'job-2',
      seekerId: 'seeker-3',
      employerId: 'employer-demo',
      fee: 55000,
      paymentMethod: 'invoice',
      paymentStatus: 'unpaid',
      paid: false,
      invoiceNo: null,
      invoiceIssuedAt: null,
      createdAt: '2026/06/15 16:40',
    },
    {
      id: 'match-3',
      applicationId: 'app-4',
      jobId: 'job-4',
      seekerId: 'seeker-2',
      employerId: 'employer-demo',
      fee: 55000,
      paymentMethod: 'payjp',
      paymentStatus: 'paid',
      paid: true,
      invoiceNo: null,
      invoiceIssuedAt: null,
      createdAt: '2026/06/13 10:15',
    },
  ];

  const messages = [
    { id: 'msg-1', matchId: 'match-1', senderId: 'system', text: 'マッチングが成立しました。こちらのチャットルームで勤務開始日や条件の詳細をご相談ください。', createdAt: '2026/06/13 10:15' },
  ];

  return {
    users,
    jobs,
    applications,
    matches,
    messages,
    categories: DEFAULT_CATEGORIES.slice(),
    skillMap: JSON.parse(JSON.stringify(DEFAULT_SKILL_MAP)),
  };
}

/* ----------------------------------------------------------
   認証 / セッション
   ---------------------------------------------------------- */
function login(email, password) {
  const db = loadDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return null;
  sessionStorage.setItem(SESSION_KEY, user.id);
  return user;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  location.href = 'login.html';
}

function currentUser() {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const db = loadDB();
  return getUser(db, id) || null;
}

function requireRole(role) {
  const user = currentUser();
  if (!user) { location.href = 'login.html'; return null; }
  if (user.role !== role) { location.href = homeFor(user.role); return null; }
  return user;
}

function homeFor(role) {
  if (role === 'seeker') return 'seeker-home.html';
  if (role === 'employer') return 'employer-home.html';
  if (role === 'admin') return 'admin-home.html';
  return 'login.html';
}

/* ----------------------------------------------------------
   取得系ヘルパー
   ---------------------------------------------------------- */
function getUser(db, id) { return db.users.find(u => u.id === id); }
function getJob(db, id) { return db.jobs.find(j => j.id === id); }
function getApp(db, id) { return db.applications.find(a => a.id === id); }
function getMatch(db, id) { return db.matches.find(m => m.id === id); }

function jobsForEmployer(db, employerId) {
  return db.jobs.filter(j => j.employerId === employerId);
}

function applicationsForJob(db, jobId) {
  return db.applications.filter(a => a.jobId === jobId);
}

function applicationsForSeeker(db, seekerId) {
  return db.applications.filter(a => a.seekerId === seekerId);
}

function matchesForUser(db, userId) {
  return db.matches.filter(m => m.seekerId === userId || m.employerId === userId);
}

function getCategories(db) {
  db = db || loadDB();
  return db.categories && db.categories.length ? db.categories : DEFAULT_CATEGORIES.slice();
}

function getSkillMap(db) {
  db = db || loadDB();
  return db.skillMap || {};
}

/* ----------------------------------------------------------
   料金 / 請求書
   ---------------------------------------------------------- */
const MATCH_FEE_INCL_TAX = 55000;
const TAX_RATE = 0.10;

function feeBreakdown(feeIncl) {
  const exTax = Math.round(feeIncl / (1 + TAX_RATE));
  return { exTax, tax: feeIncl - exTax };
}

function makeInvoiceNo() {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ym}-${rand}`;
}

function openInvoice(matchId) {
  window.open(`invoice.html?matchId=${matchId}`, '_blank');
}

function downloadContract(matchId) {
  alert('（プロトタイプ）契約書テンプレートのダウンロードは準備中です。\nmatchId: ' + matchId);
}

/* ----------------------------------------------------------
   汎用ユーティリティ
   ---------------------------------------------------------- */
function uid() {
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function nowStr() {
  return new Date().toLocaleString('ja-JP');
}

function qs(key) {
  return new URLSearchParams(location.search).get(key);
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function calcAge(birthdate) {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function statusBadge(status) {
  const map = {
    open: '<span class="status open">掲載中</span>',
    closed: '<span class="status suspended">掲載終了</span>',
    applied: '<span class="status applied">応募中</span>',
    screening: '<span class="status screening">選考中</span>',
    matched: '<span class="status matched">マッチング成立</span>',
    rejected: '<span class="status rejected">見送り</span>',
  };
  return map[status] || `<span class="status">${esc(status)}</span>`;
}

/* ----------------------------------------------------------
   ヘッダー / フッター 描画
   ---------------------------------------------------------- */
function renderHeader(activePage) {
  const el = document.getElementById('header');
  if (!el) return;
  const me = currentUser();

  let roleBadge = '';
  let nav = '';

  if (me && me.role === 'seeker') {
    roleBadge = `<span class="role-badge seeker">求職者：${esc(me.name)}</span>`;
    nav = `
      <a href="seeker-home.html" class="${activePage === 'seeker-home.html' ? 'active' : ''}">マイページ</a>
      <a href="seeker-jobs.html" class="${activePage === 'seeker-jobs.html' ? 'active' : ''}">求人を探す</a>
      <a href="seeker-profile.html" class="${activePage === 'seeker-profile.html' ? 'active' : ''}">プロフィール</a>
      <a href="seeker-resume.html" class="${activePage === 'seeker-resume.html' ? 'active' : ''}">職務経歴書</a>
      <a href="#" onclick="logout();return false;">ログアウト</a>`;
  } else if (me && me.role === 'employer') {
    roleBadge = `<span class="role-badge employer">求人者：${esc(me.org.name)}</span>`;
    nav = `
      <a href="employer-home.html" class="${activePage === 'employer-home.html' ? 'active' : ''}">マイページ</a>
      <a href="employer-job-new.html" class="${activePage === 'employer-job-new.html' ? 'active' : ''}">求人作成</a>
      <a href="employer-jobs.html" class="${activePage === 'employer-jobs.html' ? 'active' : ''}">掲載求人管理</a>
      <a href="#" onclick="logout();return false;">ログアウト</a>`;
  } else if (me && me.role === 'admin') {
    roleBadge = `<span class="role-badge admin">運営：運営 事務局</span>`;
    nav = `
      <a href="admin-home.html" class="${activePage === 'admin-home.html' ? 'active' : ''}">ダッシュボード</a>
      <a href="admin-users.html" class="${activePage === 'admin-users.html' ? 'active' : ''}">会員管理</a>
      <a href="admin-matches.html" class="${activePage === 'admin-matches.html' ? 'active' : ''}">進捗管理</a>
      <a href="admin-billing.html" class="${activePage === 'admin-billing.html' ? 'active' : ''}">請求管理</a>
      <a href="admin-masters.html" class="${activePage === 'admin-masters.html' ? 'active' : ''}">職種・スキル</a>
      <a href="#" onclick="logout();return false;">ログアウト</a>`;
  } else {
    nav = `<a href="login.html">ログイン</a> <a href="register.html">新規登録</a>`;
  }

  if (document.body) {
    document.body.classList.remove('role-seeker', 'role-employer', 'role-admin');
    if (me) document.body.classList.add('role-' + me.role);
  }

  el.innerHTML = `
    <header class="site-header">
      <div class="inner">
        <a class="brand" href="index.html"><span class="mark">🏥</span>メディスポット</a>
        <nav>
          ${roleBadge}
          ${nav}
        </nav>
      </div>
    </header>`;
}

function renderFooter() {
  const el = document.getElementById('footer');
  if (!el) return;
  el.innerHTML = `
    <footer class="site-footer">
      医療特化型広告マッチングシステム プロトタイプ V1 ／
      <a href="#" onclick="resetDB();return false;">デモデータを初期化</a>
    </footer>`;
}
