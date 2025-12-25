# ArmourUp - Quick Start Guide

## Getting Started with Gratitude Journal

### Prerequisites
- Backend server running on `http://localhost:8080`
- Frontend server running on `http://localhost:3000`
- PostgreSQL database configured and running
- Migrations applied (including the new gratitude_entries table)

## Running the Application

### 1. Start the Backend

```bash
cd backend

# Make sure your database is running
# Apply migrations if you haven't already
migrate -path migrations -database "postgresql://user:password@localhost:5432/armourup?sslmode=disable" up

# Start the server
go run main.go
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Register a new account or login
3. Navigate to the Dashboard
4. Click on "Gratitude Journal" card

## Using the Gratitude Journal

### Adding a Blessing

1. Click the "+ Add Blessing" button
2. Fill in the required fields:
   - **Title**: A short description (e.g., "Beautiful Sunrise", "Job Promotion")
   - **Blessing**: Detailed description of what you're grateful for
3. Optionally add:
   - **Category**: Choose from predefined categories
   - **Tags**: Add custom tags (comma-separated)
   - **Reflection**: Write how this blessing has impacted you
4. Click "Save Blessing"

### Viewing Entries

- All your gratitude entries are displayed as cards
- Each card shows:
  - Title and date
  - Category badge
  - Full blessing description
  - Reflection (if added)
  - Tags (if added)

### Filtering Entries

- Click on any category button at the top to filter entries
- Click "All" to see all entries
- Entries are sorted by date (newest first)

### Deleting Entries

- Click the trash icon on any entry card
- Confirm the deletion when prompted

## API Endpoints

### Gratitude Journal Endpoints

All endpoints require authentication (Bearer token in Authorization header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gratitude` | Create new gratitude entry |
| GET | `/api/gratitude` | Get all user's entries |
| GET | `/api/gratitude/:id` | Get specific entry |
| PUT | `/api/gratitude/:id` | Update entry |
| DELETE | `/api/gratitude/:id` | Delete entry |
| GET | `/api/gratitude/today` | Get today's entry |
| GET | `/api/gratitude/recent?limit=7` | Get recent entries |
| GET | `/api/gratitude/range?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Get entries in date range |
| GET | `/api/gratitude/category?category=CategoryName` | Filter by category |

### Example API Call

```bash
# Create a gratitude entry
curl -X POST http://localhost:8080/api/gratitude \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful Morning",
    "blessing": "Woke up to a beautiful sunrise and felt God'\''s presence",
    "category": "Nature & Beauty",
    "tags": "peace, beauty, morning",
    "reflection": "This reminded me of God'\''s faithfulness and constant presence"
  }'
```

## Database Schema

The gratitude_entries table includes:

```sql
CREATE TABLE gratitude_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    blessing TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT,
    reflection TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

## Troubleshooting

### Backend Issues

**Problem**: Server won't start
- Check if PostgreSQL is running
- Verify database credentials in `config/config.yaml`
- Ensure migrations are applied

**Problem**: 401 Unauthorized errors
- Make sure you're logged in
- Check if your access token is valid
- Try logging out and back in

### Frontend Issues

**Problem**: Page not loading
- Check if backend is running on port 8080
- Verify `NEXT_PUBLIC_BACKEND_URL` in your `.env.local`
- Check browser console for errors

**Problem**: Entries not showing
- Verify you're logged in
- Check network tab in browser dev tools
- Ensure backend is returning data

### Database Issues

**Problem**: Migration fails
- Check database connection
- Verify migration files are present
- Ensure you have proper permissions

**Problem**: Data not persisting
- Check database connection
- Verify user_id is being set correctly
- Check server logs for errors

## Environment Variables

### Backend (.env or config.yaml)

```yaml
server:
  port: 8080
  
database:
  host: localhost
  port: 5432
  user: your_db_user
  password: your_db_password
  dbname: armourup
  
jwt:
  secret: your_jwt_secret
  expiration: 24h
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## Testing the Feature

### Manual Testing Checklist

- [ ] Create a new gratitude entry
- [ ] View all entries
- [ ] Filter by each category
- [ ] Add tags to an entry
- [ ] Add a reflection
- [ ] Edit an existing entry
- [ ] Delete an entry
- [ ] Verify entries are user-specific (create another user and check)
- [ ] Test on mobile device/responsive view
- [ ] Test with empty states (no entries)

### Automated Testing

```bash
# Backend tests
cd backend
go test ./internal/domain/gratitude/...

# Frontend tests
cd frontend
npm run test
```

## Additional Resources

- [Full Feature Documentation](./GRATITUDE_JOURNAL_FEATURE.md)
- [Prayer Features Documentation](./PRAYER_FEATURES_SUMMARY.md)
- [Mood Tracker Documentation](./MOOD_TRACKER_FEATURE.md)
- [Setup Guide](./SETUP.md)

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the server logs in `backend/server.log`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

## Next Steps

After setting up the Gratitude Journal, explore other features:
- Try the **Mood Tracker** to track your emotional well-being
- Visit the **Prayer Wall** to share and pray for others
- Join a **Prayer Chain** to commit to praying for fellow believers
- Get **Daily Encouragement** for spiritual struggles

---

**Remember**: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." — 1 Thessalonians 5:18

