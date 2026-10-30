# SnakeCharmers — Warehouse Dashboard

A React and TypeScript frontend for a warehouse slotting and inventory optimization dashboard.

## Features

- Interactive dashboard interface
- Warehouse visualization and inventory views
- Navigation between dashboard modules
- Guide page with improved documentation presentation
- API integration configured through an environment variable

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Lucide React
- Plotly

## Getting Started

### Requirements

- Node.js and npm

### Installation

```bash
npm install
```

### Configure the API

Create a `.env` file in the project root if you want to connect the frontend to a backend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Set this value to the URL of your actual API. Some dashboard features may require a compatible backend.

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Notes

This repository contains the frontend application. A compatible backend may be required for API-dependent features.