# Prayer Tracking and Answers - Testing Guide

## New Features Implemented

### 1. Prayer Tracking
- Track **WHO** prayed for each request (not just a count)
- Prevent duplicate prayers from the same user
- View all prayers you've prayed for

### 2. Prayer Answers
- Mark prayer requests as answered
- Add testimony when prayers are answered
- View all answered prayers to build faith

## Database Changes

The following migration was created: `000007_add_prayer_tracking_and_answers.up.sql`

### New Fields in `prayer_requests`:
- `status` - 'pending', 'answered', or 'closed'
- `answered_at` - Timestamp when prayer was answered
- `answer_testimony` - Testimony of how God answered

### New Table `prayer_logs`:
- Tracks each individual prayer
- Links user to prayer request
- Prevents duplicate prayers with unique constraint
- Records timestamp of prayer

## API Endpoints

### 1. Pray for a Request (Enhanced)
```http
POST /api/prayer/:id/pray
Authorization: Bearer <token>
```
**Response:** Updates prayer count and creates prayer log

**Status Codes:**
- `200 OK` - Successfully prayed
- `409 Conflict` - Already prayed for this request
- `401 Unauthorized` - Not authenticated

---

### 2. Get My Prayers (NEW)
```http
GET /api/prayer/my-prayers
Authorization: Bearer <token>
```
**Response:** List of all prayers you've prayed for with prayer request details

---

### 3. Mark Prayer as Answered (NEW)
```http
POST /api/prayer/:id/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "testimony": "God answered! My test results came back negative. Praise the Lord!"
}
```
**Response:** Updated prayer request with answered status

**Status Codes:**
- `200 OK` - Successfully marked as answered
- `403 Forbidden` - Can only mark your own prayers
- `409 Conflict` - Already marked as answered
- `401 Unauthorized` - Not authenticated

---

### 4. Get Answered Prayers (NEW)
```http
GET /api/prayer/answered
Authorization: Bearer <token>
```
**Response:** List of all answered prayers with testimonies

---

## Manual Testing Steps

### Prerequisites
1. Ensure PostgreSQL is running (via Docker or local)
2. Run migrations to apply new schema
3. Start the backend server

### Step 1: Start the Server
```bash
cd backend
# Make sure PostgreSQL is running
docker-compose up -d postgres

# Run migrations if needed
# (The server auto-migrates on startup if configured)

# Start server
go run main.go
```

### Step 2: Register Two Test Users
```bash
# User 1
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "user1@test.com",
    "password": "password123"
  }'

# User 2
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "user2@test.com",
    "password": "password123"
  }'
```

Save the tokens from the responses.

### Step 3: Create a Prayer Request (User 1)
```bash
# Replace <USER1_TOKEN> with actual token
curl -X POST http://localhost:8080/api/prayer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER1_TOKEN>" \
  -d '{
    "request": "Please pray for my family'\''s health",
    "is_anonymous": false
  }'
```

Save the prayer request ID from the response.

### Step 4: User 2 Prays for the Request
```bash
# Replace <USER2_TOKEN> and <PRAYER_ID>
curl -X POST http://localhost:8080/api/prayer/<PRAYER_ID>/pray \
  -H "Authorization: Bearer <USER2_TOKEN>"
```

**Expected:** Should see prayer_count increment to 1

### Step 5: User 2 Tries to Pray Again
```bash
# Try to pray again with same user
curl -X POST http://localhost:8080/api/prayer/<PRAYER_ID>/pray \
  -H "Authorization: Bearer <USER2_TOKEN>"
```

**Expected:** Should get a 409 Conflict error: "you have already prayed for this request"

### Step 6: User 2 Views Their Prayers
```bash
curl -X GET http://localhost:8080/api/prayer/my-prayers \
  -H "Authorization: Bearer <USER2_TOKEN>"
```

**Expected:** Should see a list including the prayer they just prayed for

### Step 7: User 1 Marks Prayer as Answered
```bash
curl -X POST http://localhost:8080/api/prayer/<PRAYER_ID>/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER1_TOKEN>" \
  -d '{
    "testimony": "God answered! My family is healthy and blessed. Thank you Jesus!"
  }'
```

**Expected:** Should see status changed to "answered" with timestamp and testimony

### Step 8: Try to Mark as Answered Again
```bash
# Try to answer again
curl -X POST http://localhost:8080/api/prayer/<PRAYER_ID>/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER1_TOKEN>" \
  -d '{
    "testimony": "Already answered"
  }'
```

**Expected:** Should get 409 Conflict: "this prayer request is already marked as answered"

### Step 9: View All Answered Prayers
```bash
curl -X GET http://localhost:8080/api/prayer/answered \
  -H "Authorization: Bearer <USER1_TOKEN>"
```

**Expected:** Should see a list of all answered prayers with their testimonies

## Testing with Automated Tests

Once PostgreSQL is running, run the automated tests:

```bash
cd backend

# Run only the prayer tracking tests
go test -v ./test -run TestPrayerTracking

# Or run all tests
go test -v ./test
```

## Expected Results

✅ **Prayer Tracking**
- Users can pray for requests
- Each prayer is logged individually
- Users cannot pray twice for the same request
- Users can view all prayers they've prayed for

✅ **Prayer Answers**
- Prayer owners can mark prayers as answered
- Answered prayers include testimony
- Only prayer owners can mark as answered
- Cannot mark already answered prayers again
- All users can view answered prayers for encouragement

## Database Verification

To verify the prayer logs in the database:

```sql
-- View prayer logs
SELECT pl.id, pl.prayed_at, u.username, pr.request
FROM prayer_logs pl
JOIN users u ON pl.user_id = u.id
JOIN prayer_requests pr ON pl.prayer_request_id = pr.id
ORDER BY pl.prayed_at DESC;

-- View answered prayers
SELECT id, request, status, answered_at, answer_testimony
FROM prayer_requests
WHERE status = 'answered'
ORDER BY answered_at DESC;
```

## Files Modified

1. **Migrations:**
   - `migrations/000007_add_prayer_tracking_and_answers.up.sql`
   - `migrations/000007_add_prayer_tracking_and_answers.down.sql`

2. **Models:**
   - `internal/domain/prayer/model.go` - Added PrayerLog, status, answer fields

3. **Repository:**
   - `internal/domain/prayer/repository.go` - Added prayer log methods

4. **Service:**
   - `internal/domain/prayer/service.go` - Added business logic

5. **Controller:**
   - `internal/domain/prayer/controller.go` - Added new endpoints

6. **Routes:**
   - `internal/server/routes.go` - Registered new routes

7. **Database:**
   - `internal/database/db.go` - Added PrayerLog to migrations

8. **Tests:**
   - `test/prayer_tracking_test.go` - Comprehensive test suite

## Benefits

1. **Accountability:** Track who prayed, not just count
2. **No Duplicates:** Prevents users from spamming prayer count
3. **Faith Building:** See answered prayers and testimonies
4. **Community:** Know others are praying for you
5. **History:** Keep track of what you've prayed for



