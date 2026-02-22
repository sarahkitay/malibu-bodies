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

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /intakeSubmissions/{doc} {
      allow read, write: if true; // Restrict in production
    }
  }
}
```

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

## Intake form flow

- **Trainer Intake tab**: Form is embedded. "Email intake link" opens invite modal with New client / Interested client options. "Log intake received" lets you upload a photo or file.
- **New client link** (`?intake=1&newClient=1`): Recipient sees popup "Complete and submit intake form" and fills the form. Submissions save to Firestore.
- **Standard link** (`?intake=1`): No popup; direct to form.
