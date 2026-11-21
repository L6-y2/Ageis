// ─── 200+ Deep Space Waypoints & Planetary Exploration Stations ───────────────────
// Categorized across the 4 Academic Galactic Sectors:
// 1. Sector Alpha (Orion - اللغة العربية): Stations 1 - 55
// 2. Sector Chronos (التاريخ والآثار الكونية): Stations 56 - 110
// 3. Sector Terra-Centauri (اللغة الإنجليزية): Stations 111 - 165
// 4. Sector Cyber-Andromeda (البرمجة والعلوم التكنولوجية): Stations 166 - 220

export type CelestialType =
  | 'gas_giant'
  | 'ringed_jewel'
  | 'terrestrial_earthlike'
  | 'volcanic_lava'
  | 'ice_world'
  | 'binary_star'
  | 'desert_dune'
  | 'crystal_nebula'
  | 'neutron_star'

export interface SpaceStationWaypoint {
  id: number
  code: string
  nameAr: string
  nameEn: string
  sectorAr: string
  sectorEn: string
  subjectId: number // 6: Arabic, 8: English, 9: History, 7: Programming
  celestialType: CelestialType
  celestialName: string
  primaryColor: string
  secondaryColor: string
  hasRings: boolean
  ringColor?: string
  moonsCount: number
  starColor: string
  nebulaPalette: [string, string, string]
  distanceLY: number
  descriptionAr: string
}

const SECTOR_DATA = [
  {
    subjectId: 6,
    sectorAr: 'قطاع الجوزاء الفصيح (أوريون)',
    sectorEn: 'Orion Sector Alpha',
    prefix: 'ORN',
    theme: ['#06b6d4', '#3b82f6', '#10b981'],
    stations: [
      { nameAr: 'محطة دار البيان', nameEn: 'Al-Bayan Station', target: 'كوكب الفصاحة الأول', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 4.2 },
      { nameAr: 'قاعدة سديم البلاغة', nameEn: 'Balaagha Nebula Outpost', target: 'عملاق البلاغة الغازي', type: 'gas_giant', rings: true, moons: 3, dist: 5.8 },
      { nameAr: 'ميناء النحو المداري', nameEn: 'Nahw Orbital Ring', target: 'نجم المعرب الثنائي', type: 'binary_star', rings: false, moons: 0, dist: 7.1 },
      { nameAr: 'مرصد المعلقات الكوني', nameEn: 'Muallaqat Deep Array', target: 'كوكب الأطلال الجليدي', type: 'ice_world', rings: false, moons: 2, dist: 8.4 },
      { nameAr: 'قلعة الصرف الفضائية', nameEn: 'Sarf Fortress Spire', target: 'كوكب الميزان الحلقي', type: 'ringed_jewel', rings: true, moons: 1, dist: 9.6 },
      { nameAr: 'محطة بحور الشعر', nameEn: 'Buhur Cosmic Relay', target: 'سديم الإيقاع الزمردي', type: 'crystal_nebula', rings: false, moons: 0, dist: 11.2 },
      { nameAr: 'محطة المتنبي المدارية', nameEn: 'Al-Mutanabbi Station', target: 'النجم الأبيض الفائق', type: 'binary_star', rings: false, moons: 1, dist: 12.9 },
      { nameAr: 'مستعمرة قصر الشوق', nameEn: 'Qasr Al-Shawq Colony', target: 'كوكب الرواية الأزرق', type: 'terrestrial_earthlike', rings: false, moons: 2, dist: 14.1 },
      { nameAr: 'قاعدة عنترة بن شداد', nameEn: 'Antarah Forward Base', target: 'كوكب الحِمى البركاني', type: 'volcanic_lava', rings: false, moons: 1, dist: 15.5 },
      { nameAr: 'محطة المعاجم الكبرى', nameEn: 'Lexicon Core Outpost', target: 'كوكب لسان الفضاء', type: 'ringed_jewel', rings: true, moons: 2, dist: 17.0 },
      { nameAr: 'مرصد سماء الكناية', nameEn: 'Kinaya Observational Hub', target: 'عملاق الغيوم الذهبية', type: 'gas_giant', rings: true, moons: 3, dist: 18.7 },
      { nameAr: 'محطة الاستعارة المدارية', nameEn: 'Istiara Relay Station', target: 'نجم الرموز النباض', type: 'neutron_star', rings: false, moons: 0, dist: 20.2 },
      { nameAr: 'ميناء التشبيه الفضائي', nameEn: 'Tashbeeh Starport', target: 'كوكب المرآة البلوري', type: 'ice_world', rings: false, moons: 1, dist: 21.8 },
      { nameAr: 'أكاديمية الجاحظ الكونية', nameEn: 'Al-Jahiz Deep Academy', target: 'كوكب البيان والتبين', type: 'terrestrial_earthlike', rings: false, moons: 2, dist: 23.4 },
      { nameAr: 'قاعدة مدرسة الإحياء', nameEn: 'Ihyaa Solar Outpost', target: 'كوكب البعث المتجدد', type: 'ringed_jewel', rings: true, moons: 2, dist: 25.1 },
      { nameAr: 'محطة أبولو الشعرية', nameEn: 'Apollo Romantic Spire', target: 'سديم الوجدان الوردي', type: 'crystal_nebula', rings: false, moons: 0, dist: 26.7 },
      { nameAr: 'مرصد جماعة الديوان', nameEn: 'Diwan Cosmic Array', target: 'كوكب الفكر التأملي', type: 'gas_giant', rings: true, moons: 1, dist: 28.3 },
      { nameAr: 'ميناء المهجر الفضائي', nameEn: 'Mahjar Void Harbor', target: 'كوكب الحنين البعيد', type: 'ice_world', rings: false, moons: 2, dist: 30.0 },
      { nameAr: 'محطة الواقعية المعاصرة', nameEn: 'Realism Nexus Station', target: 'كوكب تضاريس الواقع', type: 'desert_dune', rings: false, moons: 1, dist: 31.6 },
      { nameAr: 'قاعدة المسرح الشعري', nameEn: 'Poetic Drama Outpost', target: 'نجم الستار المضيء', type: 'binary_star', rings: false, moons: 0, dist: 33.2 },
    ],
  },
  {
    subjectId: 9,
    sectorAr: 'قطاع سجل الزمن (سيكتور كرونوس)',
    sectorEn: 'Chronos Historical Sector',
    prefix: 'CHR',
    theme: ['#f59e0b', '#d97706', '#dc2626'],
    stations: [
      { nameAr: 'محطة الأهرامات المدارية', nameEn: 'Orbital Pyramids Station', target: 'كوكب خوفو الذهبي', type: 'desert_dune', rings: true, moons: 3, dist: 4.8 },
      { nameAr: 'قاعدة منف الفضائية', nameEn: 'Memphis Star Base', target: 'كوكب الأرض الأولى', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 6.2 },
      { nameAr: 'ميناء طيبة الكوني', nameEn: 'Thebes Deep Harbor', target: 'عملاق آمون الشمسي', type: 'gas_giant', rings: true, moons: 2, dist: 7.9 },
      { nameAr: 'مرصد حجر رشيد', nameEn: 'Rosetta Decoder Array', target: 'كوكب الرموز المنقوشة', type: 'crystal_nebula', rings: false, moons: 0, dist: 9.5 },
      { nameAr: 'محطة الإسكندر الأكبر', nameEn: 'Alexandria Zenith Spire', target: 'كوكب المنارة الكونية', type: 'binary_star', rings: false, moons: 2, dist: 11.0 },
      { nameAr: 'قاعدة كليوباترا المدارية', nameEn: 'Cleopatra Orbital Outpost', target: 'كوكب العرش الفضي', type: 'ringed_jewel', rings: true, moons: 1, dist: 12.7 },
      { nameAr: 'ميناء قرطاج الفضائي', nameEn: 'Carthage Void Port', target: 'كوكب البحار الحمراء', type: 'volcanic_lava', rings: false, moons: 1, dist: 14.3 },
      { nameAr: 'محطة الفسطاط الكونية', nameEn: 'Al-Fustat Star Spire', target: 'كوكب الفتح الواعد', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 16.0 },
      { nameAr: 'قاعدة صلاح الدين المدارية', nameEn: 'Saladin Citadel Outpost', target: 'كوكب الصقور الحلقي', type: 'ringed_jewel', rings: true, moons: 2, dist: 17.8 },
      { nameAr: 'محطة المماليك الفضائية', nameEn: 'Mamluk Fortress Relay', target: 'كوكب الفرسان البركاني', type: 'volcanic_lava', rings: false, moons: 0, dist: 19.4 },
      { nameAr: 'مرصد ثورة القاهرة', nameEn: 'Cairo Revolution Observatory', target: 'سديم الشعلة الثائرة', type: 'crystal_nebula', rings: false, moons: 1, dist: 21.0 },
      { nameAr: 'ميناء محمد علي باشا', nameEn: 'Pasha Industrial Starport', target: 'كوكب النهضة الميكانيكية', type: 'gas_giant', rings: true, moons: 3, dist: 22.8 },
      { nameAr: 'قاعدة قناة السويس المدارية', nameEn: 'Suez Gateway Station', target: 'كوكب الممر المائي الكوني', type: 'terrestrial_earthlike', rings: false, moons: 2, dist: 24.5 },
      { nameAr: 'محطة الثورة العرابية', nameEn: 'Orabi Resistance Hub', target: 'كوكب الكرامة الصخري', type: 'desert_dune', rings: false, moons: 1, dist: 26.2 },
      { nameAr: 'مرصد ثورة 1919', nameEn: '1919 Unity Array', target: 'نجم الهلال والصليب', type: 'binary_star', rings: false, moons: 0, dist: 28.0 },
      { nameAr: 'محطة حرب الاستقلال', nameEn: 'Independence Outpost', target: 'كوكب السيادة المطلقة', type: 'ringed_jewel', rings: true, moons: 1, dist: 29.7 },
      { nameAr: 'قاعدة أكتوبر المجيدة', nameEn: 'October Crossing Citadel', target: 'كوكب العبور العظيم', type: 'terrestrial_earthlike', rings: false, moons: 2, dist: 31.5 },
      { nameAr: 'محطة بناء السد العالي', nameEn: 'High Dam Mega-Station', target: 'كوكب الطاقة العملاقة', type: 'gas_giant', rings: true, moons: 4, dist: 33.1 },
      { nameAr: 'ميناء مصر الحديثة', nameEn: 'Modern Egypt Hub', target: 'سديم المستقبل المشرق', type: 'crystal_nebula', rings: false, moons: 1, dist: 35.0 },
      { nameAr: 'محطة وادي الملوك الفضائية', nameEn: 'Valley of Kings Crypt', target: 'كوكب الأسرار الكونية', type: 'neutron_star', rings: false, moons: 0, dist: 36.8 },
    ],
  },
  {
    subjectId: 8,
    sectorAr: 'قطاع تيرا قنطورس (اللغة الإنجليزية)',
    sectorEn: 'Centauri International Sector',
    prefix: 'CEN',
    theme: ['#8b5cf6', '#6366f1', '#ec4899'],
    stations: [
      { nameAr: 'محطة أكسفورد المدارية', nameEn: 'Oxford Spire Array', target: 'كوكب الأكاديميا الأول', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 4.3 },
      { nameAr: 'ميناء شكسبير الفضائي', nameEn: 'Shakespeare Globe Station', target: 'كوكب المأساة والملهاة', type: 'ringed_jewel', rings: true, moons: 2, dist: 5.9 },
      { nameAr: 'قاعدة غرينتش المرجعية', nameEn: 'Greenwich Meridian Hub', target: 'كوكب التوقيت الكوني', type: 'binary_star', rings: false, moons: 0, dist: 7.4 },
      { nameAr: 'محطة كامبريدج الاستكشافية', nameEn: 'Cambridge Research Spire', target: 'عملاق المعرفة الغازي', type: 'gas_giant', rings: true, moons: 3, dist: 9.1 },
      { nameAr: 'مرصد القواعد النحوية', nameEn: 'Grammar Precision Outpost', target: 'كوكب التركيب المثالي', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 10.8 },
      { nameAr: 'محطة المفردات الكبرى', nameEn: 'Vocabulary Nexus Core', target: 'سديم الكلمات المتلألئة', type: 'crystal_nebula', rings: false, moons: 0, dist: 12.5 },
      { nameAr: 'قاعدة ديكنز الفضائية', nameEn: 'Dickens Industrial Outpost', target: 'كوكب الآمال العظيمة', type: 'desert_dune', rings: false, moons: 2, dist: 14.2 },
      { nameAr: 'ميناء أورويل المداري', nameEn: 'Orwellian Space Watch', target: 'كوكب 1984 الجليدي', type: 'ice_world', rings: false, moons: 1, dist: 15.9 },
      { nameAr: 'محطة الحوار الكوني', nameEn: 'Cosmic Dialogue Station', target: 'كوكب الترددات الهادئة', type: 'gas_giant', rings: true, moons: 2, dist: 17.6 },
      { nameAr: 'مرصد مهارات القراءة', nameEn: 'Reading Comprehension Array', target: 'كوكب المكتبة الشاسعة', type: 'ringed_jewel', rings: true, moons: 1, dist: 19.3 },
      { nameAr: 'محطة كتابة المقال الفضائي', nameEn: 'Essay Composition Hub', target: 'كوكب المنطق والترتيب', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 21.0 },
      { nameAr: 'قاعدة الصوتيات واللفظ', nameEn: 'Phonetics Sonic Station', target: 'نجم الذبذبات الصوتي', type: 'neutron_star', rings: false, moons: 0, dist: 22.7 },
      { nameAr: 'ميناء لندن الفضائي', nameEn: 'London Orbital Gateway', target: 'كوكب النهر المتلألئ', type: 'terrestrial_earthlike', rings: false, moons: 2, dist: 24.4 },
      { nameAr: 'محطة أجاثا كريستي', nameEn: 'Agatha Mystery Spire', target: 'كوكب الألغاز المعتم', type: 'volcanic_lava', rings: false, moons: 1, dist: 26.1 },
      { nameAr: 'مرصد الأزمنة اللغوية', nameEn: 'Tenses Chrono-Station', target: 'كوكب خطوط الزمن', type: 'binary_star', rings: false, moons: 0, dist: 27.9 },
      { nameAr: 'قاعدة المجهول والسببي', nameEn: 'Passive Voice Facility', target: 'كوكب المدار الخفي', type: 'gas_giant', rings: true, moons: 3, dist: 29.6 },
      { nameAr: 'محطة الكلام غير المباشر', nameEn: 'Reported Speech Hub', target: 'سديم الأصداء الكونية', type: 'crystal_nebula', rings: false, moons: 0, dist: 31.3 },
      { nameAr: 'ميناء الملك لير الفضائي', nameEn: 'King Lear Deep Sanctuary', target: 'كوكب العواصف الثلجية', type: 'ice_world', rings: true, moons: 2, dist: 33.0 },
      { nameAr: 'محطة التوفل والآيلتس', nameEn: 'Fluency Mastery Base', target: 'كوكب الطلاقة الزمردي', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 34.8 },
      { nameAr: 'قاعدة جاليفر الفضائية', nameEn: 'Gulliver Travels Gateway', target: 'كوكب العوالم العجيبة', type: 'ringed_jewel', rings: true, moons: 3, dist: 36.5 },
    ],
  },
  {
    subjectId: 7,
    sectorAr: 'قطاع أندروميدا السيبراني (البرمجة والخوارزميات)',
    sectorEn: 'Andromeda Cyber Sector',
    prefix: 'AND',
    theme: ['#10b981', '#06b6d4', '#4f46e5'],
    stations: [
      { nameAr: 'محطة مصفوفة باينري', nameEn: 'Binary Array Prime', target: 'كوكب البت والترانزستور', type: 'terrestrial_earthlike', rings: false, moons: 1, dist: 5.1 },
      { nameAr: 'قلعة الخوارزميات الفضائية', nameEn: 'Algorithm Core Citadel', target: 'عملاق التعقيد الزمني', type: 'gas_giant', rings: true, moons: 3, dist: 6.8 },
      { nameAr: 'ميناء السيبرانية المداري', nameEn: 'Cybernet Spaceport', target: 'نجم الدوائر النيوني', type: 'neutron_star', rings: false, moons: 0, dist: 8.5 },
      { nameAr: 'محطة آلان تورينغ', nameEn: 'Alan Turing Memory Spire', target: 'كوكب آلة الحساب الأولى', type: 'crystal_nebula', rings: false, moons: 1, dist: 10.3 },
      { nameAr: 'مرصد الذكاء الاصطناعي', nameEn: 'Neural Net Orbital Hub', target: 'كوكب المشابك العصبية', type: 'binary_star', rings: false, moons: 2, dist: 12.0 },
      { nameAr: 'محطة هيكل البيانات', nameEn: 'Data Structures Depot', target: 'كوكب الأشجار الثنائية', type: 'ringed_jewel', rings: true, moons: 2, dist: 13.7 },
      { nameAr: 'قاعدة تصحيح الأخطاء', nameEn: 'Bug Hunter Outpost', target: 'كوكب الفخاخ البركانية', type: 'volcanic_lava', rings: false, moons: 0, dist: 15.4 },
      { nameAr: 'ميناء بايثون الكوني', nameEn: 'Python Constellation Port', target: 'كوكب الأفعى الخضراء', type: 'terrestrial_earthlike', rings: false, moons: 2, dist: 17.2 },
      { nameAr: 'محطة الويب والتطبيقات', nameEn: 'Full-Stack Sky Lab', target: 'عملاق الخوادم السحابية', type: 'gas_giant', rings: true, moons: 4, dist: 19.0 },
      { nameAr: 'مرصد قواعد البيانات الموزعة', nameEn: 'Supabase Quantum Array', target: 'كوكب الجداول المتصلة', type: 'crystal_nebula', rings: false, moons: 0, dist: 20.8 },
      { nameAr: 'قاعدة الأمن السيبراني', nameEn: 'Cyber Defense Bastion', target: 'كوكب الجدار الناري الحصين', type: 'ringed_jewel', rings: true, moons: 1, dist: 22.5 },
      { nameAr: 'محطة الحوسبة الكمومية', nameEn: 'Quantum Qubit Spire', target: 'نجم التراكب الكمي', type: 'binary_star', rings: false, moons: 0, dist: 24.3 },
      { nameAr: 'ميناء المصادر المفتوحة', nameEn: 'Open Source Galaxy Dock', target: 'كوكب التعاون الكوني', type: 'terrestrial_earthlike', rings: false, moons: 2, dist: 26.0 },
      { nameAr: 'محطة جافا سكريبت العملاقة', nameEn: 'ECMA Core Station', target: 'كوكب حلقة الأحداث الدائمة', type: 'gas_giant', rings: true, moons: 3, dist: 27.8 },
      { nameAr: 'قاعدة هندسة البرمجيات', nameEn: 'Clean Architecture Citadel', target: 'كوكب الأنماط التصميمية', type: 'crystal_nebula', rings: false, moons: 1, dist: 29.5 },
      { nameAr: 'مرصد أداء المعالجة', nameEn: 'Latency Zero Array', target: 'كوكب البلورات السريعة', type: 'ice_world', rings: false, moons: 1, dist: 31.2 },
      { nameAr: 'محطة تعلم الآلة', nameEn: 'Deep Learning Biosphere', target: 'كوكب تدريب النماذج', type: 'ringed_jewel', rings: true, moons: 2, dist: 33.0 },
      { nameAr: 'ميناء إنترنت الأشياء', nameEn: 'IoT Hyper-Relay', target: 'سديم الحساسات المتشابكة', type: 'crystal_nebula', rings: false, moons: 0, dist: 34.8 },
      { nameAr: 'قاعدة الكلاود والسيرفرات', nameEn: 'Cloud Hyperscale Outpost', target: 'كوكب السحابة الماطرة للبيانات', type: 'gas_giant', rings: true, moons: 2, dist: 36.6 },
      { nameAr: 'محطة التشفير اللامركزي', nameEn: 'Ledger Prime Station', target: 'كوكب الكتل المشفرة', type: 'desert_dune', rings: false, moons: 1, dist: 38.5 },
    ],
  },
]

// ─── Generate 220 Unique Deep Space Waypoints Deterministically ───────────────
export function getAllSpaceWaypoints(): SpaceStationWaypoint[] {
  const allWaypoints: SpaceStationWaypoint[] = []
  let globalId = 1

  // Loop through 4 sectors and expand to 55 stations each (total 220 stations)
  for (const sector of SECTOR_DATA) {
    for (let i = 0; i < 55; i++) {
      const baseStation = sector.stations[i % sector.stations.length]
      const tier = Math.floor(i / sector.stations.length) + 1
      const tierSuffixAr = tier > 1 ? ` (المرحلة ${tier})` : ''
      const tierSuffixEn = tier > 1 ? ` Mk-${tier}` : ''

      // Deterministic variations in celestial types, colors, and moons
      const celestialTypes: CelestialType[] = [
        'terrestrial_earthlike',
        'gas_giant',
        'ringed_jewel',
        'ice_world',
        'volcanic_lava',
        'binary_star',
        'crystal_nebula',
        'desert_dune',
        'neutron_star',
      ]
      const targetType = i < sector.stations.length ? (baseStation.type as CelestialType) : celestialTypes[(i * 3 + globalId) % celestialTypes.length]

      const distance = Number((baseStation.dist + tier * 8.5 + (i % 7) * 1.3).toFixed(1))

      allWaypoints.push({
        id: globalId,
        code: `${sector.prefix}-${String(globalId).padStart(3, '0')}`,
        nameAr: `${baseStation.nameAr}${tierSuffixAr}`,
        nameEn: `${baseStation.nameEn}${tierSuffixEn}`,
        sectorAr: sector.sectorAr,
        sectorEn: sector.sectorEn,
        subjectId: sector.subjectId,
        celestialType: targetType,
        celestialName: `${baseStation.target} [${sector.prefix}-${globalId}]`,
        primaryColor: sector.theme[0],
        secondaryColor: sector.theme[1],
        hasRings: targetType === 'ringed_jewel' || (targetType === 'gas_giant' && (i % 2 === 0)),
        ringColor: i % 2 === 0 ? '#e0e7ff' : '#fde047',
        moonsCount: (i * 2 + tier) % 4,
        starColor: (i % 3 === 0) ? '#60a5fa' : (i % 3 === 1) ? '#fbbf24' : '#f87171',
        nebulaPalette: [sector.theme[0], sector.theme[1], sector.theme[2]],
        distanceLY: distance,
        descriptionAr: `مسار رحلة فضائية استكشافية نحو ${baseStation.target}. تتطلب الجلسة تركيزاً مستمراً لاجتياز حقول الجاذبية والرسو بسلام.`,
      })
      globalId++
    }
  }

  return allWaypoints
}

export const SPACE_WAYPOINTS = getAllSpaceWaypoints()

export function getWaypointById(id: number): SpaceStationWaypoint {
  return SPACE_WAYPOINTS.find((w) => w.id === id) || SPACE_WAYPOINTS[0]
}

export function getWaypointsBySubject(subjectId: number): SpaceStationWaypoint[] {
  return SPACE_WAYPOINTS.filter((w) => w.subjectId === subjectId)
}
