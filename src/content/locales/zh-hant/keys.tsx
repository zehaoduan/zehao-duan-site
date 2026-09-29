/**
 * Traditional Chinese (Hong Kong): the public-key page.
 *
 * Algorithm names, dates and file names come from keys/facts.ts, so they are
 * typed once for all languages. Each paragraph stays on one line, so that no
 * space is gained or lost where a line would otherwise end.
 */

import { Code, IsoDate, NoTranslate } from '@/components/content/inline';
import { keyFacts } from '@/content/keys/facts';
import { site } from '@/content/site';
import type { KeysContent } from '@/content/types';

import { common, name } from './common';

const { pgp, ssh } = keyFacts;

const description = '段澤浩的 PGP 與 SSH 公鑰：指紋、下載連結，以及使用前如何核對。';

export const keys: KeysContent = {
  meta: {
    title: '公鑰 — 段澤浩',
    description,
    ogDescription: description,
    author: name,
    siteName: name,
  },

  head: {
    kicker: name,
    title: '公鑰',
    breadcrumbLabel: '瀏覽路徑',
    sectionsLabel: '本頁目錄',
    lede: [
      <>這些是我的公鑰。你可以用它們向我傳送只有我能讀到的內容，核實某個檔案確實出自我手，或者讓我不用密碼就能登入某台伺服器。</>,
      <>公鑰本來就是用來公開的。它只能用來加密訊息和驗證簽名，不能解密，也不能簽名；解密和簽名要用與它配對的私鑰，而私鑰從不離開我的裝置。如果你並不了解這些，本頁內容無需理會，照常發電郵就好。</>,
    ],
  },

  pgp: {
    title: 'PGP 公鑰',
    intro: <>用於加密電郵和檔案，以及驗證我的簽名。適用於 GnuPG、Thunderbird 等支援 OpenPGP 的軟件。</>,
    factLabels: {
      fingerprint: '指紋',
      userId: '用戶 ID',
      type: '類型',
      validity: '有效期',
    },
    factValues: {
      type: <>{pgp.algorithm.primary.name}（簽名），附 {pgp.algorithm.subkey.name} 子密鑰（加密）</>,
      validity: <>建立於 <IsoDate value={pgp.created} />，有效期至 <IsoDate value={pgp.expires} /></>,
    },
    keyAriaLabel: 'PGP 公鑰（ASCII 封裝）',
    download: <>下載 <NoTranslate>{pgp.file.fileName}</NoTranslate></>,
    usageTitle: '使用方法',
    steps: {
      download: <>下載公鑰。</>,
      check: <>匯入之前先核對。輸出中 <Code>pub</Code> 下面一行的指紋必須與本頁所示逐個字元一致。較新版本的 GnuPG 還會在 <Code>sub</Code> 下面顯示第二個指紋，那是加密子密鑰的指紋，無需比對。</>,
      import: <>匯入。</>,
      encrypt: <>加密一個檔案，使它只有我能解密。GnuPG 會要求你確認，因為它還沒有證據顯示這把密鑰屬於我；下文的指紋核對就是這份證據。</>,
      verify: <>驗證我的簽名。輸出中應出現「Good signature」（繁體中文介面顯示為「完好的簽章」）和同一個指紋。GnuPG 還會顯示一則警告，指這把密鑰未經受信任的簽名認證（「This key is not certified with a trusted signature!」）；原因與第 4 步相同，並不表示驗證失敗。</>,
    },
  },

  ssh: {
    title: 'SSH 公鑰',
    intro: <>用於免密碼登入伺服器和 Git 託管平台。如果你管理的機器需要給我存取權限，加上這一行即可。</>,
    factLabels: {
      fingerprint: '指紋',
      type: '類型',
    },
    factValues: {
      type: <>{ssh.algorithm.name}，{ssh.algorithm.bits} 位元</>,
    },
    download: <>下載 <NoTranslate>{ssh.file.fileName}</NoTranslate></>,
    usageTitle: '使用方法',
    steps: {
      download: <>下載公鑰。</>,
      check: <>核對。指令輸出的指紋必須與本頁所示逐個字元一致。</>,
      authorise: <>授權：把這一行附加到我要使用的那個帳戶的 <Code>~/.ssh/authorized_keys</Code>。此後，持有對應私鑰的人就能登入該帳戶，所以只應加在確實要給我存取權限的地方。如果該帳戶還沒有 <Code>~/.ssh</Code>，請先用 <Code>mkdir -m 700 ~/.ssh</Code> 建立，並把 <Code>authorized_keys</Code> 的權限保持為 600：只要其他使用者可以寫入，sshd 就會忽略這個檔案。</>,
    },
  },

  trust: {
    title: '信任這些公鑰之前',
    notes: [
      {
        id: 'location',
        lead: '確認網址。',
        body: <>網址列應顯示 <NoTranslate>{site.origin}</NoTranslate>，而且沒有證書警告。不要採用電郵附件、聊天訊息或自稱是我的連結裏給出的「我的公鑰」。</>,
      },
      {
        id: 'whole-fingerprint',
        lead: '完整比對指紋。',
        body: <>逐個字元核對，不要只看開頭和結尾幾位。偽造一把指紋首尾相同的密鑰，成本很低。</>,
      },
      {
        id: 'second-channel',
        lead: '要緊的場合，請換一個渠道確認。',
        body: <>本頁和密鑰檔案來自同一台伺服器，所以這裏顯示的指紋只能證明二者彼此一致。涉及敏感內容時，請讓我當面唸出指紋，或者在你能認出我的聲音或相貌的通話中唸出；聯絡我時請用你原本就信任的聯絡方式，而不是待核實的訊息裏給出的聯絡方式。</>,
      },
      {
        id: 'not-secret',
        lead: '公鑰不是秘密。',
        body: <>任何人都可以持有它。單憑公鑰，既不能解密或簽名，也不能登入任何系統。永遠不要把私鑰傳給任何人；我也絕不會向你索取私鑰。</>,
      },
      {
        id: 'keys-change',
        lead: '密鑰會更換。',
        body: <>如果我沒有延長有效期，這把 PGP 密鑰將於 {pgp.expires} 到期。如果本頁顯示的密鑰與你手上的不同，在向我確認之前，請把新密鑰視為未經驗證。</>,
      },
      {
        id: 'metadata',
        lead: '加密隱藏的是內容，不是一切。',
        body: <>用 PGP 加密的電郵仍然會顯示寄件人、收件人和時間；在不少郵件軟件裏，主旨也不會被加密，所以主旨請寫得平淡些。</>,
      },
    ],
  },

  backLink: common.backToHome,
};
