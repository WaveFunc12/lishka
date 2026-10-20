# App Store listing (draft)

Everything App Store Connect asks for, ready to paste. Hebrew is the primary language; the app is
available in Israel only.

## Name and texts

- **Name** (30 max): הלשכה: מפת ישראל (the name under the icon is "הלשכה". Gal checked on 2026-10-20 that "הלשכה" is free; it is held only once the app record is created in App Store Connect)
- **Subtitle** (30 max): חידון יישובים, כבישים ואזורים
- **Category:** Education. Secondary: Games › Trivia.
- **Keywords** (100 max, comma separated; words already in the name or subtitle count anyway, so they are left out):
  מפה,ערים,גיאוגרפיה,גאוגרפיה,ידיעת הארץ,טריוויה,קיבוצים,מושבים,משחק יומי,לימוד,חשיבה,משפחה
- **Promotional text** (170 max):
  עד כמה אתם מכירים את הארץ? חמישה יישובים ביומי, חדרים פרטיים להתחרות עם החבר׳ה או המשפחה, ו־500 יישובים להחזיר למפה.
- **Description:**

  צבי עובד בלשכה למיפוי כבר 31 שנה. יום אחד נשפך שוקו על השרת, והמפה הלאומית נמחקה. עכשיו
  צריך לבנות אותה מחדש, גלויה אחרי גלויה ואזור אחרי אזור, והוא צריך עזרה.

  • 500 היישובים הגדולים בישראל, ערים, קיבוצים ומושבים, לפי נתוני הלמ״ס.
  • משמרות קצרות של שתי דקות: לאתר יישוב על המפה, לזהות יישוב מסומן, להשוות מי צפונית יותר,
    ולסמן על מפה ריקה.
  • המשחק עוקב אחרי מה שמתחיל להישכח ומחזיר אותו בזמן הנכון. אזור שהשלמת מתחיל לדהות עם הזמן,
    ועשר שאלות מחדשות את החותמת שלו.
  • מפת תבליט אמיתית, עם כבישים ממוספרים, נחלים ואזורים.
  • היומי: חמישה יישובים לכולם, נקודה על כל סימון בטווח 10 ק״מ, ורישום של הרצף והממוצע שלך.
  • חידון כבישים: כביש מסומן על המפה, ומזהים את המספר שלו.
  • חדרים פרטיים עם חברים ומשפחה: טבלה של היום ושל השבוע, ותעודת "עובד/ת השבוע" למוביל.
  • קומיקסים קצרים על איך התחילו הערים והאזורים.
  • 15 אזורים בארכיון, בול על כל אזור שסגרת, מדליות, ומבחן קביעות על מפה ריקה.

  משחק ישראלי מקורי. בלי פרסומות, בלי רכישות ובלי מעקב.

## Review notes

- Everything except private rooms works without an account. Rooms need Sign in with Apple or an email code.
- Demo account (App Review can't read our inbox): set `EXPO_PUBLIC_REVIEW_EMAIL` in the production build, create
  that user in Supabase › Authentication with a 6-digit password, and give both here. For this one address the app
  sends no email and takes the password as the code. Join it to a room that already has a week of results.
  - Email: [review email]
  - Code: [6-digit password]
  - Room code to join: [code]
- Account deletion: Rooms screen › "למחוק את החשבון" (also shown before a display name is chosen).
- Rooms are private (invite code only, no public list). Anyone can leave a room; its owner can remove a member
  ("לנהל את המשתתפים"), who then can't rejoin.
- Before submitting: Sign in with Apple account deletion should also revoke the Apple token (Apple's REST
  `auth/revoke`), which needs a Supabase Edge Function with the Sign in with Apple key from the developer account.

## Age rating

4+. No objectionable content, no user-generated content beyond a display name and room names seen only by
room members (who can leave, and whom the owner can remove), no web browsing, no purchases.

## App privacy ("nutrition label")

Data linked to the user, used for App Functionality only, not used for tracking:
- Contact info › Email address (sign-in with an email code).
- Identifiers › User ID (account id; Apple ID when signing in with Apple).
- User content › Other user content (display name, room names).
- Usage data › Product interaction (daily scores and game progress backup).

No data is collected without an account. Privacy policy: `docs/privacy.md`. The repository is public, so once
this branch is merged the policy URL is https://github.com/WaveFunc12/lishka/blob/main/docs/privacy.md
(fill in the contact email first). The same URL works as the support URL.

## Screenshots

6.9" iPhone (1320 × 2868) or 6.5" (1284 × 2778), 3 to 10 images: home postcard, a map question, the
daily result, a room table, "המפה שלי".
