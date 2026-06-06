# Compatibility Matrix

## Python

Recommended:

- Python `3.11`
- Python `3.12`

Supported for local development:

- Python `3.9+`

Python `3.9` may show third-party end-of-life warnings from Google client
libraries and SSL stack warnings on older macOS system Python builds. Production
deployments should use Python `3.11` or newer.

## Operating Systems

Supported:

- macOS
- Linux

Windows is expected to work for non-vision SDK and backend API usage, but full
browser/desktop execution requires dedicated verification.

## Optional Dependency Groups

- Base SDK: `pip install -e .`
- Backend API: `pip install -e ".[api]"`
- Vision/runtime helpers: `pip install -e ".[vision]"`
- AI provider helpers: `pip install -e ".[ai]"`
- Tests: `pip install -e ".[dev]"`

## Browser Runtime

Desktop/browser execution expects Chrome to be installed and available through
`BOL_CHROME_BINARY` or the platform default path.
