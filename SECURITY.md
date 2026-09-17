# Security Policy

## Supported versions

Security fixes are applied to the latest code on the `main` branch.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, email [rokib16x@gmail.com](mailto:rokib16x@gmail.com) with:

- A short description of the issue
- Steps to reproduce (or a proof of concept)
- Impact assessment if you have one
- Your preferred contact method for follow-up

You can expect an initial response within a few days. If the report is confirmed, we will work on a fix and credit you if you want attribution.

## Scope notes

WebPify converts images in the browser. Avoid submitting secrets in issues or PRs. The optional conversion counter uses Upstash Redis credentials — treat those as sensitive and never commit them.
