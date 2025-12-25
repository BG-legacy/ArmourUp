# Gratitude Journal Feature

## Overview
The Gratitude Journal is a dedicated section for users to record and reflect on their daily blessings. This feature encourages a practice of thanksgiving and helps users recognize God's faithfulness in their lives.

## Biblical Foundation
> "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." — 1 Thessalonians 5:18

## Features

### 1. Daily Blessing Entries
- **Title**: A short, descriptive title for the blessing
- **Blessing Description**: Detailed description of what the user is grateful for
- **Category**: Organized categories for easy filtering
- **Tags**: Custom tags for personalized organization
- **Reflection**: Optional deeper reflection on how the blessing has impacted their life or faith

### 2. Categories
The following pre-defined categories help users organize their blessings:
- Family & Friends
- Health & Wellness
- Spiritual Growth
- Provision & Finances
- Opportunities
- Nature & Beauty
- Personal Growth
- Answered Prayers
- Other

### 3. Filtering & Organization
- Filter entries by category
- View all entries chronologically
- Search by tags
- Easy-to-read card layout

### 4. User Interface
- Beautiful, modern design consistent with ArmourUp's theme
- Animated background with floating particles and gradient orbs
- Responsive layout for mobile and desktop
- Easy-to-use form for adding new entries
- Quick delete functionality

## Technical Implementation

### Backend (Go)

#### Database Schema
```sql
CREATE TABLE gratitude_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    blessing TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT,
    reflection TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### API Endpoints

**Base URL**: `/api/gratitude`

1. **POST /api/gratitude**
   - Create a new gratitude entry
   - Requires authentication
   - Body: `{ title, blessing, category?, tags?, reflection? }`

2. **GET /api/gratitude**
   - Get all gratitude entries for the authenticated user
   - Returns entries sorted by creation date (newest first)

3. **GET /api/gratitude/:id**
   - Get a specific gratitude entry by ID

4. **PUT /api/gratitude/:id**
   - Update an existing gratitude entry
   - Body: `{ title, blessing, category?, tags?, reflection? }`

5. **DELETE /api/gratitude/:id**
   - Soft delete a gratitude entry

6. **GET /api/gratitude/today**
   - Get today's gratitude entry (if exists)

7. **GET /api/gratitude/recent?limit=7**
   - Get recent gratitude entries (default: 7)

8. **GET /api/gratitude/range?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD**
   - Get entries within a date range

9. **GET /api/gratitude/category?category=CategoryName**
   - Get entries filtered by category

#### File Structure
```
backend/
├── internal/
│   └── domain/
│       └── gratitude/
│           ├── model.go          # GratitudeEntry struct
│           ├── repository.go     # Database operations
│           ├── service.go        # Business logic
│           └── controller.go     # HTTP handlers
├── migrations/
│   ├── 000009_create_gratitude_entries.up.sql
│   └── 000009_create_gratitude_entries.down.sql
```

### Frontend (Next.js/React)

#### Pages
- `/gratitude-journal` - Main gratitude journal page

#### API Routes (Next.js)
```
frontend/src/app/api/gratitude/
├── route.ts              # GET all, POST new entry
├── [id]/
│   └── route.ts          # GET, PUT, DELETE specific entry
└── recent/
    └── route.ts          # GET recent entries
```

#### Key Components
1. **Entry Form**
   - Title input (required)
   - Blessing textarea (required)
   - Category dropdown
   - Tags input
   - Reflection textarea (optional)

2. **Entry Cards**
   - Display title, date, category
   - Show blessing and reflection
   - Display tags as chips
   - Delete button

3. **Category Filter**
   - Filter buttons for each category
   - "All" option to show everything

#### File Structure
```
frontend/src/app/
├── gratitude-journal/
│   └── page.tsx          # Main gratitude journal page
└── api/
    └── gratitude/
        ├── route.ts      # Main CRUD operations
        ├── [id]/
        │   └── route.ts  # Individual entry operations
        └── recent/
            └── route.ts  # Recent entries
```

## User Flow

1. **Access**: User navigates to Gratitude Journal from the dashboard
2. **View Entries**: User sees all their gratitude entries in a card layout
3. **Filter**: User can filter by category to focus on specific types of blessings
4. **Add Entry**: 
   - Click "+ Add Blessing" button
   - Fill out the form with title and blessing (required)
   - Optionally add category, tags, and reflection
   - Click "Save Blessing"
5. **View Details**: Each entry card shows the full blessing, reflection, and tags
6. **Delete**: User can delete entries they no longer want to keep

## Benefits

1. **Spiritual Growth**: Encourages a daily practice of gratitude
2. **Faith Building**: Helps users see God's faithfulness over time
3. **Mental Health**: Gratitude practices are proven to improve mental well-being
4. **Historical Record**: Creates a personal testimony of God's blessings
5. **Reflection**: Provides space for deeper spiritual reflection

## Future Enhancements

Potential future features:
- Export gratitude entries to PDF
- Share specific blessings with prayer chains
- Gratitude reminders/notifications
- Statistics and insights (e.g., most common categories)
- Integration with mood tracker to see correlation
- Search functionality
- Yearly/monthly gratitude summaries
- Gratitude challenges (e.g., "30 days of gratitude")

## Testing

To test the Gratitude Journal feature:

1. **Backend Testing**:
   ```bash
   cd backend
   go test ./internal/domain/gratitude/...
   ```

2. **Manual Testing**:
   - Create a new gratitude entry
   - View all entries
   - Filter by different categories
   - Edit an existing entry
   - Delete an entry
   - Test with multiple users to ensure data isolation

3. **API Testing** (using curl or Postman):
   ```bash
   # Create entry
   curl -X POST http://localhost:8080/api/gratitude \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Blessing","blessing":"This is a test"}'
   
   # Get all entries
   curl http://localhost:8080/api/gratitude \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Migration

To apply the database migration:

```bash
cd backend
migrate -path migrations -database "postgresql://user:password@localhost:5432/armourup?sslmode=disable" up
```

## Security

- All endpoints require authentication
- Users can only access their own gratitude entries
- Input validation on all fields
- SQL injection protection via GORM
- XSS protection via React's built-in escaping

## Performance Considerations

- Entries are indexed by user_id for fast retrieval
- Soft deletes allow for potential recovery
- Pagination can be added for users with many entries
- Category filtering is optimized with database indexes

## Accessibility

- Semantic HTML structure
- Proper form labels
- Keyboard navigation support
- Screen reader friendly
- High contrast text for readability

## Mobile Responsiveness

- Fully responsive design
- Touch-friendly buttons and forms
- Optimized layout for small screens
- Smooth animations that work on mobile

## Integration with ArmourUp

The Gratitude Journal integrates seamlessly with other ArmourUp features:
- Accessible from the main dashboard
- Consistent design language
- Shares authentication system
- Can reference answered prayers
- Complements mood tracking for holistic well-being

## Conclusion

The Gratitude Journal provides users with a dedicated space to practice thanksgiving and recognize God's blessings in their daily lives. By recording and reflecting on these moments, users build a personal testimony of faith and develop a habit of gratitude that strengthens their spiritual walk.

