# Inquiry notification rollout

## Current hosting release

- Hosting continues to call the existing `sendInquiryNotification` endpoint with its complete payload.
- Explicit legacy success and the future `status: sent` response are supported. HTML fallback, skipped mail and ambiguous delivery are not treated as success.
- `VITE_INQUIRY_DELIVERY_TRACKING_ENABLED` defaults to disabled. Tracking, monitoring activation and admin retry do not call undeployed functions.
- The administrator screen links to existing mail logs while the tracking server is pending.
- The new Functions source is saved in GitHub but must not replace production until its datastore is ready.

## Prerequisites for enabling tracking

1. Obtain approval for Firebase Blaze billing; the deployment attempt was blocked by the current plan when enabling Cloud Scheduler.
2. Enable Firestore and prepare the default database. Inspect existing rules before changes. The delivery/control collections must be inaccessible to browser clients; use Admin SDK through authenticated server endpoints.
3. Check scheduled function permissions, quotas and the SMTP configuration. Runtime configuration is Node.js 22; local mock tests do not replace a test in the target runtime.
4. Deploy `sendInquiryNotification`, `inquiryNotificationStatus` and `reconcileInquiryNotifications` together.
5. Verify authorized status access and a controlled mail delivery to an explicitly approved recipient. Do not replay historical customer inquiries as a test.
6. Set `VITE_INQUIRY_DELIVERY_TRACKING_ENABLED=true` for the hosting build and CI only after verification. Rebuild and deploy Hosting. The status request uses the authenticated Cloud Functions URL, so no additional Hosting rewrite is required.
7. Activate monitoring in the administrator UI. The cutoff is activation time; old inquiries require explicit manual review. Check that the last-run timestamp advances within 15 minutes.

SMTP acknowledgement is not proof of inbox delivery. Uncertain results require recipient-side verification before retrying. The automatic retry path is limited to definite failures before SMTP starts.

## Verification commands

```powershell
node --test scripts/test-email-compat.cjs
npm.cmd --prefix functions run test:inquiry-notifications
npm.cmd run build
```

## Deployment scope

Deploy Hosting with `firebase deploy --only hosting:miceday --project human-partner` for this release. Avoid an unscoped deploy while tracking infrastructure is pending.
