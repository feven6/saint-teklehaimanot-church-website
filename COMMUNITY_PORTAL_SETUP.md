# Community Portal Setup — action required before accepting real member submissions

The website now includes `MemberPortal.html`, `portal.js`, `firebase-config.js`, `firestore.rules`, and `storage.rules`. It is **not connected** to Firebase yet. The portal intentionally displays a setup notice and disables registration until configured.

## Configure Firebase
1. Create a Firebase project owned by the church. Register a Web app, and copy the **web app config** into `firebase-config.js` (not an Admin SDK/service-account secret).
2. Enable Authentication → Sign-in method → Email/Password, and configure email verification and authorized domains.
3. Create a Firestore database and a Cloud Storage bucket. Review Firebase billing and quotas, particularly for storage.
4. Publish the included `firestore.rules` in Firestore → Rules, and `storage.rules` in Storage → Rules. Test both with Firebase Rules Playground / Emulator before inviting members.
5. In Firestore, create a collection `admins` with a document ID equal to your Firebase Auth UID. You must do this manually in Firebase Console. Only trusted church administrators should have admin documents. Never let members create admin records.
6. Add `MemberPortal.html` to the website navigation once testing is complete.
7. Test: unverified member cannot submit; verified member can submit; member cannot approve; admin can approve/reject; visitors only see approved media; anonymous users cannot read pending photos.

## Workflow
Members register, verify their email, and submit a JPG/PNG/WebP image (up to 8 MB) or YouTube link. Firestore stores submission status `pending`. Only admins can change it to `approved` or `rejected`. The public gallery displays only approved entries. YouTube Live can be shared as a YouTube link; streaming itself happens on YouTube.

## Privacy and limitations
Get explicit consent from adults and parent/guardian consent for minors. A checked consent box is not a substitute for a real church media policy. Never upload confidential church records. The current implementation has no takedown or deletion workflow, no automated content moderation, and no virus or image safety scanning. Add those before a large public launch. Members should not enter real personal data until the setup, privacy policy, and security tests are complete.

Storage download URLs may be shareable even if an item is later rejected; for strong revocation, use a server-mediated delivery system rather than permanent download tokens. Do not treat this starter as a production security audit.
