# MyRecipes - Project Plan

## Overview
MyRecipes is a Hebrew-language recipe management application that automatically syncs recipes from a family WhatsApp group and creates a searchable library. The application supports multiple recipe formats including text recipes, website links, and Instagram stories.

## Goals
- Automatically sync recipes from WhatsApp group messages
- Create a searchable recipe library in Hebrew
- Support multiple recipe sources (text, websites, Instagram stories)
- Provide a user-friendly Hebrew interface for browsing and searching recipes
- Deploy to Vercel for easy access

## Core Features

### 1. WhatsApp Integration & Sync
- **WhatsApp Group Sync**: Automatically fetch recipes from family WhatsApp group
- **Message Parsing**: Extract recipe content from WhatsApp messages
- **Multiple Source Types**:
  - **Text Recipes**: Parse text-based recipes from messages
  - **Website Links**: Extract and store recipe links, fetch recipe content from websites
  - **Instagram Stories**: Handle Instagram story links and extract recipe information
- **Automatic Updates**: Periodically sync new recipes from WhatsApp group

### 2. Recipe Management
- **Recipe Storage**: Store recipes with:
  - Title (Hebrew)
  - Description (Hebrew)
  - Ingredients list (Hebrew)
  - Step-by-step instructions (Hebrew)
  - Source type (text/website/Instagram)
  - **Original Link** (required if exists - always preserve original URL)
  - Source URL (for links)
  - Original WhatsApp message reference
  - Images/photos from messages
  - Created date
  - Last synced date

- **View Recipes**: Display recipe details in Hebrew with proper RTL (right-to-left) layout
- **Recipe Types**:
  - Text recipes: Display parsed content directly (no original link)
  - Website recipes: Display parsed content AND always show original link prominently
  - Instagram stories: Display content AND always show original Instagram link prominently
- **Link Preservation**: All recipes with original links must:
  - Store the complete original URL
  - Display the link prominently in the recipe view
  - Make links clickable and accessible
  - Preserve link even if content is extracted/scraped

### 3. Search & Discovery
- **Hebrew Search**: Full-text search in Hebrew
- **Search Capabilities**:
  - Search by recipe name
  - Search by ingredients
  - Search by source type
  - Search within recipe content
- **Filtering**: Filter recipes by:
  - Source type (text/website/Instagram)
  - Date added
  - Keywords/tags

### 4. User Interface (Hebrew)
- **RTL Support**: Right-to-left layout for Hebrew text
- **Hebrew Typography**: Proper Hebrew font rendering
- **Responsive Design**: Mobile and desktop support
- **Recipe Cards**: Visual display of recipes with images
- **Search Interface**: Hebrew search bar with instant results
- **Recipe Detail View**: Full recipe display with Hebrew formatting

## Technical Requirements

### Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Frontend**: React
- **Styling**: [To be determined - Tailwind CSS/CSS Modules/etc.]
- **Database**: [To be determined - Vercel Postgres/Supabase/PlanetScale/etc.]
- **WhatsApp Integration**: [To be determined - WhatsApp Business API/WhatsApp Web scraping/etc.]
- **Deployment**: Vercel
- **Image Storage**: [To be determined - Vercel Blob/Cloudinary/etc.]

### WhatsApp Integration Options
1. **WhatsApp Business API**: Official API (requires business verification)
2. **WhatsApp Web Automation**: Using libraries like `whatsapp-web.js` or `baileys`
3. **Manual Export**: Export chat history and parse files
4. **Webhook Integration**: If using WhatsApp Business API

### Update Strategies for Manual Export

#### Option 1: Forward New Messages to Dedicated Channel
- **Workflow**: Forward only new recipe messages from WhatsApp group to a dedicated channel/contact
- **Implementation**:
  - Create a dedicated WhatsApp contact or channel for recipe forwarding
  - Forward new recipe messages as they arrive
  - Export only the forward channel periodically (smaller, cleaner dataset)
  - Parse forwarded messages and extract recipes
- **Advantages**:
  - Clean separation of new vs old messages
  - Smaller export files (only new messages)
  - Easy to identify what's new
  - No need to parse entire group history each time
- **Process**:
  1. User forwards new recipe messages to dedicated contact/channel
  2. Periodically export the forward channel
  3. System processes only new messages
  4. Compare message timestamps/IDs to avoid duplicates

#### Option 2: Incremental Export with Timestamp Tracking
- **Workflow**: Export full chat periodically, track last processed timestamp
- **Implementation**:
  - Store `last_processed_timestamp` in database
  - On each export, parse only messages after this timestamp
  - Update timestamp after successful processing
- **Advantages**:
  - No manual forwarding needed
  - Automatic duplicate detection
  - Can handle full export or date-range exports
- **Process**:
  1. Export WhatsApp chat (full or date range)
  2. Parse exported file
  3. Filter messages by timestamp (only process new ones)
  4. Store new recipes and update timestamp

#### Option 3: WhatsApp Export with Message ID Tracking
- **Workflow**: Track processed message IDs, skip duplicates
- **Implementation**:
  - Extract unique message IDs from WhatsApp export
  - Store processed message IDs in database
  - On each export, skip messages with known IDs
- **Advantages**:
  - Works with any export format
  - Reliable duplicate prevention
  - Can handle partial exports
- **Process**:
  1. Export WhatsApp chat
  2. Extract message IDs from export
  3. Compare with stored IDs
  4. Process only new messages
  5. Store new message IDs

#### Option 4: Manual Upload Interface
- **Workflow**: Web interface for uploading new export files
- **Implementation**:
  - Create admin page for uploading WhatsApp export files
  - Parse uploaded file and extract new recipes
  - Show preview of new recipes before adding
  - Manual approval workflow
- **Advantages**:
  - Full control over what gets added
  - Can review before adding
  - Works with any export method
- **Process**:
  1. Export WhatsApp chat
  2. Upload export file via web interface
  3. System parses and shows preview
  4. User reviews and approves new recipes
  5. Recipes added to database

#### Recommended Approach: Hybrid (Forward + Timestamp)
- **Primary Method**: Forward new messages to dedicated channel
- **Backup Method**: Full export with timestamp tracking
- **Benefits**:
  - Regular updates via forwarding (fast, clean)
  - Periodic full export as backup (catches anything missed)
  - Best of both worlds

### Data Model
- Recipe entity with fields:
  - ID (unique identifier)
  - Title (Hebrew text)
  - Description (Hebrew text)
  - Ingredients (array of Hebrew strings)
  - Instructions (array of Hebrew strings)
  - Source type (enum: 'text' | 'website' | 'instagram')
  - **Original Link** (string, nullable but REQUIRED when source type is 'website' or 'instagram')
    - Must be stored for all recipes that have a link
    - Preserves the exact URL from WhatsApp message
    - Used for direct access to original source
  - Source URL (string, nullable - alias for Original Link, kept for backward compatibility)
  - WhatsApp message ID (reference to original message)
  - WhatsApp message timestamp
  - Images (array of image URLs)
  - Parsed content (JSON, for structured recipe data)
  - Created date
  - Last synced date
  - Search index (for full-text search)
  
### Update Tracking
- **Last Processed Timestamp**: Store timestamp of last processed message
- **Processed Message IDs**: Track all processed message IDs to prevent duplicates
- **Sync Status**: Track sync status per message (pending/processed/failed)
  
**Important**: The Original Link field is critical - it must be preserved for all recipes that include a link, regardless of whether content is extracted or scraped. This ensures users can always access the original source.

### Hebrew Language Support
- RTL (Right-to-Left) layout support
- Hebrew font integration
- Hebrew text parsing and processing
- Hebrew search indexing
- Proper date/time formatting in Hebrew

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure
- Initialize Next.js project with TypeScript
- Set up Vercel deployment configuration
- Configure Hebrew language support and RTL layout
- Set up database schema and connection
- Create basic project structure and folder organization
- Set up Hebrew fonts and typography

### Phase 2: WhatsApp Integration
- Research and implement WhatsApp sync solution
- Create message parsing logic for different source types:
  - Text recipe parser
  - Website link extractor (must preserve original URL)
  - Instagram story link handler (must preserve original URL)
- **Link Extraction**: Extract and preserve all URLs from WhatsApp messages
- **Link Validation**: Validate and normalize URLs before storage
- **Update Mechanism**: Implement incremental update system:
  - Message ID tracking to prevent duplicates
  - Timestamp-based filtering for new messages
  - Support for forwarded message parsing
  - Manual upload interface for export files
- **Duplicate Prevention**: 
  - Compare message IDs before processing
  - Track processed timestamps
  - Skip already-processed messages
- Store recipes in database with proper metadata, ensuring original links are always preserved
- Handle images from WhatsApp messages

### Phase 3: Recipe Display & Search
- Create recipe list view with Hebrew RTL layout
- Implement recipe detail page with prominent original link display
- **Original Link Display**: 
  - Show original link prominently for website and Instagram recipes
  - Make links clickable and styled clearly
  - Display link even when recipe content is extracted
  - Add "לצפייה במקור" (View Original) button/link
- Build Hebrew search functionality
- Add filtering by source type
- Implement full-text search indexing
- Create recipe cards with images and link indicators

### Phase 4: Content Extraction & Enhancement
- Implement website content scraping for recipe links
- Handle Instagram story content (if possible via API)
- Parse and structure recipe content from text
- Extract ingredients and instructions automatically
- Add image optimization and storage

### Phase 5: Polish & Optimization
- UI/UX improvements for Hebrew interface
- Performance optimization (caching, image optimization)
- Error handling and validation
- Add loading states and error messages in Hebrew
- Responsive design improvements
- SEO optimization for Hebrew content
- Documentation

## Technical Challenges & Solutions

### Challenge 1: WhatsApp Integration
- **Challenge**: Accessing WhatsApp group messages programmatically
- **Potential Solutions**:
  - Use WhatsApp Business API (official but requires verification)
  - Use WhatsApp Web automation libraries (may violate ToS)
  - Manual export and file parsing (most reliable)
  - WhatsApp Cloud API (if available)

### Challenge 5: Incremental Updates
- **Challenge**: Keeping database updated with new recipes without reprocessing entire history
- **Solutions**:
  - **Forward new messages**: User forwards only new recipe messages to dedicated channel
  - **Timestamp tracking**: Track last processed timestamp, only process newer messages
  - **Message ID tracking**: Store processed message IDs, skip duplicates
  - **Manual upload interface**: Allow uploading export files with automatic duplicate detection
  - **Hybrid approach**: Combine forwarding (regular updates) with periodic full export (backup)

### Challenge 2: Hebrew Text Processing
- **Challenge**: Proper Hebrew text parsing, search, and RTL layout
- **Solutions**:
  - Use proper Hebrew fonts (e.g., Alef, Assistant, Heebo)
  - Implement RTL CSS support
  - Use Hebrew-aware search libraries
  - Proper text direction handling in React

### Challenge 3: Recipe Content Extraction
- **Challenge**: Extracting structured recipe data from various sources
- **Solutions**:
  - Use web scraping libraries for website recipes
  - Implement text parsing patterns for Hebrew recipes
  - Use AI/ML for content extraction (optional enhancement)
  - Manual review and correction interface

### Challenge 4: Instagram Stories
- **Challenge**: Instagram stories are ephemeral and hard to access
- **Solutions**:
  - Store Instagram story links
  - Use Instagram Basic Display API (if available)
  - Screenshot handling from WhatsApp messages
  - Link to Instagram profile/story

## Success Criteria
- Recipes automatically sync from WhatsApp group
- All UI and content displayed in Hebrew with proper RTL layout
- Search functionality works accurately in Hebrew
- Application successfully deployed to Vercel
- Recipes from all three source types (text, website, Instagram) are properly handled
- **Original links are always preserved and displayed** for recipes that have them
- Application is responsive and user-friendly
- Data persists correctly and syncs automatically
- Users can easily access original recipe sources via preserved links

## Future Enhancements (Optional)
- Recipe editing and manual corrections
- Recipe categorization and tagging
- Recipe scaling (adjust servings)
- Meal planning features
- Shopping list generation from recipes
- Recipe rating and favorites
- Export recipes to PDF
- Recipe sharing capabilities
- Nutritional information extraction
- AI-powered recipe parsing and enhancement
