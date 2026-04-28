# API TOKO JAYA PUTRA

## Tech Stack

**Server:** Node, Express, MySql

**Requirement:** Node v22, Git Bash

## Installation

Install with npm

```bash
  npm install
  npm run build
  pm2 start npm --name "api-toko" -- start
```

## Lessons Learned

Print thermal menggunakan TCPL driver XPrinter,

enable TCPL di windows 10

- Control Panel -> Programs and Features -> Turn Windows features on or off
- Cari Print and Document Services
- Centang semua LDP dan LPR

enable sharing printer

- Buka Printer & scanners
- Cari nama printer ex: "Xprinter XP-420B"
- Klik Manage -> Printer properties -> Tab Sharing -> Centang Share this Prnter
