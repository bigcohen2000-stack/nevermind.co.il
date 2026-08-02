# ייבוא סרטונים ל־NeverMind

תיקייה זו מחזיקה תבניות בלבד. קבצי נתונים אמיתיים לא נכנסים ל־git.

## מה לשלוח לי (הכי חשוב)

קובץ אחד מספיק להתחלה: **טבלת סרטונים**.

### אפשרות א: Google Sheets / Excel (מומלץ)

1. פתח גיליון חדש.
2. שורת כותרות בדיוק כך (שורה 1):

`youtube_id | title | description | thumbnail_url | playlist_id | is_unlisted | is_gated | concepts | transcript`

3. מלא שורה לכל סרטון.
4. ייצא כ־**CSV UTF-8** או שתף לינק צפייה לגיליון.
5. שים את הקובץ בתיקייה הזו בשם למשל `videos.full.csv` (או שלח בצ'אט / Dropbox).

### אפשרות ב: העתק מהתבניות

העתק את `videos.template.csv` ל־`videos.full.csv` ומלא את כל השורות.

## משמעות העמודות

| עמודה | חובה? | הסבר |
|--------|--------|------|
| `youtube_id` | כן | מזהה YouTube בלבד (למשל `dQw4w9WgXcQ`), לא URL מלא |
| `title` | כן | כותרת בעברית |
| `description` | לא | תיאור קצר |
| `thumbnail_url` | לא | אם ריק ניקח מ־YouTube (`i.ytimg.com`) |
| `playlist_id` | לא | מזהה פלייליסט אם רלוונטי |
| `is_unlisted` | לא | `true` / `false` (ברירת מחדל false) |
| `is_gated` | לא | `true` אם לתוכן לחברים בלבד |

## Unlisted / club IDs (members library)

Public channel sync cannot see unlisted videos. Use real IDs only:

1. Copy `unlisted-ids.template.csv` → a local list (do not invent IDs).
2. With `npm run dev` running:
   `npm run unlisted:mark -- --file path/to/ids.csv`
3. Or Studio → "Mark unlisted (club)" textarea.
4. Optional env (comma list): `YOUTUBE_UNLISTED_VIDEO_IDS` / `GATED_PLAYLIST_IDS`.

`--db-only` marks rows already in `videos` without calling YouTube sync.
| `concepts` | לא | מושגים מופרדים בפסיק, למשל `חרדה,מציאות,הזדהות` |
| `transcript` | לא | תמליל מלא לחיפוש (אפשר בקובץ נפרד) |

## קבצים נפרדים (אופציונלי, אם יש)

- `concepts.full.csv` לפי `concepts.template.csv`
- `video_concepts.full.csv` לפי `video_concepts.template.csv` (כולל `start_timestamp` בשניות)
- `transcripts.full.csv` לפי `transcripts.template.csv`

## מה לא לשלוח

- מפתחות API / סיסמאות
- מספרי טלפון או PII של לקוחות
- ייצוא עיוור מסכמה ישנה בלי מיפוי עמודות

## אחרי שיש קובץ

כתוב לי בצ'אט: "הקובץ מוכן ב־supabase/imports/videos.full.csv" (או הדבק קישור לגיליון).  
משם אריץ ייבוא ממופה לסכמה של Supabase ואאמת חיפוש באתר.
