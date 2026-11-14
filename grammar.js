// Грамматика: правила + примеры (без тестов)
window.GRAMMAR = [
{ g:'Основа', title:'Артикли: le, un, du', b:[
 ['p','Во французском у существительного почти всегда есть артикль. Он показывает род, число и то, известен ли предмет.'],
 ['table',[['','м. р.','ж. р.','мн. ч.'],['Определённый','le (l’)','la (l’)','les'],['Неопределённый','un','une','des'],['Частичный','du (de l’)','de la (de l’)','des']]],
 ['p','<b>le/la</b> — конкретный или известный предмет, а также вещи «вообще» после глаголов любви: <i>J’aime le café</i>. <b>un/une</b> — один из многих, впервые упомянутый. <b>du/de la</b> — неисчисляемое количество: немного хлеба, воды.'],
 ['ex',[['Je voudrais un croissant.','Я бы хотела круассан.'],['Le croissant est délicieux.','Этот круассан очень вкусный.'],['Je bois du café le matin.','Я пью кофе по утрам.'],['J’aime le chocolat.','Я люблю шоколад.']]],
 ['p','После отрицания <b>un, une, du, de la, des</b> превращаются в <b>de (d’)</b>: <i>Je n’ai pas de voiture.</i>']
]},
{ g:'Основа', title:'Род существительных', b:[
 ['p','Род нужно учить вместе со словом. Но есть подсказки по окончанию.'],
 ['table',[['Обычно мужской','Обычно женский'],['-age (le fromage)','-tion, -sion (la nation)'],['-ment (le moment)','-té (la liberté)'],['-eau (le gâteau)','-ure (la voiture)'],['-isme (le tourisme)','-ette (la fourchette)'],['-oir (le miroir)','-ence, -ance (la chance)']]],
 ['p','Исключения есть всегда: <i>la page, la plage, l’eau (ж.), la peau</i>.'],
 ['ex',[['le voyage','путешествие'],['la télévision','телевизор'],['la santé','здоровье'],['le bateau','корабль']]]
]},
{ g:'Основа', title:'Множественное число', b:[
 ['p','Обычно добавляется <b>-s</b>, которое не читается. Множественное число слышно по артиклю: <i>le livre → les livres</i>.'],
 ['table',[['Окончание','Множественное','Пример'],['-s, -x, -z','не меняется','le prix → les prix'],['-eau, -eu','+ x','le gâteau → les gâteaux'],['-al','-aux','le cheval → les chevaux'],['особые','—','l’œil → les yeux']]],
 ['ex',[['les enfants','дети'],['les journaux','газеты'],['les cheveux','волосы']]]
]},
{ g:'Основа', title:'Прилагательные: род и место', b:[
 ['p','Прилагательное согласуется с существительным: женский род обычно <b>+e</b>, множественное <b>+s</b>.'],
 ['ex',[['un petit chat','маленький кот'],['une petite maison','маленький дом'],['des amis français','французские друзья']]],
 ['p','Обычно прилагательное стоит <b>после</b> существительного. Короткие частые стоят <b>перед</b> ним, их запоминают по слову <b>BAGS</b>: Beauty (beau, joli), Age (jeune, vieux, nouveau), Goodness (bon, mauvais), Size (grand, petit, gros).'],
 ['p','Особые формы: <i>beau → belle, vieux → vieille, nouveau → nouvelle</i>. Перед гласной в м. р.: <i>un bel homme, un vieil ami, un nouvel appartement</i>.']
]},
{ g:'Основа', title:'Отрицание', b:[
 ['p','Отрицание состоит из двух частей, которые обхватывают глагол: <b>ne + глагол + pas</b>. Перед гласной ne → n’.'],
 ['table',[['Форма','Значение'],['ne … pas','не'],['ne … jamais','никогда'],['ne … rien','ничего'],['ne … personne','никто, никого'],['ne … plus','больше не'],['ne … que','только']]],
 ['ex',[['Je ne parle pas allemand.','Я не говорю по-немецки.'],['Il ne mange jamais de viande.','Он никогда не ест мясо.'],['Je n’ai rien compris.','Я ничего не поняла.'],['Elle n’habite plus ici.','Она здесь больше не живёт.']]],
 ['p','В разговорной речи <b>ne</b> часто пропускают: <i>Je sais pas.</i>']
]},
{ g:'Основа', title:'Вопросы', b:[
 ['p','Есть три способа задать вопрос — от разговорного к официальному.'],
 ['ex',[['Tu viens ?','Ты придёшь? (просто интонация)'],['Est-ce que tu viens ?','Ты придёшь? (нейтрально)'],['Viens-tu ?','Придёшь ли ты? (инверсия, письменный стиль)']]],
 ['table',[['Слово','Значение'],['qui','кто'],['que / quoi','что'],['où','где, куда'],['quand','когда'],['comment','как'],['pourquoi','почему'],['combien','сколько'],['quel / quelle','какой / какая']]],
 ['ex',[['Où est-ce que tu habites ?','Где ты живёшь?'],['Qu’est-ce que c’est ?','Что это?'],['Quelle heure est-il ?','Который час?']]]
]},
{ g:'Местоимения', title:'Прямое и косвенное дополнение', b:[
 ['p','Местоимения-дополнения стоят <b>перед</b> глаголом.'],
 ['table',[['Лицо','Прямое (кого?)','Косвенное (кому?)'],['я','me (m’)','me (m’)'],['ты','te (t’)','te (t’)'],['он / она','le / la (l’)','lui'],['мы','nous','nous'],['вы','vous','vous'],['они','les','leur']]],
 ['ex',[['Je le vois.','Я его вижу.'],['Je la connais.','Я её знаю.'],['Je lui parle.','Я с ним / с ней говорю.'],['Je leur téléphone.','Я им звоню.']]],
 ['p','Глаголы с <b>à</b> (parler à, téléphoner à, répondre à) требуют косвенного местоимения.']
]},
{ g:'Местоимения', title:'Местоимения y и en', b:[
 ['p'],
 ['p','<b>y</b> заменяет место или <b>à + вещь</b>: «там, туда, об этом».'],
 ['ex',[['Tu vas à Paris ? — Oui, j’y vais.','Ты едешь в Париж? — Да, я туда еду.'],['Je pense à mon travail. → J’y pense.','Я думаю о работе. → Я об этом думаю.']]],
 ['p','<b>en</b> заменяет <b>de + что-то</b> и количество: «его, их, этого».'],
 ['ex',[['Tu veux du café ? — Oui, j’en veux.','Хочешь кофе? — Да, хочу.'],['Tu as des enfants ? — J’en ai deux.','У тебя есть дети? — У меня их двое.'],['On en parle demain.','Поговорим об этом завтра.']]]
]},
{ g:'Местоимения', title:'Qui, que, où, dont', b:[
 ['p','Относительные местоимения соединяют две части предложения, как русское «который».'],
 ['table',[['Слово','Когда','Пример'],['qui','подлежащее','l’homme qui parle'],['que (qu’)','прямое дополнение','le livre que je lis'],['où','место или время','la ville où j’habite'],['dont','вместо de','le film dont je parle']]],
 ['ex',[['C’est la femme qui habite ici.','Это женщина, которая здесь живёт.'],['Le café que je bois est froid.','Кофе, который я пью, холодный.'],['Le jour où je suis arrivée…','В день, когда я приехала…'],['La chose dont j’ai besoin.','Вещь, которая мне нужна.']]]
]},
{ g:'Местоимения', title:'Ударные местоимения', b:[
 ['p','<b>moi, toi, lui, elle, nous, vous, eux, elles</b> используются после предлогов, для выделения и в коротких ответах.'],
 ['ex',[['Moi, je préfère le thé.','Я вот предпочитаю чай.'],['C’est pour toi.','Это для тебя.'],['Il vient avec nous.','Он идёт с нами.'],['Et toi ? — Moi aussi.','А ты? — Я тоже.']]]
]},
{ g:'Времена', title:'Présent — настоящее время', b:[
 ['p','Глаголы делятся на три группы. Самая большая — глаголы на <b>-er</b> (кроме aller), они спрягаются одинаково.'],
 ['table',[['parler','окончание','звучит'],['je parle','-e','не слышно'],['tu parles','-es','не слышно'],['il parle','-e','не слышно'],['nous parlons','-ons','«он»'],['vous parlez','-ez','«е»'],['ils parlent','-ent','не слышно']]],
 ['p','2-я группа на <b>-ir</b> (finir): <i>je finis, nous finissons, ils finissent</i>. Остальные глаголы — неправильные, их формы есть в разделе «Спряжения».']
]},
{ g:'Времена', title:'Passé composé — прошедшее', b:[
 ['p','Для законченного действия в прошлом. Образуется так: <b>avoir / être в настоящем + причастие</b>.'],
 ['p','Причастие: -er → <b>-é</b> (parlé), -ir → <b>-i</b> (fini), -re → <b>-u</b> (vendu). У неправильных глаголов — свои формы (fait, pris, vu, eu, été).'],
 ['ex',[['J’ai mangé une pomme.','Я съела яблоко.'],['Nous avons fini.','Мы закончили.'],['Elle a pris le train.','Она поехала на поезде.']]],
 ['p','С <b>être</b> спрягаются глаголы движения и состояния (aller, venir, partir, arriver, entrer, sortir, monter, descendre, naître, mourir, rester, tomber, rentrer, devenir) и все возвратные. Тогда причастие согласуется с подлежащим:'],
 ['ex',[['Je suis allée à Paris.','Я ездила в Париж. (ж. р.)'],['Ils sont arrivés hier.','Они приехали вчера.'],['Elle s’est levée tôt.','Она встала рано.']]]
]},
{ g:'Времена', title:'Imparfait — прошедшее длительное', b:[
 ['p','Описание в прошлом, привычки, фон событий: «было, бывало, делал». Основа берётся от формы <b>nous</b> в настоящем без -ons, плюс окончания.'],
 ['table',[['','окончание','parler'],['je','-ais','parlais'],['tu','-ais','parlais'],['il','-ait','parlait'],['nous','-ions','parlions'],['vous','-iez','parliez'],['ils','-aient','parlaient']]],
 ['p','Единственное исключение — être: <i>j’étais, tu étais…</i>'],
 ['ex',[['Quand j’étais petite, j’habitais à Moscou.','Когда я была маленькой, я жила в Москве.'],['Il faisait beau.','Была хорошая погода.']]]
]},
{ g:'Времена', title:'Passé composé или imparfait?', b:[
 ['p','<b>Passé composé</b> — событие, которое произошло и закончилось (что случилось?). <b>Imparfait</b> — фон, описание, привычка (как было? что обычно делали?).'],
 ['ex',[['Je lisais quand le téléphone a sonné.','Я читала, когда зазвонил телефон.'],['Il pleuvait, alors nous sommes restés à la maison.','Шёл дождь, поэтому мы остались дома.'],['Chaque été, nous allions à la mer.','Каждое лето мы ездили на море.'],['L’été dernier, nous sommes allés en Italie.','Прошлым летом мы съездили в Италию.']]]
]},
{ g:'Времена', title:'Будущее: futur proche и futur simple', b:[
 ['p','<b>Futur proche</b> — ближайшее будущее, очень разговорное: <b>aller + инфинитив</b>.'],
 ['ex',[['Je vais manger.','Я сейчас поем / собираюсь поесть.'],['On va voir.','Посмотрим.']]],
 ['p','<b>Futur simple</b> — будущее вообще: <b>инфинитив + -ai, -as, -a, -ons, -ez, -ont</b>. У неправильных глаголов своя основа: être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-, pouvoir → pourr-, voir → verr-.'],
 ['ex',[['Je parlerai avec lui.','Я поговорю с ним.'],['Demain, il fera beau.','Завтра будет хорошая погода.'],['Nous serons là à huit heures.','Мы будем там в восемь.']]]
]},
{ g:'Времена', title:'Passé récent: venir de', b:[
 ['p','«Только что сделал»: <b>venir de + инфинитив</b>.'],
 ['ex',[['Je viens d’arriver.','Я только что приехала.'],['Il vient de partir.','Он только что ушёл.']]]
]},
{ g:'Дальше', title:'Conditionnel — «бы»', b:[
 ['p','Вежливые просьбы, желания и гипотезы. Основа как у futur simple + окончания imparfait (-ais, -ais, -ait, -ions, -iez, -aient).'],
 ['ex',[['Je voudrais un café.','Я бы хотела кофе.'],['Pourriez-vous m’aider ?','Не могли бы вы мне помочь?'],['J’aimerais voyager.','Я бы хотела путешествовать.'],['Si j’avais le temps, je viendrais.','Если бы у меня было время, я бы пришла.']]],
 ['p','Важно: после <b>si</b> («если») ставится imparfait, а не conditionnel.']
]},
{ g:'Дальше', title:'Subjonctif — когда нужен', b:[
 ['p','Особое наклонение после выражений желания, необходимости, эмоций и сомнения, когда у частей предложения разные подлежащие. Почти всегда после <b>que</b>.'],
 ['table',[['Выражение','Значение'],['il faut que','нужно, чтобы'],['je veux que','я хочу, чтобы'],['je suis contente que','я рада, что'],['bien que','хотя'],['pour que','чтобы']]],
 ['p','Образование: основа от формы <b>ils</b> настоящего времени без -ent + -e, -es, -e, -ions, -iez, -ent. Неправильные: être → <i>que je sois</i>, avoir → <i>que j’aie</i>, aller → <i>que j’aille</i>, faire → <i>que je fasse</i>.'],
 ['ex',[['Il faut que tu partes.','Тебе нужно уйти.'],['Je veux que vous veniez.','Я хочу, чтобы вы пришли.'],['Je suis contente que tu sois là.','Я рада, что ты здесь.']]]
]},
{ g:'Дальше', title:'Повелительное наклонение', b:[
 ['p','Формы tu, nous, vous без местоимения. У глаголов на -er в форме tu пропадает -s.'],
 ['ex',[['Parle plus fort !','Говори громче!'],['Allons-y !','Пошли!'],['Venez avec nous !','Идёмте с нами!'],['Attends-moi !','Подожди меня!']]],
 ['p','Неправильные: être → <i>sois, soyons, soyez</i>; avoir → <i>aie, ayons, ayez</i>.']
]},
{ g:'Полезное', title:'Сравнение', b:[
 ['table',[['Конструкция','Значение'],['plus … que','более … чем'],['moins … que','менее … чем'],['aussi … que','такой же … как'],['le plus …','самый …']]],
 ['ex',[['Paris est plus grand que Lyon.','Париж больше Лиона.'],['Ce café est moins cher.','Это кафе дешевле.'],['Elle est aussi grande que moi.','Она такого же роста, как я.']]],
 ['p','Исключения: bon → <b>meilleur</b> (лучше, прилагательное), bien → <b>mieux</b> (лучше, наречие).'],
 ['ex',[['Ce gâteau est meilleur.','Этот торт вкуснее.'],['Tu chantes mieux que moi.','Ты поёшь лучше меня.']]]
]},
{ g:'Полезное', title:'Предлоги с городами и странами', b:[
 ['table',[['Куда / где','Предлог','Пример'],['город','à','à Paris'],['страна ж. р. (на -e)','en','en France, en Russie'],['страна м. р.','au','au Canada, au Monténégro'],['страна во мн. ч.','aux','aux États-Unis']]],
 ['p','Откуда: <b>de</b> (de Paris, de France), <b>du</b> (du Canada), <b>des</b> (des États-Unis).'],
 ['ex',[['J’habite au Monténégro.','Я живу в Черногории.'],['Je vais en Italie.','Я еду в Италию.'],['Elle vient du Japon.','Она из Японии.']]]
]},
{ g:'Полезное', title:'Числа, даты и время', b:[
 ['p','Особенности счёта: 70 = <b>soixante-dix</b> (60+10), 80 = <b>quatre-vingts</b> (4×20), 90 = <b>quatre-vingt-dix</b> (4×20+10).'],
 ['ex',[['soixante-quinze','75'],['quatre-vingt-deux','82'],['quatre-vingt-dix-neuf','99']]],
 ['p','Дата: <b>le</b> + число + месяц, кроме первого числа: <i>le premier mai, le 14 juillet</i>. Время: <i>Il est huit heures et quart</i> (8:15), <i>et demie</i> (:30), <i>moins le quart</i> (без четверти).'],
 ['ex',[['Nous sommes le 14 novembre.','Сегодня 14 ноября.'],['Il est midi.','Полдень.'],['Il est dix heures et demie.','Половина одиннадцатого.']]]
]}
];
