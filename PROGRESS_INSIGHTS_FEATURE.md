# Progress Insights Feature

## Overview
The Progress Insights feature provides AI-generated monthly summaries of spiritual growth, analyzing user data from mood tracking, journal entries, gratitude entries, and prayer activities to create meaningful insights.

## Features

### 1. **AI-Powered Monthly Summaries**
- Comprehensive analysis of spiritual journey for each month
- Personalized insights based on user's actual data
- Biblical encouragement and relevant scripture

### 2. **Data Sources Analyzed**
- **Mood Entries**: Emotional and spiritual states, energy levels
- **Journal Entries**: Personal reflections and thoughts
- **Gratitude Entries**: Count of blessings recorded
- **Prayer Activities**: Prayers offered for others and answered prayers

### 3. **Insight Components**
Each monthly insight includes:
- **Summary**: 2-3 paragraph overview of spiritual journey
- **Highlights**: 3-5 specific positive moments or breakthroughs
- **Areas for Growth**: 2-3 gentle, encouraging suggestions
- **Scripture**: Relevant Bible verse for the journey
- **Stats**: Quantitative metrics (average energy, mood patterns)

## Backend Implementation

### Database Schema
```sql
CREATE TABLE progress_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    summary TEXT NOT NULL,
    highlights TEXT,
    areas TEXT,
    verse TEXT,
    mood_stats TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(user_id, period)
);
```

### API Endpoints

#### Generate Insight
```
POST /api/insights/generate
Authorization: Bearer {token}
Body: { "period": "2024-12" }
```

#### Get All User Insights
```
GET /api/insights
Authorization: Bearer {token}
```

#### Get Insight for Period
```
GET /api/insights/period?period=2024-12
Authorization: Bearer {token}
```

#### Get Available Periods
```
GET /api/insights/periods
Authorization: Bearer {token}
```

#### Get Specific Insight
```
GET /api/insights/:id
Authorization: Bearer {token}
```

### Backend Architecture

**Domain Structure** (`backend/internal/domain/insights/`)
- `model.go`: Data structures and types
- `repository.go`: Database operations
- `service.go`: Business logic and AI integration
- `controller.go`: HTTP handlers

**Key Components:**
1. **Repository Layer**: Aggregates data from multiple tables (mood_entries, journals, gratitude_entries, prayer_requests, etc.)
2. **Service Layer**: Orchestrates data gathering and AI prompt generation
3. **AI Integration**: Uses OpenAI GPT-4 for generating insights
4. **Caching**: Stores generated insights to avoid regeneration

### AI Prompt Engineering
The service builds comprehensive prompts including:
- Mood statistics and patterns
- Journal entry excerpts
- Gratitude count
- Prayer activity metrics
- Emotional and spiritual state frequencies

## Frontend Implementation

### Pages
- **`/progress-insights`**: Main insights page with month selector and insight display

### Components
- **Period Selector**: Grid of last 12 months with visual indicators for generated insights
- **Insight Display**: Beautiful cards showing summary, highlights, growth areas, and scripture
- **Generate Button**: Triggers AI insight generation for selected month
- **Loading States**: Smooth loading indicators during generation

### User Experience
1. User selects a month from the grid
2. If insight exists, it's displayed immediately
3. If not, user can generate a new insight
4. Generation takes 10-30 seconds (AI processing)
5. Insights are cached for future viewing
6. User can regenerate insights if desired

### Styling
- Gradient backgrounds (purple to blue to indigo)
- Glassmorphism cards with backdrop blur
- Color-coded sections:
  - Green gradient for highlights
  - Blue gradient for growth areas
  - Yellow gradient for scripture
- Responsive design for all screen sizes

## Usage Instructions

### For Users

1. **Access the Feature**
   - Navigate to Dashboard and click "Progress Insights"
   - Or use the "INSIGHTS" link in the navigation bar

2. **Generate Your First Insight**
   - Select the current month or any previous month
   - Click "Generate Insight" button
   - Wait 10-30 seconds for AI processing
   - Review your personalized spiritual growth summary

3. **View Past Insights**
   - Select any month with a "✓ Generated" indicator
   - Insights load instantly from cache
   - Compare different months to see growth over time

4. **Regenerate Insights**
   - Click "Regenerate Insight" at the bottom
   - Useful if you've added more data since last generation
   - Creates a fresh analysis with updated information

### For Developers

1. **Run Database Migration**
   ```bash
   cd backend
   migrate -path migrations -database "postgresql://user:pass@localhost:5432/armourup?sslmode=disable" up
   ```

2. **Configure OpenAI API Key**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   go run main.go
   ```

4. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access Feature**
   - Open http://localhost:3000
   - Login to your account
   - Navigate to Progress Insights

## Technical Details

### Rate Limiting
- Insights endpoints are rate-limited to 5 requests per minute
- Prevents excessive API usage and costs
- Encourages thoughtful use of the feature

### AI Model
- Uses OpenAI GPT-4 for highest quality insights
- Temperature: 0.7 (balanced creativity and consistency)
- System prompt establishes Christian spiritual advisor persona
- Structured JSON output for reliable parsing

### Data Privacy
- All insights are private to the user
- No data sharing between users
- Insights stored securely in database
- Can be deleted by deleting the user account

### Performance Optimizations
- Insights are cached after generation
- Database queries use indexes on user_id and period
- Aggregation queries optimized with proper joins
- Frontend uses loading states for better UX

## Error Handling

### Backend
- Validates period format (YYYY-MM)
- Checks for sufficient data before generation
- Handles OpenAI API failures gracefully
- Returns meaningful error messages

### Frontend
- Displays error messages in user-friendly format
- Handles network failures
- Provides retry mechanisms
- Shows loading states during operations

## Future Enhancements

### Potential Features
1. **Comparison View**: Compare multiple months side-by-side
2. **Year-End Summary**: Annual spiritual growth report
3. **Export Options**: PDF or email delivery of insights
4. **Goal Setting**: Set spiritual goals based on insights
5. **Sharing**: Optional sharing with accountability partners
6. **Notifications**: Monthly reminders to generate insights
7. **Trends Graph**: Visual representation of growth metrics
8. **Custom Periods**: Weekly or quarterly insights

### Technical Improvements
1. **Background Generation**: Queue-based insight generation
2. **Incremental Updates**: Update insights as new data arrives
3. **Multi-language Support**: Insights in different languages
4. **Voice Narration**: Audio version of insights
5. **Mobile App**: Native mobile experience

## Testing

### Manual Testing Checklist
- [ ] Generate insight for current month
- [ ] Generate insight for previous month
- [ ] View cached insight
- [ ] Regenerate existing insight
- [ ] Test with no data for a period
- [ ] Test with partial data
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Test on mobile devices
- [ ] Test navigation links

### Data Requirements
For meaningful insights, users should have:
- At least 5 mood entries in the month
- At least 2 journal entries
- Some prayer or gratitude activity

## Troubleshooting

### "Failed to generate insight"
- Check OpenAI API key is configured
- Verify sufficient data exists for the period
- Check rate limiting hasn't been exceeded
- Review server logs for specific errors

### Insights not loading
- Check authentication token is valid
- Verify database connection
- Check network connectivity
- Clear browser cache and retry

### Slow generation
- Normal for first-time generation (10-30 seconds)
- GPT-4 processing takes time
- Check OpenAI API status
- Consider upgrading OpenAI plan for faster responses

## Cost Considerations

### OpenAI API Costs
- GPT-4 costs approximately $0.03-0.06 per insight
- Monthly cost per active user: ~$0.50-1.00
- Consider implementing:
  - Monthly generation limits per user
  - Premium tier for unlimited insights
  - Batch processing during off-peak hours

### Database Storage
- Each insight: ~2-5 KB
- 1000 users × 12 months = ~24-60 MB/year
- Minimal storage requirements
- Consider archiving old insights after 2 years

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own insights
3. **Rate Limiting**: Prevents abuse and excessive costs
4. **Input Validation**: Period format strictly validated
5. **SQL Injection**: Using parameterized queries
6. **XSS Protection**: Content properly escaped in frontend

## Conclusion

The Progress Insights feature provides meaningful, personalized spiritual growth summaries using AI technology. It helps users reflect on their journey, celebrate victories, and identify areas for continued growth, all grounded in biblical encouragement.

For questions or issues, please refer to the main project documentation or contact the development team.

