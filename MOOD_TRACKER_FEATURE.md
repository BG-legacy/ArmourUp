# Mood Tracker Feature

## Overview
The Mood Tracker feature allows users to log daily emotional and spiritual check-ins and view trends over time. This feature helps users reflect on their spiritual journey and emotional well-being.

## Features Implemented

### 1. Database Layer
- **Migration**: `000008_create_mood_entries.up.sql` and `000008_create_mood_entries.down.sql`
- **Table**: `mood_entries`
  - Tracks user ID, emotional state, spiritual state, energy level (1-10), gratitude, notes, and date
  - Unique constraint on user_id + date (one entry per day per user)
  - Soft delete support with deleted_at column
  - Indexed for optimal query performance

### 2. Backend (Go/Gin)
- **Domain Layer**: `/backend/internal/domain/mood/`
  - **Model** (`model.go`): Data structures for mood entries, requests, and trend statistics
  - **Repository** (`repository.go`): Database operations including:
    - Create, read, update, delete mood entries
    - Get today's entry
    - Get entries by date range
    - Get recent entries with limit
  - **Service** (`service.go`): Business logic including:
    - Entry validation
    - User ownership verification
    - Trend calculation (aggregates emotional/spiritual states and average energy levels)
    - Date range filtering
  - **Controller** (`controller.go`): HTTP handlers for all mood endpoints

- **Routes** (`/backend/internal/server/routes.go`):
  - `POST /api/mood` - Create a new mood entry
  - `GET /api/mood` - Get all mood entries for user
  - `GET /api/mood/today` - Get today's entry
  - `GET /api/mood/recent?limit=N` - Get N most recent entries
  - `GET /api/mood/range?start_date=X&end_date=Y` - Get entries in date range
  - `GET /api/mood/trends?days=N` - Get mood trends for N days
  - `GET /api/mood/:id` - Get specific mood entry
  - `PUT /api/mood/:id` - Update mood entry
  - `DELETE /api/mood/:id` - Delete mood entry

### 3. Frontend (Next.js/React)

#### API Routes (`/frontend/src/app/api/mood/`)
- `route.ts` - Handles GET (with query parameters) and POST requests
- `[id]/route.ts` - Handles GET, PUT, DELETE for specific entries

#### Pages

##### Mood Tracker Page (`/frontend/src/app/mood-tracker/page.tsx`)
Features:
- Daily check-in form with:
  - **Emotional State Selection**: 10 emoji-based options (joyful, peaceful, grateful, hopeful, content, anxious, sad, frustrated, overwhelmed, lonely)
  - **Spiritual State Selection**: 10 emoji-based options (connected, growing, inspired, peaceful, seeking, distant, doubting, struggling, dry, questioning)
  - **Energy Level Slider**: 1-10 scale with visual slider
  - **Gratitude Text Area**: Optional field to record what user is grateful for
  - **Notes Text Area**: Optional field for additional thoughts/reflections
- View today's entry (if already logged)
- Edit today's entry
- Animated background effects matching app theme
- Responsive design for mobile and desktop

##### Mood Trends Page (`/frontend/src/app/mood-trends/page.tsx`)
Features:
- **Time Period Selector**: View trends for 7, 14, 30, 60, or 90 days
- **Summary Statistics**:
  - Total entries in period
  - Average energy level
  - Date range
- **Emotional States Distribution**:
  - Top 5 emotional states with count and percentage
  - Visual progress bars
  - Emoji indicators
- **Spiritual States Distribution**:
  - Top 5 spiritual states with count and percentage
  - Visual progress bars
  - Emoji indicators
- **Recent Entries Timeline**:
  - Chronological list of recent mood entries
  - Shows date, emotional state, spiritual state, energy level
  - Displays gratitude if available
- Responsive grid layout
- Animated background effects

#### Navigation Updates
- **Dashboard** (`/frontend/src/app/dashboard/page.tsx`):
  - Added Mood Tracker card with description and navigation
- **Navbar** (`/frontend/src/components/Navbar.tsx`):
  - Added "MOOD" link to navigation bar

## Emotional States Available
1. 😊 Joyful
2. 😌 Peaceful
3. 🙏 Grateful
4. 🌟 Hopeful
5. 😊 Content
6. 😰 Anxious
7. 😢 Sad
8. 😤 Frustrated
9. 😵 Overwhelmed
10. 😔 Lonely

## Spiritual States Available
1. 🙏 Connected to God
2. 🌱 Growing in Faith
3. ✨ Inspired
4. ☮️ Spiritually Peaceful
5. 🔍 Seeking God
6. 🌫️ Distant from God
7. ❓ Doubting
8. ⚔️ Struggling
9. 🏜️ Spiritually Dry
10. 🤔 Questioning

## Technical Details

### Authentication
All mood tracker endpoints require authentication via JWT token (middleware: `AuthMiddleware()`).

### Data Validation
- Emotional state and spiritual state are required
- Energy level must be between 1-10 (enforced at both frontend and backend)
- Date format: YYYY-MM-DD
- One entry per user per day (enforced by database constraint)

### Trend Calculation
The trends endpoint calculates:
- Average energy level across all entries in the period
- Count and percentage of each emotional state
- Count and percentage of each spiritual state
- Total number of entries

### Error Handling
- 401 Unauthorized: User not authenticated
- 409 Conflict: Entry already exists for the date
- 403 Forbidden: User trying to modify another user's entry
- 404 Not Found: Entry or today's entry not found
- 500 Internal Server Error: Database or server errors

## User Experience Flow

1. **First Time User**:
   - Navigates to Mood Tracker from dashboard or navbar
   - Selects emotional and spiritual states
   - Adjusts energy level slider
   - Optionally adds gratitude and notes
   - Clicks "Save Entry"
   - Entry is saved and displayed

2. **Returning User (Same Day)**:
   - Navigates to Mood Tracker
   - Sees today's entry already logged
   - Can click "Edit Today's Entry" to modify
   - Changes are saved with "Update Entry" button

3. **Viewing Trends**:
   - Clicks "View Trends" button on mood tracker page
   - Selects time period (7, 14, 30, 60, or 90 days)
   - Views aggregated statistics and distributions
   - Scrolls through recent entries timeline
   - Can click "Log Mood" to return to tracker

## Database Migration

To apply the mood tracker migration:

```bash
cd backend
# Ensure your database is running
# The migration will be automatically applied on next server start
# Or run migrations manually with your migration tool
```

## API Testing

Example API calls:

```bash
# Create a mood entry
curl -X POST http://localhost:8080/api/mood \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emotional_state": "joyful",
    "spiritual_state": "connected",
    "energy_level": 8,
    "gratitude": "Thank you for this beautiful day",
    "notes": "Feeling great after morning prayer"
  }'

# Get today's entry
curl -X GET http://localhost:8080/api/mood/today \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get trends for last 30 days
curl -X GET http://localhost:8080/api/mood/trends?days=30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements (Potential)
- Export mood data as CSV/PDF
- Visual charts/graphs for trends (using Chart.js or similar)
- Mood reminders/notifications
- Compare periods (e.g., this month vs last month)
- Correlate mood with prayer activity
- Add custom emotional/spiritual states
- Weekly/monthly summary emails
- Integration with journal entries
- Mood-based encouragement suggestions

## Files Created/Modified

### Backend
- `backend/migrations/000008_create_mood_entries.up.sql`
- `backend/migrations/000008_create_mood_entries.down.sql`
- `backend/internal/domain/mood/model.go`
- `backend/internal/domain/mood/repository.go`
- `backend/internal/domain/mood/service.go`
- `backend/internal/domain/mood/controller.go`
- `backend/internal/server/routes.go` (modified)

### Frontend
- `frontend/src/app/api/mood/route.ts`
- `frontend/src/app/api/mood/[id]/route.ts`
- `frontend/src/app/mood-tracker/page.tsx`
- `frontend/src/app/mood-trends/page.tsx`
- `frontend/src/app/dashboard/page.tsx` (modified)
- `frontend/src/components/Navbar.tsx` (modified)

## Testing Checklist
- [ ] Create a new mood entry
- [ ] View today's entry
- [ ] Edit today's entry
- [ ] Try to create duplicate entry for same day (should fail)
- [ ] View mood trends for different time periods
- [ ] Navigate between mood tracker and trends pages
- [ ] Verify navigation links work from dashboard and navbar
- [ ] Test responsive design on mobile devices
- [ ] Verify authentication requirements
- [ ] Test all API endpoints with Postman/curl

---

*Feature completed on December 24, 2025*

