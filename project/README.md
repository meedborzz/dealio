# Dealio Beauty - Beauty Booking Platform

A modern beauty booking platform built with React, TypeScript, and Supabase. Allows clients to discover and book beauty services while providing businesses with comprehensive management tools.

## 🚀 Features

### For Clients
- **Discover Services**: Browse beauty services with location-based filtering
- **Easy Booking**: Book appointments with real-time availability
- **QR Code System**: Secure booking validation with QR codes
- **Favorites & Reviews**: Save favorite services and leave reviews
- **Loyalty Program**: Earn points and unlock rewards

### For Business Owners
- **Dashboard**: Comprehensive business management interface
- **Booking Management**: Handle online and offline reservations
- **QR Scanner**: Validate client bookings with QR code scanning
- **Analytics**: Track performance, revenue, and customer insights
- **Staff Management**: Organize team and schedules

### For Administrators
- **Platform Overview**: Monitor entire platform performance
- **Business Moderation**: Approve/reject business applications
- **User Management**: Oversee client accounts and activity
- **Content Moderation**: Manage deals and offers
- **Advanced Analytics**: Platform-wide statistics and insights

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **PWA**: Service Worker with offline support

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Modern web browser with camera support (for QR scanning)

## ⚙️ Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd dealio-beauty
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these values in your Supabase Dashboard:
- Go to https://supabase.com/dashboard
- Select your project
- Go to Settings → API
- Copy the Project URL and keys

## 🗄️ Database Setup

### 1. Run Migrations
The database schema is managed through SQL migration files in `supabase/migrations/`. 

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

**Option B: Manual Migration**
```bash
# Apply migrations manually
node scripts/apply-migrations.js
```

### 2. Seed Sample Data
```bash
# Create admin user and sample data
node scripts/create-sample-offers.js
```

## 👥 User Roles & Demo Accounts

### Admin Access
- **Role**: `admin`
- **Access**: Full platform management
- **Demo**: Create admin user via migration

### Business Owner Access
- **Role**: `business_owner`
- **Access**: Business dashboard, booking management
- **Demo**: Register as business owner

### Client Access
- **Role**: `client`
- **Access**: Browse and book services
- **Demo**: Register as regular client

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Install Prompt**: Add to home screen functionality
- **Push Notifications**: Real-time booking updates
- **Background Sync**: Sync data when connection restored

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure user sessions
- **QR Code Validation**: Secure booking verification
- **Input Sanitization**: XSS protection
- **CORS Configuration**: Secure API access

## 📊 Database Schema

### Core Tables
- `user_profiles`: User information and roles
- `businesses`: Business listings and details
- `deals`: Service offerings and promotions
- `bookings`: Reservation records
- `time_slots`: Available booking times
- `qr_codes`: Booking validation codes

### Supporting Tables
- `reviews`: Customer feedback
- `favorites`: Saved deals
- `conversations` & `messages`: In-app messaging
- `notifications`: System notifications
- `commission_logs`: Financial tracking

## 🔧 Configuration

### Supabase Setup
1. **Authentication**: Email/password enabled
2. **RLS Policies**: Configured for all tables
3. **Edge Functions**: QR validation and notifications
4. **Storage**: Image uploads (if needed)

### Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only)

## 📈 Analytics & Monitoring

- **Real-time Metrics**: Live booking and revenue tracking
- **Growth Analytics**: Period-over-period comparisons
- **User Behavior**: Interaction tracking and insights
- **Performance Monitoring**: System health and uptime

## 🚀 Deployment

### Bolt Hosting (Current)
The application is deployed on Bolt Hosting with automatic builds.

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to your preferred hosting service
# (Netlify, Vercel, etc.)
```

## 🧪 Testing

### Demo Data
Use the sample data creation script to populate your database:
```bash
node scripts/create-sample-offers.js
```

### Test Scenarios
1. **Client Flow**: Browse → Book → Receive QR → Visit salon
2. **Business Flow**: Manage bookings → Scan QR → Validate service
3. **Admin Flow**: Moderate businesses → Monitor platform

## 🔍 Troubleshooting

### Common Issues

**Database Connection**
- Verify environment variables are correct
- Check Supabase project status
- Ensure RLS policies are properly configured

**QR Scanner Not Working**
- Ensure HTTPS connection (required for camera access)
- Check browser permissions for camera
- Verify QR code format and validation logic

**Authentication Issues**
- Check Supabase auth configuration
- Verify user roles are properly set
- Ensure RLS policies allow proper access

## 📚 API Documentation

### Edge Functions
- `validate-qr`: Secure QR code validation
- `send-push-notification`: Push notification delivery

### Database Functions
- `update_business_rating()`: Automatic rating calculation
- `generate_qr_code_for_booking()`: QR code generation trigger

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review Supabase documentation
- Contact the development team

---

**Built with ❤️ for the beauty industry in Morocco**