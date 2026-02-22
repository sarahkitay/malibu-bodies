# Firebase Setup for Malibu Bodies

## 1. Get your Firebase API key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project **malibu-bodies** (Project ID: malibu-bodies)
3. Click the gear icon → Project Settings
4. Under "Your apps", find the Web app (Clientbase, App ID: 1:834565969987:web:07ba065c8eb1b505c39cf6)
5. Copy the `apiKey` value

## 2. Create environment file

Create a `.env` file in the project root:

```
VITE_FIREBASE_API_KEY=your_actual_api_key_here
```

## 3. Enable Firestore Database

1. In Firebase Console, go to Build → Firestore Database
2. Click "Create database"
3. Start in test mode (or production with rules)
4. Choose a location

## 4. Enable Firebase Storage

1. In Firebase Console, go to Build → Storage
2. Click "Get started"
3. Use default security rules for testing

## 5. Firestore security rules (recommended)

Use the project’s **`firestore.rules`** file (or paste the same in Firebase Console → Firestore → Rules):

- **Do not** use `match /{document=**}` with `allow read, write: if true` — that allows access to every collection now and in the future.
- **Do** allow only the paths the app uses (e.g. `intakeSubmissions`). Anything else is denied by default.

Copy from `firestore.rules` or deploy with Firebase CLI. For production, add Firebase Auth and restrict by `request.auth.uid`.

## 6. Storage security rules (recommended)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /intake-attachments/{allPaths=**} {
      allow read, write: if true; // Restrict in production
    }
  }
}
```

## “Usage exceeded” with little data?

Firebase **usage** is often about **read/write operations**, not how much data you store. The Spark (free) tier has limits like **50,000 Firestore reads per day**. Each time the trainer dashboard or a client’s Intake tab loads, the app runs `getDocs` on `intakeSubmissions`, so **every document in that collection counts as one read**. Refreshing the page or opening the dashboard in multiple tabs can use thousands of reads even if you only have a few intake documents.

**What to do:**

1. **Check usage**  
   Firebase Console → Project **malibu-bodies** → Build → Firestore Database → **Usage** tab. See if you’re over the free-tier reads/writes for the day.

2. **Reduce reads**  
   The app now caches intake submissions for 90 seconds, so repeated visits within that window don’t trigger extra Firestore reads.

3. **Quota resets**  
   Daily read/write quotas reset at midnight Pacific Time. If you hit “usage exceeded,” wait for the reset or temporarily use the app less.

4. **Upgrade if needed**  
   If you consistently need more than the free tier, upgrade to the Blaze (pay-as-you-go) plan and set a budget. You only pay for usage above the free tier.

5. **Storage**  
   If the message is about **Storage** (files), check Build → Storage → Usage. Free tier is 5 GB stored and 1 GB downloaded per day.

## Intake form flow

- **Trainer Intake tab**: Form is embedded. "Email intake link" opens invite modal with New client / Interested client options. "Log intake received" lets you upload a photo or file.
- **New client link** (`?intake=1&newClient=1`): Recipient sees popup "Complete and submit intake form" and fills the form. Submissions save to Firestore.
- **Standard link** (`?intake=1`): No popup; direct to form.
