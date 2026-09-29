/**
 * KeysPage: the body of the public-key page, in the language of the
 * dictionary. The route file renders it inside SiteFrame.
 *
 *   head band      breadcrumb, title, ledes, links to the sections
 *   #pgp           key card (facts, pgp.asc, download) and usage steps
 *   #ssh           key card (facts, ssh.pub, download) and usage steps
 *   #verify        the six trust notes
 *   back link
 *   status region  announces the result of the copy buttons
 *
 * All text comes from the dictionary; fingerprints, dates, file names,
 * commands and the key text come from '@/content/keys/facts'.
 *
 * Props
 *   locale      language of the page
 *   dictionary  the dictionary of the language, from getDictionary(locale)
 *
 * Server Component. The copy buttons, the status region and the scrolling
 * key text are Client Components; they receive plain strings only.
 */

import { CopyStatusProvider, EmailOff, PageContainer } from '@/components/site';
import { keyFacts, PGP_ARMOR, SSH_LINE } from '@/content/keys/facts';
import type { Dictionary } from '@/content/types';
import type { Locale } from '@/i18n/config';

import { BackLink } from './back-link';
import { CopyButton } from './copy-button';
import { Fingerprint } from './fingerprint';
import {
  factValue,
  KeyCard,
  KeyDownload,
  KeyFact,
  KeyFactRow,
  KeyFacts,
  KeyFile,
} from './key-card';
import { KeySection, NotesSection } from './key-section';
import { KeyText } from './key-text';
import { KeyTextScroll } from './key-text-scroll';
import { PageHead } from './page-head';
import { TrustNotes } from './trust-notes';
import { UsageSteps } from './usage-steps';

export interface KeysPageProps {
  locale: Locale;
  dictionary: Dictionary;
}

/** Element ids, as on the old pages. */
const ids = {
  title: 'keys-title',
  pgp: {
    fingerprint: 'pgp-fpr',
    fingerprintLabel: 'pgp-fpr-label',
    fileName: 'pgp-file',
    text: 'pgp-armor',
  },
  ssh: {
    fingerprint: 'ssh-fpr',
    fingerprintLabel: 'ssh-fpr-label',
    fileName: 'ssh-file',
    text: 'ssh-line',
  },
} as const;

export function KeysPage({ locale, dictionary }: KeysPageProps) {
  const { common, keys } = dictionary;
  const { anchors, pgp, ssh } = keyFacts;

  return (
    <CopyStatusProvider>
      <PageHead
        locale={locale}
        titleId={ids.title}
        name={keys.head.kicker}
        title={keys.head.title}
        lede={keys.head.lede}
        breadcrumbLabel={keys.head.breadcrumbLabel}
        sectionsLabel={keys.head.sectionsLabel}
        sections={[
          { id: anchors.pgp, title: keys.pgp.title },
          { id: anchors.ssh, title: keys.ssh.title },
          { id: anchors.trust, title: keys.trust.title },
        ]}
      />

      <PageContainer className="pt-10 pb-16 lg:pt-14 lg:pb-24">
        <KeySection
          id={anchors.pgp}
          title={keys.pgp.title}
          intro={keys.pgp.intro}
          card={
            <KeyCard>
              <KeyFacts>
                <KeyFact
                  label={keys.pgp.factLabels.fingerprint}
                  labelId={ids.pgp.fingerprintLabel}
                  action={
                    <CopyButton
                      text={pgp.fingerprint.compact}
                      labels={common.copy}
                      context={[ids.pgp.fingerprintLabel, `${anchors.pgp}-title`]}
                    />
                  }
                >
                  <Fingerprint
                    id={ids.pgp.fingerprint}
                    parts={pgp.fingerprint.halves}
                    separator=" "
                  />
                </KeyFact>
                <KeyFactRow
                  label={keys.pgp.factLabels.userId}
                  value={
                    <EmailOff
                      as="dd"
                      text={pgp.userId}
                      translate="no"
                      lang="en"
                      className={factValue}
                    />
                  }
                />
                <KeyFact label={keys.pgp.factLabels.type}>{keys.pgp.factValues.type}</KeyFact>
                <KeyFact label={keys.pgp.factLabels.validity}>
                  {keys.pgp.factValues.validity}
                </KeyFact>
              </KeyFacts>
              <KeyFile
                file={pgp.file}
                nameId={ids.pgp.fileName}
                action={
                  <CopyButton
                    text={PGP_ARMOR}
                    labels={common.copy}
                    context={[ids.pgp.fileName]}
                    variant="ghost"
                  />
                }
              >
                <KeyTextScroll id={ids.pgp.text} text={PGP_ARMOR} label={keys.pgp.keyAriaLabel} />
              </KeyFile>
              <KeyDownload file={pgp.file}>{keys.pgp.download}</KeyDownload>
            </KeyCard>
          }
          steps={
            <UsageSteps
              title={keys.pgp.usageTitle}
              steps={pgp.steps}
              descriptions={keys.pgp.steps}
            />
          }
        />

        <KeySection
          id={anchors.ssh}
          className="mt-14"
          title={keys.ssh.title}
          intro={keys.ssh.intro}
          card={
            <KeyCard>
              <KeyFacts>
                <KeyFact
                  label={keys.ssh.factLabels.fingerprint}
                  labelId={ids.ssh.fingerprintLabel}
                  action={
                    <CopyButton
                      text={ssh.fingerprint.text}
                      labels={common.copy}
                      context={[ids.ssh.fingerprintLabel, `${anchors.ssh}-title`]}
                    />
                  }
                >
                  <Fingerprint id={ids.ssh.fingerprint} parts={ssh.fingerprint.parts} />
                </KeyFact>
                <KeyFact label={keys.ssh.factLabels.type}>{keys.ssh.factValues.type}</KeyFact>
              </KeyFacts>
              <KeyFile
                file={ssh.file}
                nameId={ids.ssh.fileName}
                action={
                  <CopyButton
                    text={SSH_LINE}
                    labels={common.copy}
                    context={[ids.ssh.fileName]}
                    variant="ghost"
                  />
                }
              >
                <KeyText id={ids.ssh.text} text={SSH_LINE} label={keys.ssh.keyAriaLabel} />
              </KeyFile>
              <KeyDownload file={ssh.file}>{keys.ssh.download}</KeyDownload>
            </KeyCard>
          }
          steps={
            <UsageSteps
              title={keys.ssh.usageTitle}
              steps={ssh.steps}
              descriptions={keys.ssh.steps}
            />
          }
        />

        <NotesSection id={anchors.trust} className="mt-14" title={keys.trust.title}>
          <TrustNotes notes={keys.trust.notes} />
        </NotesSection>

        <BackLink locale={locale}>{keys.backLink}</BackLink>
      </PageContainer>
    </CopyStatusProvider>
  );
}
