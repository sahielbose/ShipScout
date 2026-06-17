# Security and privacy

## Reporting a vulnerability

Please report security issues privately by opening a security advisory at
https://github.com/sahielbose/ShipScout/security/advisories/new, or by opening a
minimal issue that does not disclose exploit details and asking a maintainer to
follow up. Do not post exploit details publicly until a fix is available.

## Secrets

ShipScout reads all credentials from environment variables (see `.env.example`).
There are no hardcoded secrets. Never commit a real key. `.env.local` is git
ignored.

## Privacy and data

- ShipScout uses only public GitHub data. It does not access or store private
  repository data.
- Capability profiles are derived from public open-source activity. Seniority
  and capability are presented as derived signals, not verdicts.
- ShipScout does not compile or expose contact details that are not already
  public, and it is not a directory of personal contact information.

## Delisting (removal path)

Any developer can request removal of their derived profile. When a database is
configured, a maintainer can delist a profile and remove its ingested data:

```bash
curl -X POST https://YOUR_DEPLOYMENT/api/developers/<login>/remove \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

This deletes the developer record and cascades to their repos, contributions,
capabilities, and profile. To request removal, open an issue or contact a
maintainer; requests are honored promptly.

## Outreach

Outreach is draft-only by default (copy, or open in your email client). Sending
through a provider is gated behind an explicit confirm step and is never
automatic.
