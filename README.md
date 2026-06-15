# My Closet (Zhannacloset)

A personal digital wardrobe organizer with outfit visualization. Photograph clothing items, organize them by category, and combine them into outfit looks layered over a personal mannequin photo.

## Stack

- **Client**: React + Vite + TailwindCSS
- **Server**: Node.js + Express
- **Storage**: Local filesystem (`uploads/`) with `db.json` as the database
- **Image processing**: Sharp (300px JPEG thumbnails)

Single-user, runs entirely on your machine. No auth, no cloud.

## Setup

```bash
npm run install:all   # installs root, server, and client deps
npm run dev           # runs both: server :3001, client :5173
```

Then open http://localhost:5173.

## Project layout

```
server/        Express API + JSON file DB
client/        Vite + React UI
uploads/       Item images, thumbnails, mannequin photo
db.json        Persistent state
```

## Features

- Capture clothing via webcam or upload from disk
- 9 categories (Tops, Bottoms, Dresses, Shoes, Bags, Hats, Sunglasses, Outerwear, Activewear)
- Outfit Builder with stacked layered preview over mannequin photo
- Drag-to-reorder selected items in the look
- Save and revisit outfits
- Replaceable personal mannequin photo (or default silhouette)

## API

| Method | Path | Notes |
|---|---|---|
| GET / POST | `/api/mannequin` | Get / set the user's mannequin photo |
| GET / POST | `/api/items` | List (optional `?category=`) / upload |
| DELETE | `/api/items/:id` | Cascade-removes from outfits |
| GET / POST | `/api/outfits` | List / save |
| PUT / DELETE | `/api/outfits/:id` | Update / delete |
| GET | `/uploads/*` | Static image hosting |
