/**
 * Simplified Chinese: the public-key page.
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

const description = '段泽浩的 PGP 与 SSH 公钥：指纹、下载链接，以及使用前如何核对。';

export const keys: KeysContent = {
  meta: {
    title: '公钥 — 段泽浩',
    description,
    ogDescription: description,
    author: name,
    siteName: name,
  },

  head: {
    kicker: name,
    title: '公钥',
    breadcrumbLabel: '面包屑',
    sectionsLabel: '本页目录',
    lede: [
      <>这些是我的公钥。你可以用它们给我发送只有我能读到的内容，核实某个文件确实出自我手，或者让我不用密码就能登录某台服务器。</>,
      <>公钥本来就是用来公开的。它只能用来加密信息和验证签名，不能解密，也不能签名；解密和签名要用与它配对的私钥，而私钥从不离开我的设备。如果你并不了解这些，本页内容无需理会，照常发电子邮件就好。</>,
    ],
  },

  pgp: {
    title: 'PGP 公钥',
    intro: <>用于加密邮件和文件，以及验证我的签名。适用于 GnuPG、Thunderbird 等支持 OpenPGP 的软件。</>,
    factLabels: {
      fingerprint: '指纹',
      userId: '用户 ID',
      type: '类型',
      validity: '有效期',
    },
    factValues: {
      type: <>{pgp.algorithm.primary.name}（签名），附 {pgp.algorithm.subkey.name} 子密钥（加密）</>,
      validity: <>创建于 <IsoDate value={pgp.created} />，有效期至 <IsoDate value={pgp.expires} /></>,
    },
    keyAriaLabel: 'PGP 公钥（ASCII 封装）',
    download: <>下载 <NoTranslate>{pgp.file.fileName}</NoTranslate></>,
    usageTitle: '使用方法',
    steps: {
      download: <>下载公钥。</>,
      check: <>导入之前先核对。输出中 <Code>pub</Code> 下面一行的指纹必须与本页所示逐字符一致。较新版本的 GnuPG 还会在 <Code>sub</Code> 下面显示第二个指纹，那是加密子密钥的指纹，无需比对。</>,
      import: <>导入。</>,
      encrypt: <>加密一个文件，使它只有我能解密。GnuPG 会要求你确认，因为它还没有证据表明这把密钥属于我；下文的指纹核对就是这份证据。</>,
      verify: <>验证我的签名。输出中应出现“Good signature”（简体中文环境下为“完好的签名”）和同一个指纹。GnuPG 还会显示一条警告，说这把密钥未经受信任的签名认证（“This key is not certified with a trusted signature!”）；原因与第 4 步相同，并不表示验证失败。</>,
    },
  },

  ssh: {
    title: 'SSH 公钥',
    intro: <>用于免密码登录服务器和 Git 托管平台。如果你管理的机器需要给我开通访问权限，加上这一行即可。</>,
    factLabels: {
      fingerprint: '指纹',
      type: '类型',
    },
    factValues: {
      type: <>{ssh.algorithm.name}，{ssh.algorithm.bits} 位</>,
    },
    download: <>下载 <NoTranslate>{ssh.file.fileName}</NoTranslate></>,
    usageTitle: '使用方法',
    steps: {
      download: <>下载公钥。</>,
      check: <>核对。命令输出的指纹必须与本页所示逐字符一致。</>,
      authorise: <>授权：把这一行追加到我要使用的那个账户的 <Code>~/.ssh/authorized_keys</Code>。此后，持有对应私钥的人就能登录该账户，所以只应加在确实要给我访问权限的地方。如果该账户还没有 <Code>~/.ssh</Code>，请先用 <Code>mkdir -m 700 ~/.ssh</Code> 创建，并把 <Code>authorized_keys</Code> 的权限保持为 600：只要其他用户可以写入，sshd 就会忽略这个文件。</>,
    },
  },

  trust: {
    title: '信任这些公钥之前',
    notes: [
      {
        id: 'location',
        lead: '确认网址。',
        body: <>地址栏应显示 <NoTranslate>{site.origin}</NoTranslate>，且没有证书警告。不要采用邮件附件、聊天消息或自称是我的链接里给出的“我的公钥”。</>,
      },
      {
        id: 'whole-fingerprint',
        lead: '完整比对指纹。',
        body: <>逐个字符核对，不要只看开头和结尾几位。伪造一把指纹首尾相同的密钥，成本很低。</>,
      },
      {
        id: 'second-channel',
        lead: '要紧的场合，请换一个渠道确认。',
        body: <>本页和密钥文件来自同一台服务器，所以这里显示的指纹只能证明二者彼此一致。涉及敏感内容时，请让我当面念出指纹，或者在你能认出我的声音或相貌的通话中念出；联系我时请用你原本就信任的联系方式，而不是待核实的消息里给出的联系方式。</>,
      },
      {
        id: 'not-secret',
        lead: '公钥不是秘密。',
        body: <>任何人都可以持有它。单凭公钥，既不能解密或签名，也不能登录任何系统。永远不要把私钥发给任何人；我也绝不会向你索要私钥。</>,
      },
      {
        id: 'keys-change',
        lead: '密钥会更换。',
        body: <>如果我没有延长有效期，这把 PGP 密钥将于 {pgp.expires} 到期。如果本页显示的密钥与你手中的不同，在向我确认之前，请把新密钥视为未经验证。</>,
      },
      {
        id: 'metadata',
        lead: '加密隐藏的是内容，不是一切。',
        body: <>用 PGP 加密的邮件仍然会显示发件人、收件人和时间；在不少邮件软件里，主题也不会被加密，所以主题请写得平淡些。</>,
      },
    ],
  },

  backLink: common.backToHome,
};
