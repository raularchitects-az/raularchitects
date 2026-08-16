import type { BlogPost } from "../types";

export const ucdVizualizasiyaMemarliqLayihesi: BlogPost = {
  slug: "3d-vizualizasiya-memarliq-layihesi",
  publishedAt: "2026-08-16",
  image: "/images/blog/3d-vizualizasiya-memarliq-layihesi.webp",
  imageAlt: {
    az: "Villa memarlıq layihəsinin 3D vizualizasiyası — tikintidən əvvəl render",
    en: "3D visualization of a villa architectural project — render before construction",
    ru: "3D-визуализация архитектурного проекта виллы — рендер до строительства",
    de: "3D-Visualisierung eines Villa-Architekturprojekts — Rendering vor dem Bau",
  },
  category: "visualization",
  serviceSlug: "bim-ile-layihelendirme",
  relatedHrefs: ["/xidmetler/bim-ile-layihelendirme", "/layihelar"],
  copy: {
    az: {
      title: "Evi tikməzdən əvvəl 3D vizualizasiya: render BIM-dən nə ilə fərqlənir?",
      seoTitle: "3D vizualizasiya memarlıq layihəsində | Bakı | Raul Architects",
      description:
        "Bakıda ev tikməzdən əvvəl 3D render və BIM modelini necə ayırmaq, müştərinin nəyi tələb etməli olduğu və Absheron işığında fasad materialını necə yoxlamaq.",
      excerpt:
        "Gözəl şəkil hələ tikilə bilən layihə deyil. 3D vizualizasiya qərar vasitəsidir; BIM isə o qərarın ölçüyə və çertyojlara bağlanmasıdır.",
      ctaLabel: "BIM memarlığı xidmətinə baxın",
      ctaText:
        "Renderin çertyojla eyni həqiqətdən çıxmasını istəyirsinizsə, Raul Architects-in BIM memarlığı xidməti ilə vizualizasiyanı modelə bağlayın.",
      blocks: [
        {
          type: "p",
          text: "Bakıda və Abşeronda ev və ya villa tikdirməyə hazırlaşan ailələrin çoxu əvvəlcə şəkil istəyir: fasad necə görünəcək, qonaq otağı axşam işığında necə duracaq, həyət hovuzu gün batımında necə duracaq. Bu tələb başa düşüləndir. Kağız planı oxumaq hamıya asan gəlmir. 3D vizualizasiya isə qərarı gözə gətirir. Problem odur ki, bazarda “gözəl şəkil” çox vaxt layihədən ayrı satılır: render bir studiyada çəkilir, çertyoj başqa yerdə, sahə isə üçüncü reallıqda icra olunur.",
        },
        {
          type: "p",
          text: "Bu məqalə vizualizasiyanı reklam etmək üçün yazılmayıb. Məqsəd odur ki, torpaq sahibi render ilə BIM modelini qarışdırmasın, tikilməyən detalı vaxtında görsün və Abşeronun kəskin işığında, tozunda və küləyində material qərarını şəkilə görə yox, tikinti həqiqətinə görə versin. Əgər siz artıq [BIM memarlığı](/xidmetler/bim-ile-layihelendirme) xidmətinə baxırsınızsa, aşağıdakı fərqlər müqaviləni düzgün yazmağa kömək edəcək.",
        },
        {
          type: "h2",
          text: "Render və BIM model eyni şey deyil",
        },
        {
          type: "p",
          text: "Render — işıq, material və kameranın qurulduğu təsvirdir. Onun vəzifəsi atmosfer yaratmaqdır: səhər işığı, axşam lampası, yaşıl ağac, təmiz şüşə. BIM model isə binanın məlumatıdır: divar qalınlığı, pəncərə açılışı, merdiven addımı, tavan hündürlüyü, fasadın real kəsiyi. Yaxşı prosesdə render BIM-dən və ya ən azı eyni ölçülü memarlıq modelindən kəsilir. Pis prosesdə isə vizualizator “gözəl ev” çəkir, memar sonra o şəkli çertyojə sığdırmağa çalışır və çox vaxt sığdırmır.",
        },
        {
          type: "p",
          text: "Fərqi sadə yoxlama ilə görün. Renderdə şüşə məhəccər 12 millimetr görünür, amma planda 80 millimetrlik metal profil var. Renderdə dam nazik xətt kimidir, kəsikdə isə izolyasiya, su yalıtımı və havalandırma boşluğu 40 santimetr tutur. Renderdə konsol 4 metr “havada durur”, konstruksiya isə onu daşıya bilmir və ya fasadı pozan dayaq tələb edir. Şəkil yalan danışmır; o, sadəcə başqa suala cavab verir. Sual “necə hiss olunacaq?”dır. Tikinti sualı isə “bunu necə hörəcəyik?”dir.",
        },
        {
          type: "h2",
          text: "Müştəri vizualizasiyada nəyi tələb etməlidir?",
        },
        {
          type: "p",
          text: "Müqavilədə “3D olacaq” yazmaq kifayət deyil. Bakıda villa və fərdi ev sifarişində ən təhlükəli boşluq məhz budur: ailə beş gözəl kadr alır, amma o kadrların hansı çertyoj versiyasından çıxdığı yazılmır. Sonra fasad daşı dəyişir, pəncərə profili ucuzlaşır, hovuzun kənarı qısaldılır — şəkil isə köhnə qalır və hamı “elə bu olacaq” deyə tikintiyə gedir.",
        },
        {
          type: "ul",
          items: [
            "Renderin hansı model versiyasından kəsildiyi yazılıb: tarix, LOD və çertyoj dəsti.",
            "Pəncərə, parapet, konsol və şüşə məhəccər ölçüləri plandakı ilə eyni rəqəmdir.",
            "Fasad materialı kataloq adı və qalınlığı ilə göstərilib, “oxşar daş” deyil.",
            "Gecə kadrı real işıq sxeminə əsaslanır: fasad spotu, gizli LED, bağ lampası.",
            "Dəyişiklik olanda render yenilənir və ya “köhnə kadr” deyə işarələnir.",
          ],
        },
        {
          type: "p",
          text: "Bu siyahı bürokratiya üçün deyil. Sahədə mübahisə adətən dad məsələsi kimi başlayır və ölçü məsələsi kimi bitir. Əgər şəkil və çertyoj eyni həqiqətdəndirsə, podratçı “rəsmdə belə idi” deyə qaçış yolu tapa bilməz. Raul Architects-də vizualizasiya ayrıca suvenir deyil; o, modeldən çıxan qərar vasitəsidir və [layihələr](/layihelar) kataloqunda gördüyünüz villa tipologiyaları da eyni intizamla torpağa oturdulur.",
        },
        {
          type: "h2",
          text: "“Gözəl şəkil, tikilməyən detal” harada yaranır?",
        },
        {
          type: "p",
          text: "Ən çox rast gəlinən tələ birincisi şüşədir. Vizualizator bütün fasadı güzgü kimi çəkir, çünki şüşə kamerada bahalı görünür. Abşeronda isə qərbə baxan böyük şüşə yayda otağı sobalayır, qışda isə külək və toz şüşəni daim çirkləndirir. İkinci tələ daş qalınlığıdır: renderdə 2 santimetrlik kafel “mərmər monoliti” kimi durur. Hörgü və yapışqan reallığında künc, parapet və pəncərə altlığı o effekti vermir. Üçüncü tələ yaşıllıqdır: şəkildəki yetkin zeytun və sərv ağacı beş ildən sonra gələcək, birinci ildə isə həyət boş və tozlu görünəcək.",
        },
        {
          type: "p",
          text: "Dördüncü tələ interyer tavanıdır. Renderdə tavan 3.40, gizli işıq, tikişsiz alçıpan. Planda isə havalandırma kanalı, sprinkler və tavan qutusu qalır; real hündürlük 2.75-ə enir. Beşinci tələ hovuz kənarıdır: şəkil sonsuz su güzgüsü göstərir, kəsikdə isə daşqın oluğu, texniki otaq və hasar norması unudulur. Altıncı tələ qapı və pərdadır: vizualizasiyada pərdə yoxdur, çünki “təmiz memarlıq” istəyirlər; Bakı mənzilində və villasında isə qərb günəşi pərdə və ya xarici kölgə olmadan yaşamağa imkan vermir.",
        },
        {
          type: "h3",
          text: "Bakı işığı və iqlimi vizualı necə yalançı edir",
        },
        {
          type: "p",
          text: "Avropa studiyalarının standart HDRI-si Abşeron günəşi deyil. Bakıda yay işığı sərt, kölgə qısa, səma çox vaxt tozlu-ağdır. Qışda isə külək və rütubət fasadın rəngini dəyişir: tünd gips solur, açıq daş daha tez kirəclənir, metal korkuluk isə dənizə yaxın zonada korroziyaya daha tez gedir. Ona görə “İtaliya villası” palitrasını birbaşa Mərdəkan və ya Şüvəlan həyətinə köçürmək təhlükəlidir. Vizualizasiya yerli işıqda, yerli tozda və yerli gün bucağında yenidən qurulmalıdır. Əks halda siz Avropa axşamını alırsınız, tikirsiniz isə Xəzər günortasını.",
        },
        {
          type: "h2",
          text: "Fasad və material qərarını vizualizasiya ilə necə vermək",
        },
        {
          type: "p",
          text: "Düzgün istifadə belədir: əvvəlcə plan və kəsik təsdiqlənir, sonra iki-üç fasad variantı eyni kameradan, eyni saatda render olunur. Birinci variant açıq əhəngdaşı və taxta kölgəlik, ikinci tünd gips və alüminium panjur, üçüncü kərpic və dərin lojiya. Müştəri “hansı daha gözəldir?” yox, “hansı yayda oturmağa imkan verir?” sualını verir. Bakıda bu sual şəkildən daha vacibdir, çünki terrası iyulda istifadə etmək fasadın Instagram kadrından bahadır.",
        },
        {
          type: "p",
          text: "Material üçün ən azı bir yaxın kadr tələb edin: daşın küncü, pəncərə profilinin qalınlığı, parapetin su axını, balkonun döşəmə yamacı. Uzaq kadr evi satır; yaxın kadr evi tikdirir. Rəng üçün isə telefon ekranına etibar etməyin. Ofisdə çap, sahədə nümunə, günorta və axşam iki baxış. Abşeron işığında bej daş sarıya, boz gips göyümtülə çala bilər. Bu, dad yox, fizikadır.",
        },
        {
          type: "h2",
          text: "Vizualizasiya prosesdə harada dayanmalıdır?",
        },
        {
          type: "p",
          text: "Konsept mərhələsində bir-iki atmosfer kadri kifayətdir: həcm, həyət, giriş. Detallı memarlıq modelindən sonra isə qərar kadrları gəlir — fasad, mətbəx, merdiven, teras. İcazə və işçi çertyojlardan sonra “satış renderi”nə ehtiyac olsa belə, o kadr köhnə modeldən yox, son versiyadan kəsilməlidir. Əks halda marketinq şəkli sahənin düşməninə çevrilir: ailə şəkli göstərir, ustə çertyojı, nəticə mübahisədir.",
        },
        {
          type: "p",
          text: "Nəticə sadədir. 3D vizualizasiya Bakıda ev tikməzdən əvvəl lazımdır, amma o, BIM-in əvəzi deyil. Şəkil hissi göstərir, model isə tikintini. İkisini eyni komandada, eyni ölçüdə saxlayın. Onda fasad daşı, şüşə və teras Abşeron işığında da yaşamaq üçün seçilmiş olar, təkcə ekranda yox.",
        },
      ],
    },
    en: {
      title: "3D visualisation before you build: how renders differ from a BIM model",
      seoTitle: "3D visualisation in an architectural project | Baku | Raul Architects",
      description:
        "How to separate 3D renders from a BIM model before building a house in Baku, what clients should demand, and how to test façade materials in Absheron light.",
      excerpt:
        "A handsome picture is not a buildable project. Visualisation is a decision tool; BIM is how that decision is tied to drawings.",
      ctaLabel: "See BIM architecture services",
      ctaText:
        "If you want renders that come from the same truth as the drawings, bind visualisation to the model through Raul Architects’ BIM architecture service.",
      blocks: [
        {
          type: "p",
          text: "Families preparing to build a house or villa in Baku and on the Absheron peninsula usually ask for pictures first: how the façade will look, how the living room will sit in evening light, how a courtyard pool will read at sunset. The request is fair. Not everyone reads a paper plan. 3D visualisation makes a decision visible. The market problem is that a “pretty picture” is often sold apart from the project: a studio renders, another office draws, and the site builds a third reality.",
        },
        {
          type: "p",
          text: "This article is not a sales pitch for images. Landowners should stop mixing a render with a BIM model, catch unbuildable details early, and choose materials for Absheron’s hard light, dust and wind rather than for a screen. If you are already reviewing our [BIM architecture](/xidmetler/bim-ile-layihelendirme) service, the distinctions below will help you write the brief and the contract.",
        },
        {
          type: "h2",
          text: "A render and a BIM model are not the same thing",
        },
        {
          type: "p",
          text: "A render is an image built from light, materials and a camera. Its job is atmosphere: morning sun, an evening lamp, a mature tree, clean glass. A BIM model is building information: wall thickness, window openings, stair risers, ceiling height, the real façade section. In a sound process the render is cut from BIM, or at least from the same measured architectural model. In a weak process a visualiser draws a beautiful house and the architect later tries to squeeze that image onto drawings — and often cannot.",
        },
        {
          type: "p",
          text: "A simple check shows the gap. The render shows a 12-millimetre glass balustrade; the plan has an 80-millimetre metal profile. The roof is a thin line in the picture; the section needs 40 centimetres of insulation, waterproofing and a ventilation gap. A four-metre cantilever “floats”; structure cannot carry it without a prop that ruins the façade. The image is not lying. It answers a different question: how will it feel? Construction asks how we will build it.",
        },
        {
          type: "h2",
          text: "What a client should demand from visualisation",
        },
        {
          type: "p",
          text: "Writing “there will be 3D” into a Baku villa contract is not enough. The dangerous gap is this: the family receives five handsome frames, but nobody records which drawing issue they came from. Then the stone changes, the window profile is cheapened, the pool edge is shortened — the picture stays old, and everyone walks onto site saying “it will be like this”.",
        },
        {
          type: "ul",
          items: [
            "Each render is tagged to a model version: date, LOD and drawing set.",
            "Windows, parapets, cantilevers and glass rails match the numbers on the plan.",
            "Façade materials are named from a catalogue, with thickness, not “similar stone”.",
            "Night shots follow a real lighting scheme: façade spots, cove LEDs, garden lamps.",
            "When the design changes, frames are updated or clearly marked as obsolete.",
          ],
        },
        {
          type: "p",
          text: "The list is not bureaucracy. Site arguments start as taste and end as millimetres. If picture and drawing share one truth, a contractor cannot hide behind “it was like that in the image”. At Raul Architects visualisation is not a souvenir; it is a decision cut from the model, in the same discipline used when villa types from the [projects](/layihelar) catalogue are fitted to a real plot.",
        },
        {
          type: "h2",
          text: "Where “pretty picture, unbuildable detail” comes from",
        },
        {
          type: "p",
          text: "Glass is the first trap. Visualisers mirror the whole façade because glass looks expensive on camera. On Absheron a west-facing glass wall cooks the room in summer and collects wind-blown dust in winter. The second trap is stone thickness: a two-centimetre tile reads as a marble monolith. In real masonry the corner, parapet and window cill will not hold that effect. The third trap is planting: the mature olive and cypress in the frame will arrive in five years; in year one the yard is empty and dusty.",
        },
        {
          type: "p",
          text: "The fourth trap is the interior ceiling. The render shows 3.40 metres, hidden light, seamless plasterboard. The plan still has a duct, a sprinkler and a bulkhead; clear height drops to 2.75. The fifth is the pool edge: an infinite water mirror, while the section forgot the overflow channel, plant room and fence rules. The sixth is curtains: “pure architecture” with bare glass, though Baku sun on a west room is unliveable without shade or external blinds.",
        },
        {
          type: "h3",
          text: "How Baku light and climate make images dishonest",
        },
        {
          type: "p",
          text: "A European studio HDRI is not Absheron sun. Summer light in Baku is hard, shadows are short, the sky is often dusty white. In winter wind and humidity shift façade colour: dark render fades, light stone calcifies faster, metal rails corrode sooner near the Caspian. Copying an “Italian villa” palette onto a yard in Mardakan or Shuvelan is therefore risky. Visualisation must be rebuilt in local light, local dust and local sun angles. Otherwise you buy a European evening and build a Caspian noon.",
        },
        {
          type: "h2",
          text: "Using visualisation to decide materials and façades",
        },
        {
          type: "p",
          text: "The right sequence is: freeze plan and section first, then render two or three façades from the same camera at the same hour. One option pale limestone and timber shading, one dark render and aluminium shutters, one brick and deep loggias. The client should not ask which is prettier, but which can be sat in during July. In Baku that question beats an Instagram still, because a usable terrace is worth more than a handsome frame.",
        },
        {
          type: "p",
          text: "Ask for at least one close shot: the stone corner, the window-frame thickness, the parapet drip, the balcony fall. The distant frame sells the house; the close frame builds it. Do not trust colour on a phone. Print in the office, sample on site, look at noon and at dusk. In Absheron light beige stone can go yellow and grey render can go blue. That is physics, not taste.",
        },
        {
          type: "h2",
          text: "Where visualisation belongs in the process",
        },
        {
          type: "p",
          text: "At concept, one or two atmosphere frames are enough: massing, courtyard, entrance. After the detailed architectural model come decision frames — façade, kitchen, stair, terrace. Even a later “sales render” must be cut from the latest issue, not from a pretty old file. Otherwise marketing becomes the enemy of the site: the family points at a picture, the foreman at a drawing, and the argument is already lost.",
        },
        {
          type: "p",
          text: "The conclusion is simple. You need 3D visualisation before you build in Baku, but it does not replace BIM. The picture shows feeling; the model shows construction. Keep both in one team and one set of dimensions. Then stone, glass and terrace are chosen to live in Absheron light, not only on a screen.",
        },
      ],
    },
    ru: {
      title: "3D-визуализация до стройки: чем рендер отличается от BIM-модели",
      seoTitle: "3D-визуализация в архитектурном проекте | Баку | Raul Architects",
      description:
        "Как отличить 3D-рендер от BIM-модели до строительства дома в Баку, что требовать заказчику и как проверять фасадные материалы при свете Апшерона.",
      excerpt:
        "Красивая картинка — ещё не строительный проект. Визуализация помогает решить; BIM привязывает решение к чертежам.",
      ctaLabel: "Смотреть услугу BIM-архитектуры",
      ctaText:
        "Если рендеры должны выходить из той же правды, что и чертежи, свяжите визуализацию с моделью через услугу BIM-архитектуры Raul Architects.",
      blocks: [
        {
          type: "p",
          text: "Семьи, которые готовятся строить дом или виллу в Баку и на Апшероне, почти всегда сначала просят картинку: как будет фасад, как сядет гостиная при вечернем свете, как двор с бассейном прочитается на закате. Запрос понятен. Не все читают бумажный план. 3D-визуализация делает решение видимым. Рыночная беда в том, что «красивая картинка» часто продаётся отдельно от проекта: студия рендерит, другой офис чертит, площадка строит третью реальность.",
        },
        {
          type: "p",
          text: "Этот текст не реклама картинок. Владелец участка не должен путать рендер с BIM-моделью, вовремя видеть нестроительную деталь и выбирать материал под жёсткий свет, пыль и ветер Апшерона, а не под экран. Если вы уже смотрите услугу [BIM-архитектуры](/xidmetler/bim-ile-layihelendirme), различия ниже помогут правильно составить задание и договор.",
        },
        {
          type: "h2",
          text: "Рендер и BIM-модель — не одно и то же",
        },
        {
          type: "p",
          text: "Рендер — изображение из света, материалов и камеры. Его задача — атмосфера: утреннее солнце, вечерняя лампа, взрослое дерево, чистое стекло. BIM-модель — информация о здании: толщина стены, проём окна, подступенок лестницы, высота потолка, реальный разрез фасада. В нормальном процессе рендер режется из BIM или хотя бы из той же обмерной архитектурной модели. В слабом визуализатор рисует красивый дом, а архитектор потом пытается втиснуть картинку в чертежи — и часто не может.",
        },
        {
          type: "p",
          text: "Проверка простая. На рендере стеклянное ограждение 12 миллиметров, на плане металлический профиль 80. Крыша на картинке — тонкая линия, в разрезе 40 сантиметров утеплителя, гидроизоляции и вентзазора. Консоль на четыре метра «висит», конструкция её не несёт без стойки, которая ломает фасад. Картинка не врёт. Она отвечает на другой вопрос: как это будет ощущаться. Стройка спрашивает, как это класть.",
        },
        {
          type: "h2",
          text: "Что требовать заказчику от визуализации",
        },
        {
          type: "p",
          text: "Фразы «будет 3D» в договоре на виллу в Баку мало. Опасный зазор такой: семья получает пять красивых кадров, но никто не фиксирует, с какого выпуска чертежей они сняты. Потом меняется камень, дешевеет профиль окна, укорачивается кромка бассейна — картинка стареет, и все выходят на площадку со словами «будет вот так».",
        },
        {
          type: "ul",
          items: [
            "Каждый рендер привязан к версии модели: дата, LOD и комплект чертежей.",
            "Окна, парапеты, консоли и стеклянные ограждения совпадают с цифрами плана.",
            "Материал фасада назван по каталогу, с толщиной, а не «похожий камень».",
            "Ночной кадр следует реальной схеме света: прожекторы, скрытый LED, сад.",
            "При изменении проекта кадры обновляют или явно помечают как устаревшие.",
          ],
        },
        {
          type: "p",
          text: "Список не для бюрократии. Спор на площадке начинается со вкуса и кончается миллиметрами. Если картинка и чертёж из одной правды, подрядчик не спрячется за фразой «на картинке было так». В Raul Architects визуализация — не сувенир, а решение из модели, в той же дисциплине, с которой типы вилл из каталога [проектов](/layihelar) сажают на реальный участок.",
        },
        {
          type: "h2",
          text: "Откуда берётся «красивая картинка / нестроительная деталь»",
        },
        {
          type: "p",
          text: "Первая ловушка — стекло. Визуализатор зеркалит весь фасад, потому что стекло дорого смотрится в камере. На Апшероне западная стеклянная стена летом жарит комнату, зимой собирает пыль с ветра. Вторая — толщина камня: плитка в два сантиметра читается как мраморный монолит. В реальной кладке угол, парапет и подоконник этот эффект не держат. Третья — озеленение: взрослые оливы и кипарисы на кадре придут через пять лет; в первый год двор пустой и пыльный.",
        },
        {
          type: "p",
          text: "Четвёртая ловушка — потолок. На рендере 3,40, скрытый свет, бесшовный гипсокартон. В плане остаются воздуховод, спринклер и короб; чистая высота падает до 2,75. Пятая — кромка бассейна: бесконечное зеркало воды, а в разрезе забыты лоток перелива, техпомещение и нормы ограждения. Шестая — шторы: «чистая архитектура» с голым стеклом, хотя бакинское западное солнце без тени или внешних жалюзи нежилое.",
        },
        {
          type: "h3",
          text: "Как свет и климат Баку делают картинку нечестной",
        },
        {
          type: "p",
          text: "Стандартный европейский HDRI — это не апшеронское солнце. Летом в Баку свет жёсткий, тени короткие, небо часто пыльно-белое. Зимой ветер и влажность меняют цвет фасада: тёмная штукатурка выгорает, светлый камень быстрее покрывается налётом, металл у Каспия быстрее корродирует. Переносить палитру «итальянской виллы» во двор в Мардакяне или Шувеляне поэтому рискованно. Визуализацию нужно собирать заново при местном свете, пыли и угле солнца. Иначе вы покупаете европейский вечер, а строите каспийский полдень. Имеет смысл заказать один и тот же кадр в полдень и на закате: камень, который вечером кажется тёплым, днём может уйти в жёлтый, а тёмное стекло — в плоское зеркало.",
        },
        {
          type: "h2",
          text: "Как решать фасад и материал через визуализацию",
        },
        {
          type: "p",
          text: "Правильная последовательность: сначала утвердить план и разрез, затем с одной камеры в один час просчитать два-три фасада. Первый — светлый известняк и деревянное затенение, второй — тёмная штукатурка и алюминиевые ставни, третий — кирпич и глубокие лоджии. Заказчик спрашивает не «что красивее», а «где можно сидеть в июле». В Баку этот вопрос важнее кадра для Instagram: жилая терраса дороже красивой картинки.",
        },
        {
          type: "p",
          text: "Потребуйте хотя бы один ближний кадр: угол камня, толщина профиля окна, капельник парапета, уклон балкона. Дальний кадр продаёт дом; ближний его строит. Цвету на телефоне не верьте. Печать в офисе, образец на участке, взгляд в полдень и на закате. При апшеронском свете бежевый камень уходит в жёлтый, серая штукатурка — в синеву. Это физика, не вкус.",
        },
        {
          type: "h2",
          text: "Где визуализация стоит в процессе",
        },
        {
          type: "p",
          text: "На концепции хватает одного-двух атмосферных кадров: объём, двор, вход. После детальной архитектурной модели идут кадры решений — фасад, кухня, лестница, терраса. Даже поздний «продающий рендер» должен резаться с последнего выпуска, а не со старого красивого файла. Иначе маркетинг становится врагом площадки: семья показывает картинку, прораб — чертёж, спор уже проигран.",
        },
        {
          type: "p",
          text: "Вывод простой. 3D-визуализация до стройки в Баку нужна, но она не заменяет BIM. Картинка показывает ощущение, модель — строительство. Держите оба в одной команде и в одном размере. Тогда камень, стекло и терраса будут выбраны, чтобы жить при свете Апшерона, а не только на экране.",
        },
      ],
    },
    de: {
      title: "3D-Visualisierung vor dem Bau: worin sich Renderings vom BIM-Modell unterscheiden",
      seoTitle: "3D-Visualisierung im Architekturprojekt | Baku | Raul Architects",
      description:
        "Wie man 3D-Renderings vom BIM-Modell unterscheidet, bevor in Baku gebaut wird, was Bauherren verlangen sollten und wie Fassadenmaterial im Absheron-Licht geprüft wird.",
      excerpt:
        "Ein schönes Bild ist noch kein baubares Projekt. Visualisierung ist ein Entscheidungswerkzeug; BIM bindet die Entscheidung an Pläne.",
      ctaLabel: "BIM-Architektur-Leistungen ansehen",
      ctaText:
        "Wenn Renderings aus derselben Wahrheit kommen sollen wie die Pläne, binden Sie die Visualisierung über die BIM-Architektur von Raul Architects an das Modell.",
      blocks: [
        {
          type: "p",
          text: "Familien, die in Baku und auf der Halbinsel Absheron Haus oder Villa bauen, wollen zuerst Bilder: wie die Fassade wirkt, wie das Wohnzimmer im Abendlicht sitzt, wie ein Hofpool bei Sonnenuntergang lesbar ist. Die Bitte ist fair. Nicht jeder liest Papierpläne. 3D-Visualisierung macht eine Entscheidung sichtbar. Das Marktproblem: ein „hübsches Bild“ wird oft getrennt vom Projekt verkauft. Ein Studio rendert, ein anderes Büro zeichnet, die Baustelle baut eine dritte Wirklichkeit.",
        },
        {
          type: "p",
          text: "Dieser Text verkauft keine Bilder. Grundstückseigentümer sollen Rendering und BIM-Modell nicht verwechseln, unbebaubare Details früh sehen und Materialien für hartes Licht, Staub und Wind Absherons wählen — nicht für den Bildschirm. Wenn Sie bereits unsere [BIM-Architektur](/xidmetler/bim-ile-layihelendirme) prüfen, helfen die Unterschiede unten beim Briefing und Vertrag.",
        },
        {
          type: "h2",
          text: "Rendering und BIM-Modell sind nicht dasselbe",
        },
        {
          type: "p",
          text: "Ein Rendering ist ein Bild aus Licht, Material und Kamera. Seine Aufgabe ist Atmosphäre: Morgensonne, Abendlampe, ausgewachsener Baum, sauberes Glas. Das BIM-Modell ist Gebäudeinformation: Wandstärke, Fensteröffnung, Steigungsverhältnis, Raumhöhe, der echte Fassadenschnitt. Im sauberen Prozess wird das Rendering aus BIM oder mindestens aus demselben vermessenen Architekturmodell geschnitten. Im schwachen zeichnet ein Visualisierer ein schönes Haus, und der Architekt versucht später, das Bild in Pläne zu zwängen — oft ohne Erfolg.",
        },
        {
          type: "p",
          text: "Ein einfacher Check zeigt die Lücke. Das Bild zeigt ein 12-Millimeter-Glasgeländer; der Grundriss hat ein 80-Millimeter-Metallprofil. Das Dach ist eine dünne Linie; der Schnitt braucht 40 Zentimeter Dämmung, Abdichtung und Lüftungsspalt. Ein vier Meter langer Kragarm „schwebt“; das Tragwerk trägt ihn nicht ohne eine Stütze, die die Fassade zerstört. Das Bild lügt nicht. Es beantwortet eine andere Frage: wie fühlt es sich an? Der Bau fragt, wie wir es mauern.",
        },
        {
          type: "h2",
          text: "Was Bauherren von der Visualisierung verlangen sollten",
        },
        {
          type: "p",
          text: "Der Satz „es gibt 3D“ reicht im Villenvertrag in Baku nicht. Die gefährliche Lücke: die Familie bekommt fünf schöne Bilder, aber niemand notiert, aus welcher Planausgabe sie stammen. Dann wechselt der Stein, das Fensterprofil wird billiger, die Poolkante kürzer — das Bild bleibt alt, und alle gehen auf die Baustelle mit dem Satz „so wird es“.",
        },
        {
          type: "ul",
          items: [
            "Jedes Rendering ist an eine Modellversion gebunden: Datum, LOD und Plansatz.",
            "Fenster, Attiken, Kragarme und Glasgeländer stimmen mit den Maßen im Grundriss überein.",
            "Fassadenmaterial ist mit Katalognamen und Dicke benannt, nicht als „ähnlicher Stein“.",
            "Nachtbilder folgen einem echten Lichtkonzept: Fassadenspots, indirektes LED, Garten.",
            "Bei Änderungen werden Bilder aktualisiert oder klar als veraltet markiert.",
          ],
        },
        {
          type: "p",
          text: "Die Liste ist keine Bürokratie. Streit auf der Baustelle beginnt als Geschmack und endet in Millimetern. Teilen Bild und Plan eine Wahrheit, kann sich der Unternehmer nicht hinter „so war es im Bild“ verstecken. Bei Raul Architects ist Visualisierung kein Souvenir, sondern eine Entscheidung aus dem Modell — in derselben Disziplin, mit der Villentypen aus dem [Projektkatalog](/layihelar) auf ein reales Grundstück gesetzt werden.",
        },
        {
          type: "h2",
          text: "Wo „hübsches Bild, unbebaubares Detail“ entsteht",
        },
        {
          type: "p",
          text: "Glas ist die erste Falle. Visualisierer spiegeln die ganze Fassade, weil Glas in der Kamera teuer wirkt. Auf Absheron kocht eine westliche Glaswand den Raum im Sommer und sammelt im Winter Staub vom Wind. Die zweite Falle ist Steinstärke: eine Zwei-Zentimeter-Fliese liest sich als Marmorblock. In echter Mauerwerksecke, Attika und Fensterbank hält der Effekt nicht. Die dritte ist Bepflanzung: der reife Ölbaum im Bild kommt in fünf Jahren; im ersten Jahr ist der Hof leer und staubig.",
        },
        {
          type: "p",
          text: "Die vierte Falle ist die Decke. Das Rendering zeigt 3,40 Meter, verstecktes Licht, fugenlose Gipskartonfläche. Im Plan bleiben Kanal, Sprinkler und Vorsatzschale; die lichte Höhe fällt auf 2,75. Die fünfte ist die Poolkante: unendlicher Wasserspiegel, im Schnitt fehlen Überlaufrinne, Technikraum und Zaunvorschrift. Die sechste sind Vorhänge: „reine Architektur“ mit nacktem Glas, obwohl Bakus Westsonne ohne Schatten oder Außenjalousie unbewohnbar ist.",
        },
        {
          type: "h3",
          text: "Wie Licht und Klima in Baku Bilder unredlich machen",
        },
        {
          type: "p",
          text: "Ein europäisches Studio-HDRI ist nicht die Absheron-Sonne. Sommerlicht in Baku ist hart, Schatten kurz, der Himmel oft staubig-weiß. Im Winter verschieben Wind und Feuchte die Fassadenfarbe: dunkler Putz bleicht, heller Stein verkalkt schneller, Metallgeländer korrodieren näher am Kaspischen Meer. Eine „italienische Villa“-Palette auf einen Hof in Mardakan oder Şüvəlan zu kopieren, ist deshalb riskant. Visualisierung muss in lokalem Licht, Staub und Sonnenwinkel neu gebaut werden. Sonst kaufen Sie einen europäischen Abend und bauen einen kaspischen Mittag.",
        },
        {
          type: "h2",
          text: "Fassade und Material mit Visualisierung entscheiden",
        },
        {
          type: "p",
          text: "Die richtige Reihenfolge: zuerst Grundriss und Schnitt festziehen, dann zwei oder drei Fassaden von derselben Kamera zur selben Stunde rechnen. Eine Option heller Kalkstein und Holzbeschattung, eine dunkler Putz und Aluminiumläden, eine Ziegel und tiefe Loggien. Der Bauherr fragt nicht, was schöner ist, sondern wo man im Juli sitzen kann. In Baku schlägt diese Frage jedes Instagram-Standbild, weil eine nutzbare Terrasse mehr wert ist als ein hübsches Bild.",
        },
        {
          type: "p",
          text: "Verlangen Sie mindestens eine Nahaufnahme: Steinecke, Fensterprofilstärke, Attika-Tropfkante, Gefälle des Balkons. Das Fernbild verkauft das Haus; das Nahbild baut es. Vertrauen Sie Farbe nicht am Telefon. Druck im Büro, Muster auf dem Grundstück, Blick mittags und in der Dämmerung. Im Absheron-Licht kann Beige gelb und grauer Putz bläulich werden. Das ist Physik, kein Geschmack.",
        },
        {
          type: "h2",
          text: "Wo Visualisierung im Ablauf steht",
        },
        {
          type: "p",
          text: "In der Konzeptphase reichen ein oder zwei Atmosphärenbilder: Volumen, Hof, Eingang. Nach dem detaillierten Architekturmodell kommen Entscheidungsbilder — Fassade, Küche, Treppe, Terrasse. Auch ein späteres Verkaufsrendering muss aus der letzten Ausgabe kommen, nicht aus einer schönen alten Datei. Sonst wird Marketing zum Feind der Baustelle: die Familie zeigt ein Bild, der Polier einen Plan, der Streit ist schon verloren.",
        },
        {
          type: "p",
          text: "Die Folgerung ist einfach. Vor dem Bauen in Baku brauchen Sie 3D-Visualisierung, aber sie ersetzt BIM nicht. Das Bild zeigt Gefühl, das Modell den Bau. Halten Sie beides in einem Team und in einem Maß. Dann werden Stein, Glas und Terrasse für Absheron-Licht gewählt — nicht nur für den Bildschirm.",
        },
      ],
    },
  },
};
