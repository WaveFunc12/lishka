import { router } from 'expo-router';
import { View } from 'react-native';
import { PLACES } from '@/engine';
import { useT } from '@/state/store';
import { Card, H1, Kicker, LinkBtn, Screen, T_, ZviSays } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* About and credits. The map data licences require these lines in the app. */
/** Heading, text, and whether the text is English (laid out left to right). */
const CREDITS: [string, string, boolean?][] = [
  ['יישובים ואוכלוסייה', `הלשכה המרכזית לסטטיסטיקה, קובץ היישובים 2023. ${PLACES.length} היישובים הגדולים, עם מיקום ומספר תושבים.`],
  ['כבישים ונחלים', '© OpenStreetMap contributors, דרך Overture Maps, ברישיון ODbL.'],
  ['תבליט ההרים', 'Copernicus DEM GLO-90, © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA.', true],
  ['גופנים', 'Rubik, Suez One ו־Karantina, ברישיון SIL Open Font License.'],
];

export default function About() {
  const t = useT();
  return (
    <Screen>
      <LinkBtn label="חזרה" onPress={() => router.back()} />
      <View><Kicker>קומה 3 · לוח המודעות</Kicker><H1>על הלשכה</H1></View>
      <ZviSays text={t('גלויות מהלשכה הוא משחק ללימוד מפת הארץ: איפה כל יישוב, מה לידו, ואיך מגיעים. כל יום קצת, ובלי שוקו ליד השרת.')} />
      <Card style={{ gap: 12 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>מקורות וקרדיטים</T_>
        {CREDITS.map(([h, b, en]) => (
          <View key={h} style={{ gap: 2 }}>
            <T_ style={{ fontFamily: F.black, fontSize: 15 }}>{h}</T_>
            <T_ style={[{ fontSize: 14, color: C.muted, lineHeight: 20 }, en && { writingDirection: 'ltr', textAlign: 'left' }]}>{b}</T_>
          </View>
        ))}
      </Card>
      <Card style={{ gap: 6 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>פרטיות</T_>
        <T_ style={{ fontSize: 14, lineHeight: 20 }}>בלי חשבון, ההתקדמות נשמרת רק בטלפון ושום דבר לא נשלח לשרת.</T_>
        <T_ style={{ fontSize: 14, lineHeight: 20 }}>עם חשבון לחדרים נשמרים מייל או מזהה Apple לכניסה, שם תצוגה ותוצאות היומי (רק חברי החדרים שלך רואים אותם), וגיבוי של ההתקדמות.</T_>
        <T_ style={{ fontSize: 14, lineHeight: 20 }}>אין פרסומות ואין מעקב. אפשר למחוק את החשבון במסך החדרים.</T_>
      </Card>
      <T_ style={{ fontSize: 13, color: C.muted, textAlign: 'center' }}>
        המפה מראה גבולות ושטחים לצורכי המשחק בלבד. צבי הוא דמות בדויה. השוקו אמיתי.
      </T_>
    </Screen>
  );
}
