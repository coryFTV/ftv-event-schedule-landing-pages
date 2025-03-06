## Developer-Ready Specification for Fubo Affiliate Partner Resource App

### Overview
Create a centralized, interactive, web-based resource hub for Fubo affiliate partners to manage, generate, and utilize affiliate links and access up-to-date content information across Movies, TV Series, and Sports Events.

---

### Core Functionalities

#### 1. Affiliate Link Generation
- **Dedicated "Partner Settings" Page**:
  - Persist settings (IRMP, IRAD, SharedID, Sub IDs, UTM parameters) across sessions using local storage.
  - Include basic and advanced customization modes, toggling UTM parameters.
  - "Reset to Default" functionality.

- **Inline URL Generator**:
  - Visible inline next to each content URL.
  - Opens modal popup centered on screen with pre-filled settings, editable by users.
  - Automatic URL encoding and validation to ensure correct formatting:
    - Avoid hashtags (#) in URLs.
    - Proper encoding of special characters (e.g., spaces as `%20`, brackets as `%5B%5D`).

- **User Interaction**:
  - Auto-copy generated links to clipboard.
  - Manual "Copy" button provided.
  - Toast notifications confirm successful copy actions (bottom-right, auto-dismiss).

#### 2. Bulk Export Feature
- Users can manually select or filter content categories (Sports, Movies, Series) for bulk CSV exports.
- Exports include all tracking parameters.
- Confirmation modal displaying selected export summary before download.
- Error modal includes retry and support email generation buttons.
- CSV export triggers a success modal with auto-dismiss functionality.
- Backend logs export errors for debugging without a frontend dashboard.

#### 3. Content Organization and Display
- **Tabs**:
  - Separate tabs for Movies, TV Series, Sports Events.
- **Filtering & Sorting**:
  - Instant application of filters and sorting.
  - Filters: date range, genre/sport, network, region, ratings, availability.
  - Sorting: dropdown for date, popularity, alphabetical.
  - Persistent filter settings across sessions.
  - "Clear All Filters" button.

#### 4. Visual and UI Specifications
- **Consistent Styling**:
  - Minimalistic, responsive grid (Movies/Series) and list layout (Sports).
  - Neutral color base with vibrant interactive elements.
  - Sans-serif typography (Inter, Roboto, Montserrat).
  - Sticky navigation, subtle animations, rounded interactive elements.
  - Glassmorphism and subtle blur effects on overlays.

- **Hover Details**:
  - Minimal hover animations, displaying basic content details (time, network, link).

- **Featured Content**:
  - Manually curated and visually indicated using a dedicated badge/icon (fire emoji).
  - No interactive or clickable elements.
  - Automatically remove expired or irrelevant featured content.

#### 5. Onboarding and Help
- Interactive onboarding tutorial for new users (skippable).
- Integrated FAQs and help resources nested within settings or dedicated FAQ section.

#### 6. Performance Optimization
- Backend caching strategy to speed up content loading without impacting user interaction.
- Implement skeleton loading screens or loading spinners for content load states.

#### 7. Security and Privacy
- Clearly visible privacy policy and terms of service.
- Secure handling of user-inputted parameters (local storage with clear privacy policy).
- No account deletion or explicit data clearing option in UI.

#### 8. Data Handling and Architecture
- Fetch data daily from provided JSON feeds:
  - Movies: https://metadata-feeds.fubo.tv/Test/movies.json
  - Series: https://metadata-feeds.fubo.tv/Test/series.json
  - Sports Events: https://metadata-feeds.fubo.tv/Test/matches.json
- Robust backend infrastructure to ensure reliable JSON feed parsing, validation, and storage.

---

### Error Handling Strategy
- Real-time input validation with automatic corrections and clear user feedback.
- Modal-based error notifications for critical errors with retry and support escalation options.
- Backend logging of export errors for monitoring.

---

### Testing Plan
- **Unit Tests**:
  - URL generation logic (encoding, parameter handling).
  - Filter and sorting functionalities.
  - Local storage persistence.

- **Integration Tests**:
  - End-to-end content loading from JSON feeds.
  - Link generation and copying functionality.

- **User Acceptance Testing (UAT)**:
  - User workflows: onboarding, link generation, filtering, bulk exports.
  - Visual/UI elements across different devices (responsive checks).

- **Performance Testing**:
  - Load time measurements.
  - Caching mechanism effectiveness.

---

This specification outlines a comprehensive approach to developing a robust, user-friendly, and highly efficient affiliate partner resource platform, ensuring affiliates have all necessary tools and information for successful promotion and engagement.

