# Security Specification — Dooms Month Leaderboard

## Data Invariants
1. **Non-PII Public Leaderboard**: `doomParticipants` stores only display `name`, integer `points`, optional short `note`, `createdBy` UID, and server timestamps (`createdAt`, `updatedAt`). No emails, phone numbers, or addresses are stored in `doomParticipants`.
2. **Verified Organizer Writes**: Only verified organizer accounts (`email_verified == true` matching bootstrapped organizer `dnyaneshwars0611@gmail.com` or an existing `/admins/{uid}` record) may create, update, or delete `doomParticipants`.
3. **Strict Schema & Bounds**: `name` is `1..60` chars, `points` is an integer between `-999` and `9999`, optional `note` is `<= 80` chars, and `createdAt`/`updatedAt` must equal `request.time` on creation (`updatedAt == request.time` on update, with `createdAt` and `createdBy` immutable).
4. **Admin Isolation**: `/admins/{uid}` contains organizer email metadata and is readable only by the matching user (`request.auth.uid == uid`) or an existing admin, with `list` disabled and writes restricted to the bootstrapped organizer.

## Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated `create` on `/doomParticipants/p1` -> `PERMISSION_DENIED`.
2. Signed-in non-admin user attempting `create` on `/doomParticipants/p1` -> `PERMISSION_DENIED`.
3. Admin creating a doc with a shadow field `{ isVerified: true }` -> `PERMISSION_DENIED` (`hasOnly` check).
4. Unverified email spoof (`email == 'dnyaneshwars0611@gmail.com'`, `email_verified == false`) -> `PERMISSION_DENIED`.
5. Admin creating a doc with `createdBy != request.auth.uid` -> `PERMISSION_DENIED`.
6. Admin creating a doc with client-forged `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
7. Admin updating `points` to a float (`10.5`) or string (`"100"`) -> `PERMISSION_DENIED`.
8. Admin updating `points` out of bounds (`10000` or `-1000`) -> `PERMISSION_DENIED`.
9. Admin attempting to mutate immutable `createdAt` or `createdBy` on `update` -> `PERMISSION_DENIED`.
10. Oversized `name` (`> 60` chars) or `note` (`> 80` chars) -> `PERMISSION_DENIED`.
11. Poisoned document ID (`participantId` containing spaces or `> 128` chars) -> `PERMISSION_DENIED`.
12. Non-admin reading or listing `/admins` -> `PERMISSION_DENIED`.
