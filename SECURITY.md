# Security Policy

## Supported Versions

Currently, only the `main` branch is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please DO NOT open a public issue. Instead, please email the maintainers directly. 

We take all security vulnerabilities seriously and will aim to resolve them within 48 hours.

## Removing accidentally committed secrets

If you accidentally commit a secret (like an API key or `.env` file) into the Git history, you should **immediately rotate/revoke that secret** in the respective provider dashboard.

To scrub the secret from your local and remote Git history, follow GitHub's official instructions using `git filter-repo` or the BFG Repo-Cleaner:

### Using BFG Repo-Cleaner
```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Run BFG to delete a sensitive file (e.g., .env)
java -jar bfg-1.14.0.jar --delete-files .env

# Strip the removed data and force push
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```

**Warning**: Rewriting git history is destructive. Make sure your team is aware before force pushing.
