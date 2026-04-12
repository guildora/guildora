/**
 * Default footer page templates for self-hosted Guildora instances.
 *
 * These are non-binding templates — hosters must review and adapt them
 * to their own legal requirements.
 */

const DISCLAIMER_EN = `<div style="background: rgba(255, 180, 0, 0.08); border: 1px solid rgba(255, 180, 0, 0.25); border-radius: 0.5rem; padding: 1rem; margin-bottom: 2rem; font-size: 0.875rem; line-height: 1.6;">
<strong>⚠ Template Notice</strong><br>
This is a non-binding template provided as a starting point. It does not constitute legal advice. You are solely responsible for ensuring your legal pages comply with all applicable laws in your jurisdiction. Consult a qualified attorney before publishing.
</div>`;

const DISCLAIMER_DE = `<div style="background: rgba(255, 180, 0, 0.08); border: 1px solid rgba(255, 180, 0, 0.25); border-radius: 0.5rem; padding: 1rem; margin-bottom: 2rem; font-size: 0.875rem; line-height: 1.6;">
<strong>⚠ Vorlage — Hinweis</strong><br>
Dies ist eine unverbindliche Vorlage als Ausgangspunkt. Sie stellt keine Rechtsberatung dar. Sie sind allein dafür verantwortlich, dass Ihre Rechtstexte den geltenden Gesetzen entsprechen. Lassen Sie die Texte vor Veröffentlichung von einem Rechtsanwalt prüfen.
</div>`;

export const footerPageTemplates = [
  {
    slug: "privacy",
    title: { en: "Privacy Policy", de: "Datenschutzerklärung" },
    content: {
      en: `${DISCLAIMER_EN}
<h2>1. Data Controller</h2>
<p>[Your Name]<br>[Your Address]<br>[Your Email]</p>

<h2>2. What Data We Collect</h2>
<p>When you use this community platform, the following data may be processed:</p>
<ul>
<li><strong>Discord account data</strong> — Discord user ID, username, avatar, and email (via Discord OAuth)</li>
<li><strong>Member profiles</strong> — Display name, roles, custom fields as configured by community administrators</li>
<li><strong>Application data</strong> — Responses to application forms, uploaded files</li>
<li><strong>Session data</strong> — Login timestamps, session cookies</li>
<li><strong>Server logs</strong> — IP address, browser type, access timestamps (for security purposes)</li>
</ul>

<h2>3. Legal Basis</h2>
<p>We process your data based on:</p>
<ul>
<li><strong>Art. 6(1)(b) GDPR</strong> — Performance of a contract (providing the community platform)</li>
<li><strong>Art. 6(1)(a) GDPR</strong> — Your consent (where applicable, e.g., optional data fields)</li>
<li><strong>Art. 6(1)(f) GDPR</strong> — Legitimate interest (security, abuse prevention)</li>
</ul>

<h2>4. Third-Party Services</h2>
<p>This platform may share data with the following services:</p>
<ul>
<li><strong>Discord</strong> — For authentication and community integration (Discord Inc., USA)</li>
<li>[Add any additional services you use, e.g., analytics, email providers]</li>
</ul>

<h2>5. Cookies & Sessions</h2>
<p>This platform uses technically necessary cookies for session management. These do not require consent (TDDDG §25(2)(2)). No tracking cookies are used unless configured by the operator.</p>

<h2>6. Your Rights</h2>
<p>Under the GDPR, you have the right to:</p>
<ul>
<li>Access your personal data (Art. 15)</li>
<li>Rectify inaccurate data (Art. 16)</li>
<li>Request erasure of your data (Art. 17)</li>
<li>Restrict processing (Art. 18)</li>
<li>Data portability (Art. 20)</li>
<li>Object to processing (Art. 21)</li>
</ul>
<p>To exercise these rights, contact the data controller at the address above.</p>

<h2>7. Data Retention</h2>
<p>Your data is retained for as long as your account exists. When you leave the community or request deletion, your data will be removed within a reasonable timeframe.</p>

<h2>8. Contact</h2>
<p>For privacy-related questions, contact [Your Email].</p>`,
      de: `${DISCLAIMER_DE}
<h2>1. Verantwortlicher</h2>
<p>[Ihr Name]<br>[Ihre Adresse]<br>[Ihre E-Mail]</p>

<h2>2. Welche Daten wir erheben</h2>
<p>Bei der Nutzung dieser Community-Plattform können folgende Daten verarbeitet werden:</p>
<ul>
<li><strong>Discord-Kontodaten</strong> — Discord-Benutzer-ID, Benutzername, Avatar und E-Mail (über Discord OAuth)</li>
<li><strong>Mitgliederprofile</strong> — Anzeigename, Rollen, benutzerdefinierte Felder (je nach Konfiguration)</li>
<li><strong>Bewerbungsdaten</strong> — Antworten auf Bewerbungsformulare, hochgeladene Dateien</li>
<li><strong>Sitzungsdaten</strong> — Anmeldezeitpunkte, Session-Cookies</li>
<li><strong>Serverprotokolle</strong> — IP-Adresse, Browsertyp, Zugriffszeitpunkte (zu Sicherheitszwecken)</li>
</ul>

<h2>3. Rechtsgrundlage</h2>
<p>Wir verarbeiten Ihre Daten auf Grundlage von:</p>
<ul>
<li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> — Vertragserfüllung (Bereitstellung der Community-Plattform)</li>
<li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> — Einwilligung (sofern zutreffend, z.B. optionale Datenfelder)</li>
<li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> — Berechtigtes Interesse (Sicherheit, Missbrauchsprävention)</li>
</ul>

<h2>4. Drittanbieter</h2>
<p>Diese Plattform kann Daten mit folgenden Diensten teilen:</p>
<ul>
<li><strong>Discord</strong> — Für Authentifizierung und Community-Integration (Discord Inc., USA)</li>
<li>[Fügen Sie ggf. weitere Dienste hinzu, z.B. Analysedienste, E-Mail-Anbieter]</li>
</ul>

<h2>5. Cookies & Sitzungen</h2>
<p>Diese Plattform verwendet technisch notwendige Cookies für die Sitzungsverwaltung. Diese bedürfen keiner Einwilligung (TDDDG §25 Abs. 2 Nr. 2). Tracking-Cookies werden nur verwendet, wenn vom Betreiber konfiguriert.</p>

<h2>6. Ihre Rechte</h2>
<p>Nach der DSGVO haben Sie das Recht auf:</p>
<ul>
<li>Auskunft über Ihre gespeicherten Daten (Art. 15)</li>
<li>Berichtigung unrichtiger Daten (Art. 16)</li>
<li>Löschung Ihrer Daten (Art. 17)</li>
<li>Einschränkung der Verarbeitung (Art. 18)</li>
<li>Datenübertragbarkeit (Art. 20)</li>
<li>Widerspruch gegen die Verarbeitung (Art. 21)</li>
</ul>
<p>Um diese Rechte auszuüben, wenden Sie sich an den oben genannten Verantwortlichen.</p>

<h2>7. Datenspeicherung</h2>
<p>Ihre Daten werden gespeichert, solange Ihr Konto besteht. Wenn Sie die Community verlassen oder eine Löschung beantragen, werden Ihre Daten innerhalb einer angemessenen Frist entfernt.</p>

<h2>8. Kontakt</h2>
<p>Bei datenschutzrechtlichen Fragen wenden Sie sich an [Ihre E-Mail].</p>`,
    },
    sortOrder: 0,
    visible: true,
  },
  {
    slug: "terms",
    title: { en: "Terms of Service", de: "Nutzungsbedingungen" },
    content: {
      en: `${DISCLAIMER_EN}
<h2>1. Scope</h2>
<p>These Terms of Service govern your use of this community platform, operated by the person identified on the Imprint page.</p>

<h2>2. Account & Access</h2>
<p>Access requires authentication via Discord. By signing in, you agree to these Terms. You are responsible for maintaining the security of your account.</p>

<h2>3. Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
<li>Violate applicable laws or regulations</li>
<li>Harass, threaten, or abuse other members</li>
<li>Share malicious content or spam</li>
<li>Attempt to access data or systems without authorization</li>
<li>Impersonate other users or moderators</li>
</ul>

<h2>4. Content & Moderation</h2>
<p>Community administrators and moderators may remove content or restrict access at their discretion. Decisions are made to maintain a safe and productive community environment.</p>

<h2>5. Liability</h2>
<p>This platform is provided "as is" without warranties. The operator is not liable for damages arising from the use of this platform, except in cases of intent or gross negligence. Mandatory statutory liability provisions remain unaffected.</p>

<h2>6. Changes</h2>
<p>We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance.</p>

<h2>7. Governing Law</h2>
<p>These Terms are governed by the laws of [Your Country]. Mandatory consumer protection provisions of your country of residence remain unaffected.</p>`,
      de: `${DISCLAIMER_DE}
<h2>1. Geltungsbereich</h2>
<p>Diese Nutzungsbedingungen regeln die Nutzung dieser Community-Plattform, betrieben von der im Impressum genannten Person.</p>

<h2>2. Konto & Zugang</h2>
<p>Der Zugang erfordert eine Authentifizierung über Discord. Mit der Anmeldung erklären Sie sich mit diesen Nutzungsbedingungen einverstanden. Sie sind für die Sicherheit Ihres Kontos verantwortlich.</p>

<h2>3. Zulässige Nutzung</h2>
<p>Sie verpflichten sich, Folgendes zu unterlassen:</p>
<ul>
<li>Verstöße gegen geltende Gesetze oder Vorschriften</li>
<li>Belästigung, Bedrohung oder Missbrauch anderer Mitglieder</li>
<li>Verbreitung von Schadsoftware oder Spam</li>
<li>Unbefugter Zugriff auf Daten oder Systeme</li>
<li>Identitätsmissbrauch (Impersonation)</li>
</ul>

<h2>4. Inhalte & Moderation</h2>
<p>Community-Administratoren und Moderatoren können Inhalte entfernen oder den Zugang einschränken. Entscheidungen werden getroffen, um ein sicheres und produktives Community-Umfeld zu gewährleisten.</p>

<h2>5. Haftung</h2>
<p>Die Plattform wird ohne Garantien bereitgestellt. Der Betreiber haftet nicht für Schäden aus der Nutzung, es sei denn bei Vorsatz oder grober Fahrlässigkeit. Zwingende gesetzliche Haftungsbestimmungen bleiben unberührt.</p>

<h2>6. Änderungen</h2>
<p>Wir können diese Bedingungen jederzeit aktualisieren. Die fortgesetzte Nutzung nach Änderungen gilt als Zustimmung.</p>

<h2>7. Anwendbares Recht</h2>
<p>Es gilt das Recht von [Ihrem Land]. Zwingende Verbraucherschutzvorschriften Ihres Wohnsitzlandes bleiben unberührt.</p>`,
    },
    sortOrder: 1,
    visible: true,
  },
  {
    slug: "imprint",
    title: { en: "Imprint", de: "Impressum" },
    content: {
      en: `${DISCLAIMER_EN}
<h2>Responsible Person</h2>
<p>[Your Full Name]<br>[Your Street Address]<br>[Postal Code, City]<br>[Country]</p>

<h2>Contact</h2>
<p>Email: [your@email.com]<br>[Optional: Phone number]</p>

<h2>EU Online Dispute Resolution</h2>
<p>The European Commission provides a platform for online dispute resolution: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a></p>
<p>We are neither obligated nor willing to participate in dispute resolution proceedings before a consumer arbitration board.</p>

<h2>Liability for Content</h2>
<p>The contents of this website have been created with the utmost care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content.</p>

<h2>Liability for Links</h2>
<p>Our website may contain links to external third-party websites. We have no influence over their content and cannot accept liability for it.</p>`,
      de: `${DISCLAIMER_DE}
<h2>Verantwortliche Person</h2>
<p>[Ihr vollständiger Name]<br>[Ihre Straße und Hausnummer]<br>[PLZ, Stadt]<br>[Land]</p>

<h2>Kontakt</h2>
<p>E-Mail: [ihre@email.de]<br>[Optional: Telefonnummer]</p>

<h2>EU-Streitschlichtung</h2>
<p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a></p>
<p>Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

<h2>Haftung für Inhalte</h2>
<p>Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität können wir jedoch keine Gewähr übernehmen.</p>

<h2>Haftung für Links</h2>
<p>Unsere Website kann Links zu externen Webseiten Dritter enthalten. Auf deren Inhalte haben wir keinen Einfluss und übernehmen keine Haftung.</p>`,
    },
    sortOrder: 2,
    visible: true,
  },
];
