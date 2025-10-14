# QR Code Generator & Tracker

A modern Next.js application for generating QR codes with tracking capabilities. This project retains the look, feel, and styling of the original QR generator while adding comprehensive tracking features.

## Features

### QR Generator Tab
- **Customizable QR Codes**: Generate QR codes with light/dark themes
- **URL Shortening**: Create trackable short URLs using nanoid
- **Export Options**: Download QR codes in PNG or SVG formats
- **Real-time Preview**: Live preview with gradient border styling
- **Responsive Design**: Works on desktop and mobile devices

### Tracking Dashboard Tab
- **QR Code Management**: View all generated QR codes in a table format
- **Scan Analytics**: Track the number of scans for each QR code
- **Status Control**: Pause or resume tracking for individual QR codes
- **Delete Functionality**: Remove QR codes permanently
- **Copy Short URLs**: Easy copying of shortened URLs

## Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Custom CSS (retaining original design)
- **Database**: SQLite with Prisma ORM
- **QR Generation**: qr-code-styling library
- **URL Shortening**: Custom implementation with nanoid
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd qr-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### QR Code Management
- `GET /api/qr-codes` - Fetch all QR codes
- `POST /api/qr-codes` - Create a new QR code
- `PATCH /api/qr-codes/[id]` - Update QR code status
- `DELETE /api/qr-codes/[id]` - Delete a QR code

### URL Shortening & Tracking
- `POST /api/shorten` - Generate a short URL
- `GET /api/r/[shortId]` - Redirect to original URL and track scan

## Database Schema

### QrCode Model
```prisma
model QrCode {
  id          String   @id @default(cuid())
  originalUrl String
  shortUrl    String   @unique
  qrData      String   // Base64 encoded QR code
  scanCount   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  scans       Scan[]
}
```

### Scan Model
```prisma
model Scan {
  id        String   @id @default(cuid())
  qrCodeId  String
  userAgent String?
  ipAddress String?
  timestamp DateTime @default(now())
  qrCode    QrCode   @relation(fields: [qrCodeId], references: [id])
}
```

## How It Works

1. **QR Generation**: Users enter a URL and generate a QR code with customizable styling
2. **Short URL Creation**: The system creates a trackable short URL using nanoid
3. **Database Storage**: QR code data and metadata are stored in SQLite
4. **Scan Tracking**: When someone scans the QR code, they're redirected through the short URL
5. **Analytics**: Each scan is recorded with timestamp, user agent, and IP address
6. **Management**: Users can view, pause, resume, or delete QR codes from the dashboard

## Styling

The application maintains the original design aesthetic with:
- Dark theme with gradient borders
- Custom color palette matching the original
- Responsive design for mobile and desktop
- Smooth transitions and hover effects
- Accessible UI components

## Deployment

The application is ready for deployment on Vercel, Netlify, or any other platform that supports Next.js:

1. Build the application:
```bash
npm run build
```

2. For production, update the database URL in your environment variables
3. Run database migrations:
```bash
npx prisma migrate deploy
```

## Future Enhancements

- Integration with Vercel KV for better short URL management
- Advanced analytics with charts and graphs
- Bulk QR code operations
- Custom branding options
- API rate limiting
- User authentication and multi-tenant support

## License

This project is open source and available under the MIT License.