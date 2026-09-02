# PSY LOOPER - PWA Documentation

## Overview

PSY LOOPER is a Progressive Web App (PWA) with offline-first architecture.

## Features

### Installable

PSY LOOPER can be installed as a native-like app:

- Desktop: Chrome, Edge, Firefox
- Mobile: iOS Safari, Android Chrome
- Install prompt appears automatically

### Offline-First

Service worker caches all assets:

- HTML/CSS/JS files
- Audio worklets
- Factory samples

### Network-First Strategy

When online, fetches latest version:

- Always up-to-date when online
- Falls back to cache when offline
- No stale content

## Service Worker

The service worker (src/sw.js) handles:

- Install event: Cache assets
- Activate event: Clean up old caches
- Fetch event: Network-first strategy

## Cache Strategy

Cache name: psy-looper-v1

Cached assets:
- /
- /index.html
- /css/looper.css
- All src/*.js files
- All worklets/*.js files

## App Manifest

The app manifest defines:

- name: PSY LOOPER
- short_name: PSY Looper
- display: standalone
- theme_color: #0a0a0f
- background_color: #0a0a0f
- icons: Various sizes

## Installation

### Desktop

1. Open PSY LOOPER in Chrome/Edge
2. Click the install icon in the address bar
3. Click 'Install'

### Mobile

1. Open PSY LOOPER in mobile browser
2. Tap 'Add to Home Screen'
3. Confirm installation

## Benefits

- Works offline
- Fast loading (cached assets)
- Native-like experience
- No app store required
- Automatic updates

## License

MIT
