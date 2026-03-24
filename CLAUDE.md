# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a localization content repository containing XLIFF (XML Localization Interchange File Format) files for Okta training course materials. It is not a traditional software project with build tools or source code.

## File Format

The repository contains XLIFF 1.2 files with the following structure:
- Root `<xliff>` element with XML namespace declarations
- Multiple `<file>` elements, each representing a course section
- `<trans-unit>` elements containing `<source>` text for translation
- HTML-like content wrapped in `<g>` elements with `ctype` attributes (e.g., `x-html-P`, `x-html-STRONG`, `x-html-DIV`)

## Working with XLIFF Files

When editing XLIFF content:
- Preserve all `id` attributes exactly as they are (they link to the source system)
- Maintain the `<g>` element structure and `ctype` attributes for formatting
- Keep `xmlns:xhtml` namespace declarations intact
- The `source-language="en-us"` attribute indicates the source language

To add translations, add `<target>` elements alongside `<source>` elements within each `<trans-unit>`.

## Current Content

The XLIFF file contains the "OWI-101: Okta Workforce Identity - Exploring Okta" training course with sections for:
- Course introduction and agenda
- Key identity management terms (phishing, SaaS, authentication, authorization, MFA, SSO, API, IAM, PAM, governance, zero trust, IdP, IGA)
- Okta company overview
- Cybersecurity landscape information
- Knowledge check quiz questions
