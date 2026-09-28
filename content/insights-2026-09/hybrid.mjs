// Editorial adaptations of Hibrid binalar.pdf. Locale order: AZ, EN, DE, RU.
const articles = [
  {
    id: 'hybrid', category: 'architecture', source: 'Hibrid binalar.pdf, pp. 1, 3–4',
    slugs: ['hibrid-konstruksiya-nedir', 'what-is-hybrid-construction', 'was-ist-hybridbau', 'chto-takoe-gibridnaya-konstrukciya'],
    titles: ['Hibrid konstruksiya nədir və necə işləyir?', 'What is hybrid construction and how does it work?', 'Was ist Hybridbau und wie funktioniert er?', 'Что такое гибридная конструкция и как она работает?'],
    descriptions: ['Hibrid konstruksiya nədir? Beton, polad və ağacın vahid yükdaşıyan sistemdə rolu, material seçimi və layihələndirmə məntiqi haqqında izah.', 'What makes a building structurally hybrid? Explore how concrete, steel and timber work together and why load paths matter more than a material mix.', 'Was macht ein Tragwerk zum Hybridbau? Beton, Stahl und Holz im Zusammenspiel: Materialwahl, Lastabtragung und frühe Planungsentscheidungen.', 'Что делает конструкцию гибридной? Роли бетона, стали и древесины в единой несущей системе, передача нагрузок и логика выбора материалов.'],
    alts: ['Beton nüvə, polad karkas və taxta döşəməli hibrid binanın konsepti', 'Concept cutaway of a hybrid building with concrete, steel and timber', 'Konzeptschnitt eines Hybridbaus aus Beton, Stahl und Holz', 'Концептуальный разрез гибридного здания из бетона, стали и древесины'],
    bodies: [
`Hibrid konstruksiya iki və ya daha çox materialın və ya konstruktiv sistemin bir binanın yükdaşıyan həllində birlikdə işləməsidir. Beton, polad və ağacın eyni fasadda görünməsi təkbaşına hibrid daşıyıcı sistem demək deyil. Əsas meyar yüklərin necə ötürülməsi və elementlərin hansı vəzifəni yerinə yetirməsidir.

## Material deyil, sistem seçilir
Dəmir-beton nüvə binanın üfüqi yüklərə qarşı sərtliyində iştirak edə, polad karkas mərtəbələri daşıya, mühəndislik ağacı isə döşəmə və ya dam elementlərində istifadə oluna bilər. Hər materialın rolu ümumi konstruktiv sxemdə müəyyənləşdirilir.

## Hibrid və kompozit eyni anlayış deyil
Hibrid binada fərqli materiallar müxtəlif hissələrdə işləyə bilər. Kompozit elementdə isə materialların bir element daxilində birlikdə işləməsi xüsusi bağlantılar və hesablama ilə təmin olunur. Məsələn, taxta üzərinə beton tökmək avtomatik kompozit döşəmə yaratmır.

## Konsept mərhələsində hansı suallar verilməlidir?
- Şaquli və üfüqi yüklər təmələ hansı yolla ötürülür?
- Materiallar harada birləşir və bu detallar necə hazırlanır?
- Montaj ardıcıllığı və müvəqqəti dayanıqlıq necə təmin olunur?
- Yanğın, akustika və istismar tələbləri necə qarşılanır?

Hibrid yanaşma özlüyündə daha ucuz və ya daha dayanıqlı nəticə vəd etmir. Onun dəyəri konkret layihənin tələblərinə uyğun sistem qurmaqla ortaya çıxır.`,
`Hybrid construction combines two or more materials or structural systems within a building's load-bearing solution. Seeing concrete, steel and timber on the same façade does not by itself make the structure hybrid. The important questions are how loads travel and what each element does.

## Select a system, not just materials
A reinforced-concrete core may provide lateral stiffness, a steel frame may support floors, and engineered timber may form floor or roof elements. Each material needs a defined role within the overall structural arrangement.

## Hybrid and composite are different concepts
In a hybrid building, different materials may perform separate roles. In a composite element, their combined action is deliberately established through connections and structural design. Placing concrete above timber does not automatically create a composite floor.

## Ask the right concept-stage questions
- How do gravity and lateral loads reach the foundations?
- Where do materials meet, and how will those interfaces be made?
- What is the assembly sequence and temporary stability strategy?
- How will fire, acoustic and service requirements be addressed?

A hybrid approach does not automatically deliver lower cost or better environmental performance. Its value comes from matching a coordinated structural system to the requirements of the particular project.`,
`Hybridbau verbindet zwei oder mehr Materialien beziehungsweise Tragsysteme innerhalb der tragenden Struktur eines Gebäudes. Beton, Stahl und Holz an derselben Fassade machen allein noch kein hybrides Tragwerk. Entscheidend sind die Lastwege und die Aufgaben der einzelnen Bauteile.

## Ein System statt einzelner Materialien wählen
Ein Stahlbetonkern kann zur Aussteifung beitragen, ein Stahlrahmen die Decken tragen und Holz in Decken- oder Dachelementen eingesetzt werden. Jedes Material erhält eine definierte Aufgabe im Gesamtsystem.

## Hybridbau und Verbundbau unterscheiden
In einem Hybridbau können verschiedene Materialien getrennte Aufgaben übernehmen. Bei einem Verbundbauteil wird ihr gemeinsames Tragverhalten durch geeignete Verbindungen und Bemessung gezielt hergestellt. Eine Betonschicht auf Holz erzeugt deshalb nicht automatisch eine Verbunddecke.

## Fragen für die Konzeptphase
- Wie gelangen vertikale und horizontale Lasten in die Fundamente?
- Wo treffen Materialien aufeinander und wie werden diese Anschlüsse hergestellt?
- Wie funktionieren Montagefolge und temporäre Stabilisierung?
- Wie werden Brand-, Schall- und Nutzungsanforderungen erfüllt?

Hybridbau garantiert weder geringere Kosten noch eine bessere Umweltbilanz. Sein Nutzen entsteht durch ein abgestimmtes Tragwerk, das zu den konkreten Anforderungen des Projekts passt.`,
`Гибридная конструкция объединяет два или более материала либо конструктивные системы в несущем решении здания. Наличие бетона, стали и древесины на одном фасаде само по себе не делает конструкцию гибридной. Важны пути передачи нагрузок и задачи каждого элемента.

## Выбирайте систему, а не набор материалов
Железобетонное ядро может обеспечивать пространственную жёсткость, стальной каркас — поддерживать перекрытия, а инженерная древесина — использоваться в перекрытиях или покрытии. Роль каждого материала определяется общей конструктивной схемой.

## Различайте гибридную и композитную работу
В гибридном здании материалы могут выполнять отдельные задачи. В композитном элементе их совместную работу специально обеспечивают соединениями и расчётом. Поэтому слой бетона поверх древесины ещё не означает композитное перекрытие.

## Вопросы для стадии концепции
- Как вертикальные и горизонтальные нагрузки передаются фундаментам?
- Где материалы соединяются и как выполняются эти узлы?
- Каковы последовательность монтажа и временное раскрепление?
- Как учитываются пожарные, акустические и эксплуатационные требования?

Гибридный подход не гарантирует более низкую стоимость или лучшие экологические показатели. Его ценность определяется тем, насколько согласованная несущая система отвечает условиям конкретного проекта.`],
  },
  {
    id: 'materials', category: 'architecture', source: 'Hibrid binalar.pdf, p. 1',
    slugs: ['hibrid-binada-beton-polad-agac', 'concrete-steel-timber-hybrid-buildings', 'beton-stahl-holz-im-hybridbau', 'beton-stal-drevesina-v-gibridnyh-zdaniyah'],
    titles: ['Hibrid binada beton, polad və ağacın rolu', 'Concrete, steel and timber: roles in a hybrid building', 'Beton, Stahl und Holz: Aufgaben im Hybridbau', 'Бетон, сталь и древесина: роли в гибридном здании'],
    descriptions: ['Beton, polad və mühəndislik ağacı hibrid binada necə seçilir? Sərtlik, aşırım, çəki və materiallar arasındakı əlaqəni nəzərdən keçirin.', 'Compare the roles of concrete, steel and engineered timber in hybrid buildings, from stiffness and spans to weight and coordination at interfaces.', 'Beton, Stahl und Holz im Hybridbau: Aufgaben bei Steifigkeit, Spannweite und Eigengewicht sowie die Bedeutung abgestimmter Schnittstellen.', 'Роли бетона, стали и инженерной древесины в гибридном здании: жёсткость, пролёты, собственный вес и согласование узлов между материалами.'],
    alts: ['Beton dayaq, polad tir və taxta tavanın konseptual material kompozisiyası', 'Concept material study of a concrete pier, steel beam and timber ceiling', 'Konzeptstudie mit Betonstütze, Stahlträger und Holzdecke', 'Концептуальная композиция бетонной опоры, стальной балки и деревянного потолка'],
    bodies: [
`Hibrid layihədə material seçimi hər elementin vəzifəsindən başlayır. Bütün bina üçün bir materialın üstün olduğunu iddia etmək əvəzinə, nüvə, karkas, döşəmə və təməl üçün fərqli seçimlər birlikdə qiymətləndirilir.

## Dəmir-beton: kütlə və sərtlik
Beton sıxılma işində, dəmir-beton isə armaturla birlikdə müxtəlif yük təsirlərinin qarşılanmasında istifadə olunur. Nüvə, divar və təməl kimi elementlərdə onun sərtliyi və kütləsi faydalı ola bilər. Eyni kütlə öz çəkisini və təmələ düşən yükü də artırır.

## Polad: incə elementlər və aşırımlar
Polad sütun və tirlər nisbətən incə kəsiklərlə açıq məkanlar qurmağa imkan verə bilər. Seçim yalnız daşıma qabiliyyətinə görə edilmir: əyilmə, titrəyiş, korroziyadan qorunma və yanğın zamanı davranış da qiymətləndirilir.

## Mühəndislik ağacı: elementə uyğun məhsul
CLT çarpaz laylı taxta panelləri, glulam isə yapışdırılmış laylı ağac elementlərini ifadə edir. Onlar bir-birinin avtomatik əvəzi deyil. Panel, tir və sütunun funksiyası məhsulun seçilməsinə təsir edir.

## Bütöv həlli müqayisə edin
Materialların birləşməsi, təchizatı, montajı və qorunması layihənin tərkib hissəsidir. Ən yaxşı kombinasiya materialların adından deyil, konkret yük sxemi və istifadə tələblərindən asılıdır.`,
`Material selection in a hybrid project starts with the task of each element. Rather than declaring one material best for the whole building, the team evaluates options for the core, frame, floors and foundations together.

## Reinforced concrete: mass and stiffness
Concrete carries compression, while reinforcement allows reinforced-concrete elements to address a wider range of actions. Its stiffness and mass can be useful in cores, walls and foundations. That mass also contributes to self-weight and foundation loads.

## Steel: slender elements and spans
Steel columns and beams can support open spaces with relatively slender sections. Strength is only part of the decision: deflection, vibration, corrosion protection and behaviour in fire also need assessment.

## Engineered timber: choose the right product
CLT means cross-laminated timber panels; glulam refers to glued-laminated timber elements. They are not automatically interchangeable. The intended role as a panel, beam or column influences product selection.

## Compare complete solutions
Connections, procurement, assembly and protection belong in the comparison. A promising material combination may create demanding interfaces. The appropriate solution therefore follows the actual load arrangement and use requirements, rather than the appeal of particular material names.`,
`Die Materialwahl im Hybridbau beginnt mit der Aufgabe jedes Bauteils. Statt einen Baustoff für das gesamte Gebäude zum besten zu erklären, werden Varianten für Kern, Rahmen, Decken und Fundamente gemeinsam bewertet.

## Stahlbeton: Masse und Steifigkeit
Beton nimmt Druckkräfte auf; mit Bewehrung können Stahlbetonbauteile weitere Beanspruchungen abtragen. Steifigkeit und Masse können bei Kernen, Wänden und Fundamenten vorteilhaft sein. Die Masse erhöht allerdings auch Eigengewicht und Fundamentlasten.

## Stahl: schlanke Bauteile und Spannweiten
Stahlstützen und -träger können offene Räume mit vergleichsweise schlanken Querschnitten ermöglichen. Neben der Tragfähigkeit sind Durchbiegung, Schwingungen, Korrosionsschutz und Brandverhalten zu betrachten.

## Holzprodukte passend auswählen
CLT bezeichnet Brettsperrholz, Glulam Brettschichtholz. Beide Produkte sind nicht beliebig austauschbar. Die Funktion als Platte, Träger oder Stütze beeinflusst die Auswahl.

## Gesamtlösungen vergleichen
Anschlüsse, Beschaffung, Montage und Schutzmaßnahmen gehören zur Bewertung. Eine vielversprechende Materialkombination kann anspruchsvolle Schnittstellen mit sich bringen. Die geeignete Lösung folgt deshalb der tatsächlichen Lastabtragung und Nutzung, nicht allein den bevorzugten Baustoffen.`,
`Выбор материалов в гибридном проекте начинается с задачи каждого элемента. Вместо поиска одного лучшего материала для всего здания совместно оценивают варианты ядра, каркаса, перекрытий и фундаментов.

## Железобетон: масса и жёсткость
Бетон работает на сжатие, а армирование позволяет железобетонным элементам воспринимать другие воздействия. Жёсткость и масса могут быть полезны в ядрах, стенах и фундаментах. При этом масса увеличивает собственный вес и нагрузки на основание.

## Сталь: тонкие элементы и пролёты
Стальные колонны и балки позволяют формировать открытые пространства с относительно небольшими сечениями. Помимо прочности оценивают прогибы, вибрации, защиту от коррозии и поведение при пожаре.

## Инженерная древесина: подходящий продукт
CLT — это перекрёстно-клеёные деревянные панели, glulam — клеёные деревянные элементы из ламелей. Эти продукты не являются автоматически взаимозаменяемыми. Выбор зависит от работы элемента как панели, балки или колонны.

## Сравнивайте решения целиком
Соединения, поставки, монтаж и защитные меры входят в оценку. Перспективное сочетание материалов может потребовать сложных узлов. Поэтому подходящую комбинацию определяют реальная схема нагрузок и требования эксплуатации, а не привлекательность названий материалов.`],
  },
  {
    id: 'core', category: 'technology', source: 'Hibrid binalar.pdf, p. 2',
    reference: ['Steel Construction Institute: Concept design', 'https://steelconstruction.info/topics/design/concept-design'],
    slugs: ['demir-beton-nuve-polad-karkas', 'concrete-core-steel-frame', 'stahlbetonkern-und-stahlrahmen', 'zhelezobetonnoe-yadro-stalnoj-karkas'],
    titles: ['Dəmir-beton nüvə və polad karkas necə işləyir?', 'How a concrete core and steel frame work together', 'Stahlbetonkern und Stahlrahmen im Zusammenspiel', 'Как работают железобетонное ядро и стальной каркас'],
    descriptions: ['Dəmir-beton nüvə ilə polad karkasın vəzifələri, üfüqi və şaquli yüklər, birləşmələr və montaj koordinasiyası haqqında praktik izah.', 'Understand the roles of a concrete core and steel frame, including lateral stability, gravity loads, connections and coordinated construction.', 'Stahlbetonkern und Stahlrahmen: Lastabtragung, Aussteifung, Anschlüsse und Montageablauf als zusammenhängende Planungsaufgabe erklärt.', 'Железобетонное ядро и стальной каркас: вертикальные и горизонтальные нагрузки, соединения и согласование последовательности строительства.'],
    alts: ['Polad tirlərlə əhatə olunmuş beton nüvənin konseptual görünüşü', 'Concept view of a concrete core surrounded by steel beams', 'Konzeptansicht eines Betonkerns mit angrenzenden Stahlträgern', 'Концептуальный вид бетонного ядра со стальными балками'],
    bodies: [
`Dəmir-beton nüvə ilə polad karkasın kombinasiyası müxtəlif materiallara fərqli konstruktiv vəzifələr verməyə imkan yaradır. Sistem yalnız “beton sərtlik, polad aşırım” düsturu ilə izah olunmur: onların arasındakı yük ötürülməsi də layihələndirilməlidir.

## Nüvənin rolu
Nüvə lift və pilləkən zonalarını əhatə edə və binanın külək kimi üfüqi təsirlərə qarşı müqavimətində iştirak edə bilər. Onun plandakı yeri ümumi konstruktiv davranışa təsir edir. Ölçülər və mövqe memarlıq planı ilə birlikdə həll olunur.

## Karkasın rolu
Polad sütun və tirlər mərtəbələrdən gələn şaquli yükləri daşıya bilər. Döşəmə sisteminin nüvə ilə əlaqəsi üfüqi qüvvələrin ötürülməsində əhəmiyyətlidir. Bu əlaqə sadəcə plan üzərində elementlərin toxunması demək deyil.

## Birləşmə və tikinti ardıcıllığı
Polad tirlərin betona bağlandığı nöqtələrdə qüvvələr, toleranslar və deformasiya uyğunluğu nəzərə alınır. Beton işləri ilə polad istehsalının vaxtı uyğunlaşdırılmalıdır. Son vəziyyətdə dayanıqlı olan sistem montajın hər mərhələsində ayrıca qiymətləndirilir.

## Erkən koordinasiya
Memar, konstruktor və mühəndislik sistemləri üzrə komanda şaxtaları, keçidləri və əsas birləşmələri erkən razılaşdırmalıdır. Bu, hazır elementlərdə gec dəyişiklik ehtiyacını azaltmağa kömək edir.`,
`A concrete core and steel frame allow different materials to perform distinct structural tasks. The solution is more than “concrete for stiffness, steel for spans”: the transfer of forces between them must also be designed.

## The core's role
The core may contain lift and stair zones and contribute to resistance against lateral actions such as wind. Its position in plan affects the building's overall behaviour. Its dimensions and location therefore need coordination with the architectural layout.

## The frame's role
Steel columns and beams may carry gravity loads from the floors. The connection between the floor system and the core is important for transferring horizontal forces. Elements touching on a drawing does not establish a working load path.

## Connections and construction sequence
Where steel beams meet concrete, the design must account for forces, tolerances and compatible movements. Concrete works and steel fabrication need a coordinated programme. A stable completed structure still requires assessment at intermediate assembly stages.

## Coordinate early
Architects, structural engineers and building-services designers should agree shafts, penetrations and key connections early. This helps reduce late changes to fabricated elements and keeps the architectural intent aligned with a buildable structural arrangement.`,
`Ein Stahlbetonkern und ein Stahlrahmen können unterschiedliche konstruktive Aufgaben übernehmen. Die Lösung umfasst mehr als „Beton für Steifigkeit, Stahl für Spannweiten“: Auch die Kraftübertragung zwischen beiden muss geplant werden.

## Aufgabe des Kerns
Der Kern kann Aufzüge und Treppen aufnehmen und zur Aufnahme horizontaler Einwirkungen, etwa aus Wind, beitragen. Seine Lage im Grundriss beeinflusst das Gesamtverhalten. Abmessungen und Position sind deshalb mit der Architektur abzustimmen.

## Aufgabe des Rahmens
Stahlstützen und -träger können die vertikalen Deckenlasten abtragen. Für horizontale Kräfte ist die Verbindung zwischen Deckensystem und Kern bedeutsam. Sich berührende Bauteile im Plan ergeben noch keinen funktionierenden Lastweg.

## Anschlüsse und Bauablauf
An den Übergängen zwischen Stahlträgern und Beton sind Kräfte, Toleranzen und unterschiedliche Verformungen zu berücksichtigen. Betonarbeiten und Stahlfertigung benötigen einen abgestimmten Ablauf. Auch ein im Endzustand stabiles Tragwerk muss während der Montage überprüft werden.

## Frühzeitig koordinieren
Architektur, Tragwerksplanung und Gebäudetechnik sollten Schächte, Durchdringungen und wesentliche Anschlüsse früh abstimmen. So lassen sich späte Änderungen an bereits gefertigten Bauteilen eher vermeiden und Entwurf und Ausführung miteinander verbinden.`,
`Сочетание железобетонного ядра и стального каркаса позволяет распределить конструктивные задачи между материалами. Схема сложнее формулы «бетон для жёсткости, сталь для пролётов»: передачу усилий между ними тоже необходимо проектировать.

## Задача ядра
Ядро может включать лифтовые и лестничные зоны и участвовать в сопротивлении горизонтальным воздействиям, например ветру. Его положение в плане влияет на работу всего здания. Размеры и расположение согласуют с архитектурной планировкой.

## Задача каркаса
Стальные колонны и балки могут воспринимать вертикальные нагрузки от перекрытий. Связь перекрытия с ядром важна для передачи горизонтальных усилий. Простого соприкосновения элементов на чертеже для этого недостаточно.

## Узлы и последовательность строительства
В местах соединения балок с бетоном учитывают усилия, допуски и совместимость деформаций. Бетонные работы и изготовление стали требуют согласованного графика. Устойчивую завершённую систему отдельно проверяют на промежуточных стадиях монтажа.

## Ранняя координация
Архитекторы, конструкторы и проектировщики инженерных систем должны заранее согласовать шахты, отверстия и основные соединения. Это помогает сократить поздние изменения уже изготовленных элементов и связать архитектурное решение с технологией строительства.`],
  },
  {
    id: 'timber', category: 'technology', source: 'Hibrid binalar.pdf, p. 2',
    reference: ['ASCE: Timber-Concrete Composites', 'https://ascelibrary.org/doi/10.1061/9780784479117.201'],
    slugs: ['taxta-beton-kompozit-doseme', 'timber-concrete-composite-floors', 'holz-beton-verbunddecken', 'derevo-betonnye-kompozitnye-perekrytiya'],
    titles: ['Taxta-beton döşəmələr: birgə işin əsas şərti', 'Timber–concrete floors: what makes them composite?', 'Holz-Beton-Verbunddecken: Was den Verbund ausmacht', 'Деревобетонные перекрытия: условие совместной работы'],
    descriptions: ['Taxta üzərində beton qat nə zaman kompozit sistem yaradır? Bağlantıların rolu, sərtlik, əlavə çəki və tikinti nəmliyinə dair əsas məqamlar.', 'When does concrete over timber form a composite floor? Explore shear connections, stiffness, added weight and construction moisture considerations.', 'Wann entsteht eine Holz-Beton-Verbunddecke? Schubverbindungen, Steifigkeit, zusätzliches Gewicht und Baufeuchte verständlich erläutert.', 'Когда бетонный слой над древесиной образует композитное перекрытие? Роль сдвиговых связей, жёсткости, дополнительной массы и строительной влаги.'],
    alts: ['Taxta və beton qatları göstərən döşəmə konseptinin material kəsiyi', 'Concept material section of a timber and concrete floor', 'Konzeptioneller Materialquerschnitt einer Holz-Beton-Decke', 'Концептуальный разрез перекрытия со слоями древесины и бетона'],
    bodies: [
`Taxta-beton döşəmə ideyası iki materialın fərqli xüsusiyyətlərini bir araya gətirir. Ağac aşağı hissədə yüngül daşıyıcı element kimi, beton isə əlavə kütlə və sərtlik verən qat kimi istifadə oluna bilər. Lakin hər taxta üzərində beton qat kompozit sistem deyil.

## Birgə işi bağlantı təmin edir
Kompozit davranış üçün materiallar arasında qüvvə ötürülməsi nəzərdə tutulmalıdır. Bağlantılar qatların bir-birinə nəzərən sürüşməsini məhdudlaşdırır. Onların növü və yerləşməsi konstruktor tərəfindən hesablanır; universal detal bütün layihələr üçün uyğun deyil.

## Üstünlükləri əlavə yüklə birlikdə hesablayın
Beton qat sərtlik və akustik həll baxımından imkanlar yarada bilər. Bununla yanaşı, öz çəkisini artırır və alt daşıyıcı elementlərə təsir edir. Nəticə qatların qalınlığından, aşırımdan və bağlantı sistemindən asılıdır.

## Tikinti mərhələsini unutmayın
Yaş betonun yükü, montaj dayaqları, ağacın nəmdən qorunması və quruma ardıcıllığı planlaşdırılmalıdır. İstismar mərhələsində gözlənən nəticə tikinti dövründəki şərtlərin nəzərə alınmasını da tələb edir.

## Qərar üçün yoxlama siyahısı
- Sistem həqiqətən kompozit hesablanıbmı?
- Əlavə yük və deformasiya yoxlanılıbmı?
- Nəmlik və akustika detalları uyğunlaşdırılıbmı?
- Mühəndislik keçidləri əvvəlcədən planlaşdırılıbmı?`,
`A timber–concrete floor brings together materials with different properties. Timber can form a relatively light supporting element, while concrete adds mass and stiffness. However, a concrete layer above timber is not automatically a composite system.

## Connections establish combined action
Composite behaviour requires a designed transfer of forces between the materials. Connections limit relative slip between the layers. Their type and arrangement require structural design; a single generic detail is not suitable for every project.

## Evaluate benefits alongside added loads
The concrete layer may create opportunities for stiffness and acoustic performance. It also adds self-weight and affects the supporting structure. The outcome depends on layer thicknesses, span and the connection system.

## Include the construction stage
Wet-concrete loads, temporary supports, protection of timber from moisture and the drying sequence need planning. Achieving the intended in-service behaviour depends partly on conditions during construction.

## Questions before selecting the system
- Has composite action actually been designed?
- Have added loads and deformations been checked?
- Are moisture and acoustic details coordinated?
- Have building-services penetrations been planned?

Assess the complete floor assembly and its interfaces rather than assuming that combining two materials will automatically improve every aspect of performance.`,
`Eine Holz-Beton-Decke verbindet Materialien mit unterschiedlichen Eigenschaften. Holz kann ein vergleichsweise leichtes tragendes Element bilden, während Beton Masse und Steifigkeit ergänzt. Eine Betonschicht auf Holz ist jedoch nicht automatisch eine Verbundkonstruktion.

## Verbindungen ermöglichen den Verbund
Das gemeinsame Tragverhalten setzt eine geplante Kraftübertragung zwischen den Materialien voraus. Verbindungen begrenzen die gegenseitige Verschiebung der Schichten. Art und Anordnung müssen bemessen werden; ein allgemeines Detail passt nicht zu jedem Projekt.

## Vorteile und Zusatzlasten zusammen bewerten
Die Betonschicht kann Möglichkeiten für Steifigkeit und Schallschutz eröffnen. Gleichzeitig erhöht sie das Eigengewicht und beansprucht die darunterliegende Konstruktion. Das Ergebnis hängt von Schichtdicken, Spannweite und Verbindungssystem ab.

## Den Bauzustand berücksichtigen
Frischbetonlasten, temporäre Unterstützung, Feuchteschutz des Holzes und Trocknungsablauf sind zu planen. Das spätere Verhalten hängt auch von den Bedingungen während der Herstellung ab.

## Fragen vor der Systemwahl
- Ist die Verbundwirkung tatsächlich bemessen?
- Sind Zusatzlasten und Verformungen geprüft?
- Sind Feuchte- und Schallschutzdetails abgestimmt?
- Sind Installationsdurchführungen eingeplant?

Bewertet werden sollte der vollständige Deckenaufbau einschließlich seiner Anschlüsse. Zwei Materialien gemeinsam einzusetzen verbessert nicht automatisch jede Eigenschaft.`,
`Деревобетонное перекрытие объединяет материалы с разными свойствами. Древесина может служить относительно лёгким несущим элементом, а бетон добавлять массу и жёсткость. Однако бетонный слой поверх древесины ещё не создаёт композитную систему.

## Совместную работу обеспечивают связи
Для композитного поведения необходима расчётная передача усилий между материалами. Соединения ограничивают взаимное скольжение слоёв. Их тип и расположение определяет конструктор: универсальный узел не подходит всем проектам.

## Сопоставляйте преимущества и нагрузку
Бетонный слой может улучшить возможности по жёсткости и акустике. Одновременно он увеличивает собственный вес и нагрузку на нижележащую конструкцию. Результат зависит от толщины слоёв, пролёта и системы соединений.

## Учитывайте стадию строительства
Нужно планировать нагрузку свежего бетона, временные опоры, защиту древесины от влаги и порядок высыхания. Ожидаемая работа при эксплуатации зависит и от условий изготовления.

## Вопросы перед выбором системы
- Рассчитана ли композитная работа?
- Проверены ли дополнительные нагрузки и деформации?
- Согласованы ли защита от влаги и акустические решения?
- Предусмотрены ли проходы инженерных систем?

Оценивать следует перекрытие целиком, включая примыкания. Само сочетание двух материалов не означает автоматического улучшения всех характеристик.`],
  },
];

export default articles;
