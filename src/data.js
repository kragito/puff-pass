/* ===== Built-in knowledge base ===== */
const BUILTIN = [
{ id: 'countries', name: 'Countries', prompt: 'Name a country',
  note: '193 UN members plus Vatican City, Palestine, Taiwan and Kosovo.',
  text: `
United States | USA | US | United States of America | America | U.S.A.
China | PRC | People's Republic of China
Japan | Nippon
India
Brazil | Brasil
Canada
Mexico
Russia | Russian Federation
United Kingdom | UK | Great Britain | Britain | U.K.
France
Germany | Deutschland
Italy | Italia
Spain | España
Australia
South Korea | Korea | Republic of Korea
Egypt
Argentina
Nigeria
South Africa
Indonesia
Thailand
Vietnam | Viet Nam
Philippines
Malaysia
Singapore
Portugal
Netherlands | Holland | The Netherlands
Sweden
Norway
Ireland | Eire | Republic of Ireland
Greece
Turkey | Türkiye | Turkiye
Saudi Arabia
Israel
Pakistan
Iran
Iraq
New Zealand | Aotearoa
Switzerland
Poland
Ukraine
Cuba
Kenya
Colombia
Peru
Chile
# uncommon
Afghanistan
Algeria
Austria
Bangladesh
Belgium
Bolivia
Cambodia
Cameroon
Costa Rica
Croatia
Czechia | Czech Republic
Denmark
Dominican Republic
Ecuador
Ethiopia
Finland
Ghana
Guatemala
Haiti
Honduras
Hungary
Iceland
Jamaica
Jordan
Kazakhstan
Kuwait
Laos | Lao PDR
Lebanon
Libya
Luxembourg
Madagascar
Mongolia
Morocco
Myanmar | Burma
Nepal
North Korea | DPRK
Panama
Paraguay
Qatar
Romania
Serbia
Somalia
Sri Lanka
Sudan
Syria
Taiwan | Republic of China | ROC
Tanzania
Tunisia
Uganda
United Arab Emirates | UAE | Emirates
Uruguay
Venezuela
Yemen
Zimbabwe
Bulgaria
Slovakia
Slovenia
Estonia
Latvia
Lithuania
Belarus
Uzbekistan
Senegal
Angola
Mozambique
Zambia
Rwanda
Fiji
El Salvador
Nicaragua
Bahamas
Barbados
Brunei | Brunei Darussalam
Bhutan
Maldives
Cyprus
Malta
Monaco
Georgia
Armenia
Azerbaijan
Oman
Bahrain
Albania
Bosnia and Herzegovina | Bosnia | Bosnia-Herzegovina
Montenegro
North Macedonia | Macedonia
Moldova
Ivory Coast | Côte d'Ivoire | Cote d'Ivoire
Mali
Niger
Chad
Democratic Republic of the Congo | DRC | DR Congo | Congo-Kinshasa | Zaire | Congo
Republic of the Congo | Congo-Brazzaville | Congo
# rare
Andorra
Antigua and Barbuda
Belize
Benin
Botswana
Burkina Faso
Burundi
Cabo Verde | Cape Verde
Central African Republic | CAR
Comoros
Djibouti
Dominica
East Timor | Timor-Leste
Equatorial Guinea
Eritrea
Eswatini | Swaziland
Gabon
Gambia | The Gambia
Grenada
Guinea
Guinea-Bissau
Guyana
Kiribati
Kosovo
Kyrgyzstan
Lesotho
Liberia
Liechtenstein
Malawi
Marshall Islands
Mauritania
Mauritius
Micronesia | Federated States of Micronesia
Namibia
Nauru
Palau
Palestine | State of Palestine
Papua New Guinea | PNG
Saint Kitts and Nevis | Saint Christopher and Nevis
Saint Lucia
Saint Vincent and the Grenadines
Samoa
San Marino
São Tomé and Príncipe | Sao Tome
Seychelles
Sierra Leone
Solomon Islands
South Sudan
Suriname | Surinam
Tajikistan
Togo
Tonga
Trinidad and Tobago | Trinidad
Turkmenistan
Tuvalu
Vanuatu
Vatican City | Holy See | Vatican
`},

{ id: 'capitals', name: 'Capital cities', prompt: 'Name a national capital',
  note: 'Countries with more than one official capital count each one (South Africa, Bolivia, Sri Lanka, Malaysia, Eswatini).',
  text: `
London
Paris
Tokyo
Washington, D.C. | Washington | Washington DC | DC
Beijing | Peking
Moscow | Moskva
Berlin
Rome | Roma
Madrid
Ottawa
Canberra
Cairo
New Delhi | Delhi
Seoul
Bangkok | Krung Thep
Singapore | Singapore City
Kuala Lumpur | KL
Jakarta
Manila
Hanoi
Athens
Lisbon | Lisboa
Dublin
Amsterdam
Brussels | Bruxelles
Vienna | Wien
Stockholm
Oslo
Copenhagen | København
Helsinki
Warsaw | Warszawa
Prague | Praha
Budapest
Buenos Aires
Mexico City | CDMX | Ciudad de México
Havana | La Habana
Lima
Santiago | Santiago de Chile
Bogotá
Nairobi
Wellington
Bern | Berne
Kyiv | Kiev
Ankara
Riyadh
Jerusalem
Tehran
Baghdad
Islamabad
# uncommon
Abu Dhabi
Doha
Kuwait City
Muscat
Manama
Amman
Beirut
Damascus
Kabul
Dhaka | Dacca
Kathmandu
Colombo
Sri Jayawardenepura Kotte | Kotte
Taipei
Pyongyang
Ulaanbaatar | Ulan Bator
Phnom Penh
Vientiane
Naypyidaw | Nay Pyi Taw | Naypyitaw
Astana | Nur-Sultan
Tashkent
Brasília | Brasilia
Caracas
Quito
Montevideo
Asunción
La Paz
Sucre
Panama City
San José
Guatemala City
Kingston
Reykjavík
Bucharest
Sofia
Belgrade | Beograd
Zagreb
Ljubljana
Bratislava
Tallinn
Riga
Vilnius
Minsk
Tbilisi
Yerevan
Baku
Nicosia
Valletta
Monaco | Monaco-Ville
Luxembourg | Luxembourg City
Vatican City
Tirana | Tiranë
Sarajevo
Skopje
Podgorica
Chișinău | Chisinau | Kishinev
Pristina | Prishtina | Priština
Algiers
Tunis
Tripoli
Rabat
Khartoum
Addis Ababa
Accra
Abuja
Dakar
Kinshasa
Luanda
Harare
Lusaka
Maputo
Kampala
Kigali
Dodoma
Pretoria
Cape Town
Bloemfontein
Antananarivo | Tana
Mogadishu
Putrajaya
# rare
Andorra la Vella
St. John's | Saint John's
Nassau
Bridgetown
Belmopan
Porto-Novo
Thimphu
Gaborone
Bandar Seri Begawan
Ouagadougou
Gitega
Praia
Yaoundé
Bangui
N'Djamena | Ndjamena
Moroni
Brazzaville
Yamoussoukro
Djibouti | Djibouti City
Roseau
Santo Domingo
Dili
San Salvador
Malabo
Asmara
Mbabane
Lobamba
Suva
Libreville
Banjul
St. George's | Saint George's
Conakry
Bissau
Georgetown
Port-au-Prince
Tegucigalpa
Tarawa | South Tarawa
Bishkek
Maseru
Monrovia
Vaduz
Lilongwe
Malé | Male
Bamako
Majuro
Nouakchott
Port Louis
Palikir
Windhoek
Yaren
Managua
Niamey
Port Moresby
Basseterre
Castries
Kingstown
Apia
San Marino | City of San Marino
São Tomé | Sao Tome
Victoria
Freetown
Honiara
Juba
Paramaribo
Dushanbe
Lomé
Nukuʻalofa | Nuku'alofa
Port of Spain
Ashgabat | Ashkhabad
Funafuti
Port Vila
Sana'a | Sanaa
Ngerulmud
`},

{ id: 'states', name: 'US states', prompt: 'Name a US state', note: 'Postal codes are accepted too.',
  text: `
California | CA
Texas | TX
Florida | FL
New York | NY
Washington | WA | Washington State
Hawaii | HI
Alaska | AK
Nevada | NV
Arizona | AZ
Colorado | CO
Illinois | IL
Ohio | OH
Georgia | GA
Michigan | MI
Massachusetts | MA
New Jersey | NJ
Pennsylvania | PA
Oregon | OR
Utah | UT
Louisiana | LA
# uncommon
Virginia | VA
North Carolina | NC
South Carolina | SC
Tennessee | TN
Kentucky | KY
Alabama | AL
Mississippi | MS
Missouri | MO
Minnesota | MN
Wisconsin | WI
Indiana | IN
Iowa | IA
Kansas | KS
Oklahoma | OK
New Mexico | NM
Maryland | MD
Connecticut | CT
Maine | ME
Arkansas | AR
Montana | MT
Idaho | ID
# rare
Nebraska | NE
North Dakota | ND
South Dakota | SD
Wyoming | WY
West Virginia | WV
Vermont | VT
New Hampshire | NH
Rhode Island | RI
Delaware | DE
`},

{ id: 'elements', name: 'Chemical elements', prompt: 'Name a chemical element', note: 'All 118. Symbols are accepted.',
  text: `
Hydrogen | H
Helium | He
Carbon | C
Nitrogen | N
Oxygen | O
Sodium | Na
Iron | Fe
Gold | Au
Silver | Ag
Copper | Cu
Aluminium | Aluminum | Al
Calcium | Ca
Neon | Ne
Lead | Pb
Uranium | U
Chlorine | Cl
Potassium | K
Magnesium | Mg
Zinc | Zn
Tin | Sn
Mercury | Hg
Sulfur | Sulphur | S
Silicon | Si
Lithium | Li
Platinum | Pt
Iodine | I
Fluorine | F
Phosphorus | P
Nickel | Ni
Plutonium | Pu
# uncommon
Argon | Ar
Krypton | Kr
Xenon | Xe
Radon | Rn
Titanium | Ti
Chromium | Cr
Cobalt | Co
Manganese | Mn
Tungsten | Wolfram | W
Arsenic | As
Bromine | Br
Boron | B
Beryllium | Be
Barium | Ba
Radium | Ra
Caesium | Cesium | Cs
Strontium | Sr
Bismuth | Bi
Cadmium | Cd
Palladium | Pd
Iridium | Ir
Osmium | Os
Vanadium | V
Selenium | Se
Polonium | Po
Germanium | Ge
Gallium | Ga
Antimony | Sb
Molybdenum | Mo
Einsteinium | Es
Nobelium | No
Americium | Am
Curium | Cm
Neptunium | Np
Rubidium | Rb
Thorium | Th
Francium | Fr
Lanthanum | La
Neodymium | Nd
Zirconium | Zr
# rare
Scandium | Sc
Yttrium | Y
Niobium | Nb
Technetium | Tc
Ruthenium | Ru
Rhodium | Rh
Indium | In
Tellurium | Te
Cerium | Ce
Praseodymium | Pr
Promethium | Pm
Samarium | Sm
Europium | Eu
Gadolinium | Gd
Terbium | Tb
Dysprosium | Dy
Holmium | Ho
Erbium | Er
Thulium | Tm
Ytterbium | Yb
Lutetium | Lu
Hafnium | Hf
Tantalum | Ta
Rhenium | Re
Thallium | Tl
Astatine | At
Actinium | Ac
Protactinium | Pa
Berkelium | Bk
Californium | Cf
Fermium | Fm
Mendelevium | Md
Lawrencium | Lr
# legendary
Rutherfordium | Rf
Dubnium | Db
Seaborgium | Sg
Bohrium | Bh
Hassium | Hs
Meitnerium | Mt
Darmstadtium | Ds
Roentgenium | Rg
Copernicium | Cn
Nihonium | Nh
Flerovium | Fl
Moscovium | Mc
Livermorium | Lv
Tennessine | Ts
Oganesson | Og
`},

{ id: 'pokemon', name: 'Gen 1 Pokémon', prompt: 'Name one of the original 151 Pokémon', note: 'Kanto Pokédex #001 to #151.',
  text: `
Bulbasaur
Charmander
Squirtle
Pikachu
Charizard
Mewtwo
Mew
Eevee
Snorlax
Jigglypuff
Psyduck
Gengar
Magikarp
Gyarados
Meowth
Blastoise
Venusaur
Raichu
Dragonite | Dragonight
Lapras
Ditto
Onix
Geodude
Vulpix
Machamp
Alakazam
Arcanine
Zubat
Caterpie
Pidgey
Rattata
Ekans
Koffing
Slowpoke
Cubone
Articuno
Zapdos
Moltres
Clefairy
Diglett
Butterfree
# uncommon
Ivysaur
Charmeleon
Wartortle
Metapod
Weedle
Kakuna
Beedrill
Pidgeotto
Pidgeot
Raticate
Arbok
Sandshrew
Sandslash
Nidoran♀ | Nidoran F | Nidoran female
Nidorina
Nidoqueen
Nidoran♂ | Nidoran M | Nidoran male
Nidorino
Nidoking
Clefable
Ninetales
Wigglytuff
Golbat
Oddish
Persian
Golduck
Growlithe
Poliwag
Abra
Kadabra
Machop
Machoke
Bellsprout
Tentacool
Graveler
Golem
Ponyta
Slowbro
Magnemite
Voltorb
Electrode
Gastly
Haunter
Weezing
Chansey
Mr. Mime | Mr Mime
Scyther
Jynx
Electabuzz
Magmar
Vaporeon
Jolteon
Flareon
Porygon
Aerodactyl
Dratini
Dragonair
Hitmonlee
Hitmonchan
Rhydon
Kangaskhan
Staryu
Starmie
Tauros
# rare
Spearow
Fearow
Paras
Parasect
Venonat
Venomoth
Dugtrio
Mankey
Primeape
Poliwhirl
Poliwrath
Gloom
Vileplume
Weepinbell
Victreebel
Tentacruel
Rapidash
Magneton
Farfetch'd | Farfetchd
Doduo
Dodrio
Seel
Dewgong
Grimer
Muk
Shellder
Cloyster
Drowzee
Hypno
Krabby
Kingler
Exeggcute
Exeggutor
Marowak
Lickitung
Rhyhorn
Tangela
Horsea
Seadra
Goldeen
Seaking
Pinsir
Omanyte
Omastar
Kabuto
Kabutops
`},

{ id: 'lol', name: 'League champions', prompt: 'Name a League of Legends champion',
  note: 'Roster up to Yunara (mid-2026). Add newer champions here when they release.',
  text: `
Ahri
Yasuo
Jinx
Teemo
Lux
Ashe
Garen
Darius
Annie
Master Yi | Yi
Zed
Thresh
Lee Sin | Lee
Ezreal
Vayne
Katarina | Kat
Riven
Caitlyn | Cait
Vi
Ekko
Blitzcrank | Blitz
Morgana | Morg
Malphite
Miss Fortune | MF
Jhin
Akali
Sona
Soraka | Raka
Nasus
Jax
Draven
Amumu
Singed
Twisted Fate | TF | Twisted
Lulu
Leona
Sett
Viego
Yone
Pyke
Kai'Sa | Kaisa
Seraphine
Warwick | WW
Ryze
Irelia
Sylas
Mordekaiser | Morde
Yuumi
# uncommon
Aatrox
Akshan
Alistar
Anivia
Aphelios
Aurelion Sol | ASol | Aurelion | Aurelion Sol
Azir
Bard
Brand
Braum
Camille
Cassiopeia | Cassio
Cho'Gath | Chogath | Cho
Corki
Diana
Dr. Mundo | Mundo
Elise
Evelynn | Eve
Fiddlesticks | Fiddle
Fiora
Fizz
Galio
Gangplank | GP
Gnar
Gragas
Graves
Gwen
Hecarim | Hec
Heimerdinger | Heimer
Illaoi
Janna
Jarvan IV | Jarvan | J4
Jayce
Kalista
Karma
Karthus
Kassadin | Kass
Kayle
Kayn
Kennen
Kha'Zix | Khazix
Kindred
LeBlanc
Lissandra | Liss
Lucian
Malzahar | Malz
Maokai
Nami
Nautilus | Naut
Neeko
Nidalee | Nid
Nocturne | Noc
Nunu & Willump | Nunu
Olaf
Orianna | Ori
Pantheon | Panth
Poppy
Rakan
Rammus
Renekton | Renek
Rengar
Rumble
Samira
Sejuani | Sej
Senna
Shaco
Shen
Shyvana | Shyv
Sion
Sivir
Swain
Syndra
Talon
Tristana | Trist
Trundle
Tryndamere | Trynd
Twitch
Udyr
Urgot
Varus
Veigar
Vel'Koz | Velkoz
Viktor
Vladimir | Vlad
Volibear | Voli
Wukong | Monkey King
Xayah
Xerath
Xin Zhao | Xin
Yorick
Zac
Zeri
Ziggs
Zilean
Zoe
Zyra
# rare
Ambessa
Aurora
Bel'Veth | Belveth
Briar
Hwei
Ivern
K'Sante | Ksante
Kled
Kog'Maw | Kogmaw | Kog
Lillia
Mel
Milio
Naafiri
Nilah
Ornn
Qiyana
Quinn
Rek'Sai | Reksai
Rell
Renata Glasc | Renata
Skarner
Smolder
Tahm Kench | Tahm | Tahm Kench
Taliyah
Taric
Vex
Yunara
`},

{ id: 'nba', name: 'NBA teams', prompt: 'Name an NBA team', note: 'Current 30 franchises. City or nickname alone works.',
  text: `
Los Angeles Lakers | Lakers | LA Lakers | Los Angeles | LA
Boston Celtics | Celtics | Boston
Golden State Warriors | Warriors | Golden State | GSW
Chicago Bulls | Bulls | Chicago
Miami Heat | Heat | Miami
New York Knicks | Knicks | New York | NYK
Brooklyn Nets | Nets | Brooklyn
Houston Rockets | Rockets | Houston
San Antonio Spurs | Spurs | San Antonio
Dallas Mavericks | Mavericks | Mavs | Dallas
Philadelphia 76ers | 76ers | Sixers | Philadelphia | Philly
Toronto Raptors | Raptors | Toronto
# uncommon
Los Angeles Clippers | Clippers | LA Clippers | Los Angeles | LA
Phoenix Suns | Suns | Phoenix
Denver Nuggets | Nuggets | Denver
Milwaukee Bucks | Bucks | Milwaukee
Cleveland Cavaliers | Cavaliers | Cavs | Cleveland
Oklahoma City Thunder | Thunder | OKC | Oklahoma City
Atlanta Hawks | Hawks | Atlanta
Detroit Pistons | Pistons | Detroit
Orlando Magic | Magic | Orlando
Portland Trail Blazers | Trail Blazers | Blazers | Portland
Utah Jazz | Jazz | Utah
Minnesota Timberwolves | Timberwolves | Wolves | Minnesota
# rare
Sacramento Kings | Kings | Sacramento
Memphis Grizzlies | Grizzlies | Grizz | Memphis
New Orleans Pelicans | Pelicans | Pels | New Orleans
Indiana Pacers | Pacers | Indiana
Charlotte Hornets | Hornets | Charlotte
Washington Wizards | Wizards | Washington
`},

{ id: 'pl', name: 'Premier League clubs', prompt: 'Name a club that has played in the Premier League',
  note: 'Every club with at least one Premier League season since 1992-93 (51 clubs through 2025-26).',
  text: `
Manchester United | Man United | Man Utd | Man U | Manchester Utd | United
Manchester City | Man City | City
Liverpool
Arsenal
Chelsea
Tottenham Hotspur | Tottenham | Spurs
Newcastle United | Newcastle
Everton
Aston Villa | Villa
West Ham United | West Ham
Leicester City | Leicester
Leeds United | Leeds
# uncommon
Southampton | Saints
Crystal Palace | Palace
Wolverhampton Wanderers | Wolves | Wolverhampton
Fulham
Brighton & Hove Albion | Brighton
Nottingham Forest | Forest | Nottm Forest
AFC Bournemouth | Bournemouth
Brentford
Burnley
Sunderland
Norwich City | Norwich
Watford
West Bromwich Albion | West Brom | WBA
Stoke City | Stoke
Blackburn Rovers | Blackburn
Middlesbrough | Boro
Bolton Wanderers | Bolton
Sheffield United | Sheff Utd | Sheffield Utd
Ipswich Town | Ipswich
Swansea City | Swansea
Wigan Athletic | Wigan
Portsmouth | Pompey
Hull City | Hull
Birmingham City | Birmingham
Charlton Athletic | Charlton
Derby County | Derby
Queens Park Rangers | QPR
Coventry City | Coventry
# rare
Sheffield Wednesday | Sheff Wed | Wednesday
Wimbledon | Wimbledon FC
Reading
Cardiff City | Cardiff
Huddersfield Town | Huddersfield
Luton Town | Luton
Bradford City | Bradford
Oldham Athletic | Oldham
# legendary
Barnsley
Blackpool
Swindon Town | Swindon
`},

{ id: 'presidents', name: 'US presidents', prompt: 'Name a US president', note: '45 people (Cleveland and Trump each count once). Surnames work.',
  text: `
George Washington | Washington
Abraham Lincoln | Lincoln | Abe Lincoln
Thomas Jefferson | Jefferson
Franklin D. Roosevelt | FDR | Franklin Roosevelt | Roosevelt
John F. Kennedy | JFK | Kennedy | John Kennedy
Barack Obama | Obama
Donald Trump | Trump
Joe Biden | Biden
Ronald Reagan | Reagan
Bill Clinton | Clinton
Richard Nixon | Nixon
Theodore Roosevelt | Teddy Roosevelt | Teddy | TR | Roosevelt
George W. Bush | Dubya | Bush 43 | George Bush | Bush
# uncommon
John Adams | Adams
George H. W. Bush | Bush Sr | Bush 41 | George HW Bush | Bush
Jimmy Carter | Carter
Dwight D. Eisenhower | Eisenhower | Ike | Dwight Eisenhower
Harry S. Truman | Truman | Harry Truman
Andrew Jackson | Jackson
Ulysses S. Grant | Grant | Ulysses Grant
James Madison | Madison
Lyndon B. Johnson | LBJ | Lyndon Johnson | Johnson
Gerald Ford | Ford
Woodrow Wilson | Wilson
James Monroe | Monroe
Herbert Hoover | Hoover
# rare
John Quincy Adams | JQA | Adams
Martin Van Buren | Van Buren
William Henry Harrison | Harrison
John Tyler | Tyler
James K. Polk | Polk | James Polk
Zachary Taylor | Taylor
Andrew Johnson | Johnson
William McKinley | McKinley
William Howard Taft | Taft
Calvin Coolidge | Coolidge
Grover Cleveland | Cleveland
# legendary
Millard Fillmore | Fillmore
Franklin Pierce | Pierce
James Buchanan | Buchanan
Rutherford B. Hayes | Hayes | Rutherford Hayes
James A. Garfield | Garfield | James Garfield
Chester A. Arthur | Arthur | Chester Arthur
Benjamin Harrison | Harrison
Warren G. Harding | Harding | Warren Harding
`},

{ id: 'fruits', name: 'Fruits', prompt: 'Name a fruit', note: 'Culinary fruits, including Southeast Asian and berry deep cuts.',
  text: `
Apple
Banana
Orange
Grape
Strawberry
Mango
Pineapple
Watermelon
Lemon
Lime
Pear
Peach
Cherry
Blueberry
Raspberry
Kiwi | Kiwifruit | Kiwi fruit
Coconut
Papaya
Plum
Avocado
Tomato
Grapefruit
Pomegranate
Blackberry
Apricot
Cantaloupe | Rockmelon
Honeydew | Honeydew melon
Melon
Durian
Lychee | Litchi | Lichee
Dragon fruit | Pitaya | Pitahaya | Dragonfruit
Fig
Date
Cranberry
Nectarine
Tangerine
Mandarin | Mandarin orange
Clementine
Passion fruit | Passionfruit
Guava
Jackfruit
# uncommon
Rambutan
Mangosteen
Persimmon | Kaki
Starfruit | Carambola | Star fruit
Longan
Kumquat | Cumquat
Gooseberry
Blackcurrant | Black currant
Redcurrant | Red currant
Currant
Elderberry
Mulberry
Boysenberry
Custard apple | Cherimoya
Soursop | Graviola | Guanabana
Quince
Olive
Plantain
Tamarind
Yuzu
Pomelo | Pummelo
Chiku | Sapodilla | Ciku | Sapota
Salak | Snake fruit
Loquat
Feijoa | Pineapple guava
Huckleberry
Acai | Açaí | Acai berry
Goji berry | Goji | Wolfberry
Blood orange
Calamansi | Calamondin | Kalamansi
Key lime
Satsuma
Tangelo
Jujube | Red date | Chinese date
Prickly pear | Cactus pear
Breadfruit
Muskmelon
Galia melon | Galia
Damson
Greengage
Crab apple | Crabapple
Sugar apple | Sweetsop
Mamey | Mamey sapote
# rare
Physalis | Cape gooseberry | Ground cherry | Goldenberry
Jabuticaba
Cloudberry
Lingonberry | Cowberry
Ackee | Akee
Miracle fruit | Miracle berry
Kiwano | Horned melon
Bergamot
Ugli fruit | Ugli
Medlar
Rose apple | Water apple | Wax apple | Jambu
Langsat | Lanzones | Duku
Cempedak
Pawpaw
Marula
Atemoya
Pepino | Pepino melon
Tamarillo | Tree tomato
Lucuma
Buddha's hand | Fingered citron
Citron
Finger lime
Loganberry
Marionberry
Tayberry
Dewberry
Salmonberry
Bilberry | Whortleberry
Sea buckthorn
Chokeberry | Aronia
Serviceberry | Saskatoon berry | Juneberry
Rose hip | Rosehip
Sloe
Mirabelle | Mirabelle plum
Pluot
Plumcot
Amla | Indian gooseberry
Jamun | Java plum
Casaba melon | Casaba
Black sapote | Chocolate pudding fruit
Star apple | Caimito
Noni
Bael
Wood apple
Kiwiberry | Hardy kiwi
Camu camu
Pitanga | Surinam cherry
Lulo | Naranjilla
Barberry
# legendary
Rambai
Santol
Marang
Bilimbi
Cupuaçu | Cupuacu
Abiu
Grumichama
Canistel | Egg fruit
White sapote
Ice cream bean
Mamoncillo | Spanish lime | Quenepa | Genip
Velvet tamarind
Hala fruit
Karonda
Phalsa
Jostaberry
Thimbleberry
Crowberry
Rowanberry | Rowan
Hawthorn berry | Haw
Chokecherry
Ugni | Chilean guava
Aprium
Nance
Biribá | Biriba | Rollinia
Canary melon
`},

{ id: 'langs', name: 'Programming languages', prompt: 'Name a programming language',
  note: 'General-purpose, shader, hardware, query and esoteric languages. Markup like HTML and CSS does not count.',
  text: `
Python
JavaScript | JS | ECMAScript
Java
C
C++ | cpp | C plus plus
C# | C sharp | csharp
TypeScript | TS
Go | Golang
Rust
Swift
Kotlin
Ruby
PHP
SQL
R
MATLAB
Lua
Dart
Perl
Scala
Bash | Shell | Shell script
# uncommon
Haskell
Elixir
Erlang
Clojure
F# | F sharp | fsharp
Objective-C | ObjC | Obj-C
Visual Basic | VB | VB.NET | Visual Basic .NET
VBA
Fortran
COBOL
Pascal
Delphi | Object Pascal
Assembly | Assembly language | asm
Julia
Groovy
PowerShell
Lisp
Common Lisp
Scheme
Racket
Prolog
Ada
OCaml
Zig
Nim
Crystal
Solidity
GDScript
HLSL
GLSL
CUDA
Elm
Smalltalk
BASIC
Scratch
ActionScript
CoffeeScript
Haxe
Gleam
Mojo
Luau
Verilog
VHDL
PL/SQL
T-SQL | Transact-SQL
Processing
Apex
ABAP
Wolfram Language | Mathematica | Wolfram
SAS
# rare
D | D language | Dlang
Raku | Perl 6
Hack
Carbon
V | Vlang
Odin
Jai
Logo
QBasic
Tcl
AWK
APL
Forth
PostScript
Eiffel
Modula-2
Oberon
PL/I
RPG
MUMPS
LabVIEW
SystemVerilog
Idris
Agda
Coq | Rocq
Lean
Standard ML | SML
Miranda
Io
Self
PureScript
ReasonML | Reason
ReScript
Dylan
Ballerina
Pony
Red
Rebol
Maple
Stata
GNU Octave | Octave
Vala
Squirrel
AngelScript
UnrealScript
MoonScript
Fennel
Janet
Hy
Emacs Lisp | Elisp
Vimscript | VimL
AutoHotkey | AHK
AutoIt
Batch | Batch file
Ceylon
Starlark
Nix
Chapel
Simula
ALGOL | Algol 60 | Algol 68
Q#
ChucK
SuperCollider
Csound
Pike
J
K
Cg
WGSL
Metal Shading Language | MSL
OpenCL
ZScript
Papyrus
# legendary
Brainfuck | BF
Malbolge
Befunge
Whitespace
INTERCAL
LOLCODE
Piet
Shakespeare
Chef
ArnoldC
Rockstar
Befunge-98
`},

{ id: 'greek', name: 'Greek deities', prompt: 'Name a Greek god, goddess or Titan',
  note: 'Greek names only, so Roman names like Jupiter or Bacchus do not count.',
  text: `
Zeus
Hera
Poseidon
Athena | Athene
Apollo
Artemis
Ares
Aphrodite
Hermes
Hephaestus | Hephaistos
Demeter
Dionysus | Dionysos
Hades
Hestia
Persephone | Kore
Eros
Nike
Gaia | Gaea
Kronos | Cronus | Cronos
Prometheus
Atlas
# uncommon
Uranus | Ouranos
Rhea
Hecate | Hekate
Nemesis
Pan
Helios
Selene
Eos
Iris
Hebe
Asclepius | Asklepios
Morpheus
Hypnos
Thanatos
Nyx
Erebus
Chaos
Tartarus
Eris
Tyche
Oceanus | Okeanos
Hyperion
Themis
Mnemosyne
Leto
Metis
Triton
Amphitrite
Epimetheus
Calliope
Clio
Thalia
Clotho
Lachesis
Atropos
Boreas
Zephyrus | Zephyr
Aeolus
Phobos
Deimos
Heracles | Herakles
# rare
Tethys
Theia
Coeus
Phoebe
Crius
Iapetus
Nereus
Proteus
Pontus
Aether
Hemera
Ananke
Phanes
Notus
Eurus
Harmonia
Enyo
Priapus
Hymenaeus | Hymen
Ganymede
Asteria
Styx
Achelous
Dione
Ate
Momus
Plutus
Hygieia
Erato
Euterpe
Melpomene
Polyhymnia
Terpsichore
Urania
# legendary
Zelus
Kratos | Cratos
Bia
Palaemon
Thaumas
Phorcys
Ceto
Eurybia
Astraeus
Pallas
Perses
Lelantus
Eurynome
Clymene
Achlys
Oizys
Hesperus
Eosphorus | Phosphorus
Pheme
Peitho
Nomos
Dike
Eunomia
Eirene
`},

{ id: 'sgfood', name: 'Singapore hawker food', prompt: 'Name a Singapore hawker dish, snack or drink',
  note: 'Hawker centre and kopitiam staples, kueh and drinks included.',
  text: `
Chicken rice | Hainanese chicken rice
Laksa | Katong laksa
Char kway teow | Char kuey teow | CKT
Nasi lemak
Satay | Sate
Chilli crab | Chili crab
Black pepper crab
Roti prata | Prata
Bak kut teh | BKT
Hokkien mee | Hokkien prawn mee
Kaya toast
Carrot cake | Chai tow kway | Fried carrot cake
Fishball noodles | Fish ball noodles
Wanton mee | Wonton mee | Wantan mee
Bak chor mee | Minced meat noodles
Mee goreng | Mee goreng mamak
Nasi goreng
Nasi padang
Murtabak
Ice kachang | Ais kacang | ABC
Chendol | Cendol
Popiah
Kopi
Teh tarik
Economic rice | Economy rice | Cai png | Chap fan
Fried rice
# uncommon
Rojak
Mee rebus
Mee siam
Lor mee
Otah | Otak-otak | Otak
Kway chap
Chwee kueh
Fish head curry
Yong tau foo | Yong tau fu | YTF
Duck rice
Prawn noodles | Hae mee
Oyster omelette | Orh luak | Orh jian
Beef hor fun | Hor fun | Wat tan hor
Curry puff | Karipap
Nasi briyani | Biryani | Briyani
Thosai | Dosa
Mee pok
Sambal stingray | BBQ stingray | Stingray
Claypot rice
Frog porridge
Ban mian
Fish soup | Sliced fish soup
Fish head bee hoon | Fish bee hoon
Cereal prawns
Mee hoon kueh
Satay bee hoon
Roti john
Soto ayam
Lontong
Ayam penyet
Teochew porridge
Chee cheong fun
Soya bean curd | Tau huay | Beancurd
Ondeh ondeh | Onde onde
Kueh lapis
Pisang goreng | Goreng pisang | Banana fritters
Ang ku kueh
Milo dinosaur
Bandung
Teh
Barley | Barley water
Sugarcane juice
Ngoh hiang | Lor bak
Har cheong gai | Prawn paste chicken
Mee soto
You tiao | Youtiao | Dough fritters
Kway teow soup
# rare
Tau sar piah
Kueh pie tee | Pie tee
Putu piring
Bubur cha cha
Png kueh
Soon kueh
Muah chee
Tutu kueh
Sup tulang
Mee bandung
Appam | Apom
Epok-epok
Kueh salat
Lemper
Hum chim peng
Dry mee siam
Kon loh mee
Fish porridge
Black carrot cake
White carrot cake
Nasi ambeng
Mutton soup
Kopi O | Kopi-o
Kopi C | Kopi-c
Teh C | Teh-c
Teh O | Teh-o
Kopi peng | Kopi ping
Lime juice
Chin chow | Grass jelly
Ice jelly
Cheng tng | Chng tng
Pulut hitam
Orh nee | Yam paste
Kueh dadar
Min jiang kueh | Apam balik
Ah balling | Tang yuan
Kueh bangkit
Pineapple tart
Love letters | Kueh belanda
Kueh dar dar
Tau kwa pau
Lor kai yik
# legendary
Kueh kosui
Kueh lompang
Kueh talam
Kueh ambon
Bingka ubi
Mee kia
Kway teow goreng
Sambal kangkong
Hokkien char mee
Beef kway teow
Chap chye
Babi pongteh
Ayam buah keluak | Buah keluak
Nasi ulam
`},

{ id: 'sgmrt', name: 'Singapore MRT stations', prompt: 'Name a Singapore MRT station',
  note: 'Stations on the NS, EW, NE, CC, DT and TE lines. LRT-only stations do not count.',
  text: `
Jurong East
Woodlands
Ang Mo Kio
Bishan
Toa Payoh
Novena
Newton
Orchard
Somerset
Dhoby Ghaut
City Hall
Raffles Place
Marina Bay
Pasir Ris
Tampines
Bedok
Paya Lebar
Bugis
Tanjong Pagar
Outram Park
Clementi
Changi Airport
HarbourFront | Harbour Front
Chinatown
Clarke Quay
Little India
Serangoon
Sengkang
Punggol
Esplanade
Promenade
Buona Vista
Botanic Gardens
Gardens by the Bay
Yishun
Choa Chu Kang
Boon Lay
Expo
# uncommon
Bukit Batok
Bukit Gombak
Yew Tee
Kranji
Marsiling
Admiralty
Sembawang
Canberra
Khatib
Yio Chu Kang
Braddell
Marina South Pier
Simei
Tanah Merah
Kembangan
Eunos
Aljunied
Kallang
Lavender
Tiong Bahru
Redhill
Queenstown
Commonwealth
Dover
Chinese Garden
Lakeside
Pioneer
Joo Koon
Farrer Park
Boon Keng
Potong Pasir
Woodleigh
Kovan
Hougang
Buangkok
Bras Basah
Nicoll Highway
Stadium
Mountbatten
Dakota
MacPherson | Macpherson
Tai Seng
Bartley
Lorong Chuan
Marymount
Caldecott
Farrer Road
Holland Village
One-north | One North
Kent Ridge
Haw Par Villa
Pasir Panjang
Labrador Park
Telok Blangah
Bayfront
Bukit Panjang
Beauty World
Stevens
Rochor
Downtown
Telok Ayer
Fort Canning
Bencoolen
Jalan Besar
Upper Changi
Tampines East
Tampines West
Bedok North
Bedok Reservoir
Woodlands North
Woodlands South
Lentor
Upper Thomson
Orchard Boulevard
Great World
Maxwell
Shenton Way
Marine Parade
Bayshore
# rare
Gul Circle
Tuas Crescent
Tuas West Road
Tuas Link
Punggol Coast
Cashew
Hillview
Hume
King Albert Park
Sixth Avenue
Tan Kah Kee
Bendemeer
Geylang Bahru
Mattar
Ubi
Kaki Bukit
Springleaf
Mayflower
Bright Hill
Napier
Havelock
Tanjong Rhu
Katong Park
Tanjong Katong
Marine Terrace
Siglap
Keppel
Cantonment
Prince Edward Road
`},

{ id: 'sgplaces', name: 'Singapore neighbourhoods', prompt: 'Name a Singapore town, neighbourhood or island',
  note: 'HDB towns, planning areas, well-known estates and offshore islands.',
  text: `
Ang Mo Kio | AMK
Bedok
Bishan
Bukit Timah
Choa Chu Kang | CCK
Clementi
Geylang
Hougang
Jurong East
Jurong West
Jurong
Orchard
Pasir Ris
Punggol
Sengkang
Serangoon
Tampines
Toa Payoh
Woodlands
Yishun
Bukit Batok
Bukit Panjang
Queenstown
Chinatown
Little India
Kallang
Sentosa
Marina Bay
Holland Village | Holland V
Changi
Sembawang
Bugis
# uncommon
Bukit Merah
Marine Parade
Katong
Joo Chiat
Tiong Bahru
Novena
Newton
Tanglin
River Valley
Kampong Glam | Kampong Gelam
Tanjong Pagar
Outram
Paya Lebar
Potong Pasir
MacPherson | Macpherson
Ubi
Kembangan
Eunos
Siglap
Thomson | Upper Thomson
Seletar
Tengah
Pioneer
Boon Lay
Tuas
Lim Chu Kang
Mandai
Kranji
Pulau Ubin | Ubin
Dover
Telok Blangah
Pasir Panjang
Buona Vista
Dempsey | Dempsey Hill
Balestier
Whampoa
Simei
Tanah Merah
Loyang
Changi Village
Bukit Gombak
Admiralty
Marsiling
Yew Tee
Clarke Quay
Boat Quay
Robertson Quay
Raffles Place
Bras Basah
Dhoby Ghaut
Kovan
Punggol Point
# rare
Sungei Kadut
Western Water Catchment
Simpang
Lorong Halus
Kampong Bahru
Bukit Brown
Pulau Tekong | Tekong
Jurong Island
Kusu Island | Kusu
St John's Island | Saint Johns Island
Coney Island | Pulau Serangoon
Lazarus Island
Sisters' Islands | Sisters Islands
Pulau Hantu
Pulau Semakau | Semakau
Pulau Brani | Brani
Lentor
Yio Chu Kang
Rochor
Lavender
Jalan Besar
Farrer Park
Teban Gardens
Gul
Mountbatten
Tanjong Rhu
Bayshore
Lakeside
Bedok Reservoir
Upper Bukit Timah
Hillview
Sixth Avenue
Seletar Hills
Fernvale
Anchorvale
Compassvale
Rivervale
Pasir Laba
Kaki Bukit
Bendemeer
Upper Paya Lebar
Jalan Kayu
Tai Seng
Bartley
Marymount
Bukit Purmei
Henderson
Alexandra
Commonwealth
Ghim Moh
Dakota
# legendary
Pulau Bukom
Pulau Sudong
Pedra Branca | Pulau Batu Puteh
Pulau Ketam
Changi Bay
Straits View
North-Eastern Islands
Southern Islands
Central Water Catchment
Paya Lebar Air Base
Tanjong Kling
Pandan Gardens
`},

{ id: 'singlish', name: 'Singlish', prompt: 'Name a Singlish word or phrase',
  note: 'Particles, slang and borrowed words used in everyday Singapore English.',
  text: `
Lah
Leh
Lor
Meh
Sia
Shiok
Kiasu
Chope
Paiseh | Paisay
Alamak
Sian | Sien
Walao | Wah lau | Walau | Wah lau eh
Makan
Bojio
Can can | Can
Steady
Atas
Kiasi
Blur
Jialat
Ang moh
Ah beng
Ah lian
Kopitiam
Tapau | Dabao | Da bao
Kaypoh | Kaypo
Lepak
Swee
Chio
Siao | Siao liao
Gahmen
# uncommon
Buay tahan
Tahan
Sotong
Shag
Abuden
Bo chap
Cheem | Chim
Gostan
Kena
Kampung | Kampong
Hor
Liao
Mug | Mugger
Yaya papaya
Rabak
Sabo
Suay
Heng
Buay song
Die die
Eat snake
Act blur
Catch no ball
Kan cheong
Lagi
Wayang
Zhun
Lansi
Garang
Jiak
Orbi good | Orbigood
Kiam siap
Ownself check ownself
Kancheong spider
Liddat | Like that
Unglam
Stylo milo
Talk cock
Agak agak
Chao keng
Arrow
Kena arrow
Sabo king
Steady pom pi pi
Simi
Simi sai
Aiyoh | Aiyo
Wah piang
# rare
Pai tan
Tio
Ka ki lang
Sup sup sui
Buay paiseh
Chim pui pui
Chiong
Chiong sua
Siam
Pang seh
Ho liao
Kiang
Kelong
Shiok sendiri
Botak
Kayu
Goondu
Toot
Bo liao
Ulu
Jio
Mata
Kong si mi
Ho seh liao
Lim peh
Pek chek
Lobang
Hiong
Chap lao chu
Ang pow | Ang pao
Hong gan
`},

{ id: 'jpfood', name: 'Japanese food', prompt: 'Name a Japanese dish, snack, drink or ingredient',
  note: 'Washoku, street food, sweets and pantry staples. Japanese or common English names.',
  text: `
Sushi
Sashimi
Ramen
Udon
Soba
Tempura
Tonkatsu
Yakitori
Takoyaki
Okonomiyaki
Onigiri | Rice ball | Omusubi
Miso soup | Misoshiru
Gyoza
Teriyaki
Japanese curry | Kare raisu | Curry rice | Katsu curry
Edamame
Mochi
Matcha
Bento | Obento
Gyudon | Beef bowl
Katsudon
Oyakodon
Tamagoyaki
Unagi | Eel
Yakisoba
Shabu-shabu
Sukiyaki
Karaage
Natto
Sake | Nihonshu
Wasabi
Tofu
# uncommon
Donburi | Don
Dango
Dorayaki
Taiyaki
Nikujaga
Chawanmushi
Omurice
Korokke | Croquette
Oden
Kushikatsu | Kushiage
Hiyashi chuka
Chirashi | Chirashizushi
Temaki | Hand roll
Nigiri
Maki | Makizushi | Futomaki | Hosomaki
Inari | Inarizushi
Gari | Pickled ginger
Umeboshi
Tsukemono
Mentaiko
Ikura
Uni
Monjayaki | Monja
Nabe
Chanko nabe | Chankonabe
Kaiseki
Okayu | Kayu
Ochazuke
Daifuku
Yokan
Castella | Kasutera
Melon pan
Katsu sando
Tamago sando
Senbei
Kakigori
Anpan
Tendon
Tsukemen
Champon
Hambagu | Hamburg steak
Furikake
Ponzu
Mirin
Kombu
Katsuobushi | Bonito flakes
Nori
Miso
Shoyu
Dashi
Yakiniku
Teppanyaki
Gyutan
Wagyu
Kobe beef
Hojicha
Genmaicha
Sencha
Calpis
Ramune
Shochu
Umeshu
Highball
Pocky
Mitarashi dango
Warabi mochi | Warabimochi
Ikayaki
Yaki imo | Yakiimo
# rare
Imagawayaki
Karinto
Zaru soba
Kitsune udon
Tanuki soba
Nanakusa gayu
Osechi
Ozoni
Toshikoshi soba
Kusaya
Funazushi
Shiokara
Hoya
Basashi
Fugu
Shirasu
Hotaru ika
Tsukudani
Yudofu
Hiyayakko
Agedashi tofu
Goya champuru
Rafute
Sokisoba | Okinawa soba
Taco rice
Hitsumabushi
Miso katsu
Tebasaki
Jingisukan | Genghis Khan
Soup curry
Kiritanpo
Houtou | Hoto
Sasa dango
Momiji manju
Yatsuhashi
Kuzumochi
Mizu yokan
Sakura mochi
Kashiwa mochi
Kinako
Anko
Shiratama
Amazake
Mugicha
Konnyaku
Shirataki
Fu
Natto maki
Takuan
Kinpira
Hijiki
Shira ae | Shiraae
Sunomono
Gomaae | Goma ae
Nukazuke
Katsuo tataki
Saba shioyaki
Unadon
Kaisendon
Tekkadon
Ten musu | Tenmusu
Butadon
Negitoro
Toro
Oyaki
Kamaboko
Chikuwa
Narutomaki | Naruto
Hanpen
Tsukune
Bonjiri
Kawa
# legendary
Kuzukiri
Uiro
Suama
Higashi
Nerikiri
Rakugan
Habutae mochi
Akafuku
Shingen mochi
Kibi dango
Hiroshima okonomiyaki
Kuromitsu
Wasanbon
Sudachi
Yuzu
Shiso
Myoga
Sansho
Shichimi | Shichimi togarashi
Yuzu kosho
Kewpie | Kewpie mayo
`},

{ id: 'prefectures', name: 'Japanese prefectures', prompt: 'Name a Japanese prefecture',
  note: 'All 47, including Tokyo, Hokkaido, Osaka and Kyoto.',
  text: `
Tokyo
Osaka
Kyoto
Hokkaido
Okinawa
Hiroshima
Fukuoka
Kanagawa
Aichi
Nara
Chiba
Saitama
Hyogo
Nagasaki
Nagano
# uncommon
Aomori
Miyagi
Fukushima
Niigata
Shizuoka
Ishikawa
Kagoshima
Kumamoto
Okayama
Gifu
Yamanashi
Akita
Iwate
Mie
Tochigi
Gunma
Ibaraki
Toyama
Wakayama
Ehime
Kagawa
Oita
Miyazaki
Yamagata
# rare
Fukui
Shiga
Tottori
Shimane
Yamaguchi
Tokushima
Kochi
Saga
`},

{ id: 'anime', name: 'Anime series', prompt: 'Name an anime series',
  note: 'TV anime. English or Japanese titles and common abbreviations work.',
  text: `
Naruto | Naruto Shippuden
One Piece
Dragon Ball | Dragon Ball Z | DBZ | Dragon Ball Super
Attack on Titan | Shingeki no Kyojin | AOT | SNK
Demon Slayer | Kimetsu no Yaiba
Pokemon | Pokémon
Death Note
My Hero Academia | Boku no Hero Academia | MHA | BNHA
Jujutsu Kaisen | JJK
Sailor Moon
Bleach
Fullmetal Alchemist | Fullmetal Alchemist Brotherhood | FMA | FMAB
Spy x Family | Spy Family
One Punch Man | OPM
Hunter x Hunter | HxH | Hunter Hunter
Doraemon
Neon Genesis Evangelion | Evangelion | Eva
Cowboy Bebop
Chainsaw Man
Tokyo Ghoul
Sword Art Online | SAO
Detective Conan | Case Closed
Haikyuu | Haikyu
Crayon Shin-chan | Shin-chan | Shin chan
Yu-Gi-Oh | Yugioh
Digimon
JoJo's Bizarre Adventure | JoJo | Jojo no Kimyou na Bouken
Frieren | Sousou no Frieren | Frieren Beyond Journey's End
Mob Psycho 100 | Mob Psycho
Code Geass
Steins;Gate | Steins Gate
Gintama
Black Clover
Fairy Tail
Blue Lock
Dandadan
Solo Leveling
Oshi no Ko
Bocchi the Rock
# uncommon
Inuyasha
Yu Yu Hakusho
Slam Dunk
Cardcaptor Sakura
Fruits Basket
Ouran High School Host Club | Ouran
Re:Zero | Re Zero
Konosuba
Made in Abyss
Vinland Saga
Dr. Stone | Dr Stone
The Promised Neverland | Yakusoku no Neverland
Kaguya-sama: Love Is War | Kaguya-sama | Kaguya sama
Toradora
Clannad
Kuroko's Basketball | Kuroko no Basket
Assassination Classroom | Ansatsu Kyoushitsu
Violet Evergarden
Erased | Boku dake ga Inai Machi
Parasyte | Kiseijuu
Psycho-Pass | Psycho Pass
Trigun
Samurai Champloo
Berserk
Hellsing
Soul Eater
Noragami
Angel Beats
Anohana
Durarara
Black Butler | Kuroshitsuji
Nana
Beyblade
Initial D
Mobile Suit Gundam | Gundam
Macross
Lupin the Third | Lupin III | Lupin
Astro Boy | Tetsuwan Atom
Captain Tsubasa
K-On | K On
The Melancholy of Haruhi Suzumiya | Haruhi Suzumiya | Haruhi
Monogatari | Bakemonogatari
Tokyo Revengers
Blue Exorcist | Ao no Exorcist
Fire Force | Enen no Shouboutai
Kill la Kill
Gurren Lagann | Tengen Toppa Gurren Lagann | TTGL
Bungo Stray Dogs
Mushoku Tensei
That Time I Got Reincarnated as a Slime | Tensura | Slime
Overlord
No Game No Life
Horimiya
Kaiju No. 8 | Kaiju No 8
Delicious in Dungeon | Dungeon Meshi
Zom 100
Your Lie in April | Shigatsu wa Kimi no Uso
Kimi ni Todoke
Hajime no Ippo
Akame ga Kill
Cyberpunk Edgerunners | Edgerunners
Hell's Paradise | Jigokuraku
Mashle
The Apothecary Diaries | Kusuriya no Hitorigoto
Undead Unluck
Sakamoto Days
Hikaru no Go
Ranma 1/2 | Ranma
Dragon Quest: The Adventure of Dai | Dai no Daibouken | Dragon Quest
Boruto
Yuri on Ice | Yuri!!! on Ice
Free!
Lycoris Recoil
Kakegurui
Charlotte
Darling in the Franxx
Toilet-bound Hanako-kun | Hanako-kun
# rare
Serial Experiments Lain | Lain
Monster
Paranoia Agent
Mushishi
Ping Pong the Animation | Ping Pong
Texhnolyze
Ergo Proxy
Haibane Renmei
Kino's Journey | Kino no Tabi
Revolutionary Girl Utena | Utena
The Rose of Versailles | Rose of Versailles | Berusaiyu no Bara
Legend of the Galactic Heroes | LOGH | Ginga Eiyuu Densetsu
Planetes
Space Dandy
FLCL | Fooly Cooly
Baccano
Hyouka
Nichijou
Great Teacher Onizuka | GTO
Kaiji
Akagi
Golden Kamuy
Land of the Lustrous | Houseki no Kuni
Sonny Boy
Odd Taxi
Ranking of Kings | Ousama Ranking
Dorohedoro
Devilman Crybaby | Devilman
Major
Grand Blue
Barakamon
March Comes in Like a Lion | 3-gatsu no Lion | Sangatsu no Lion
Natsume's Book of Friends | Natsume Yuujinchou
Shirobako
Girls' Last Tour | Shoujo Shuumatsu Ryokou
Mononoke
The Tatami Galaxy | Tatami Galaxy | Yojouhan Shinwa Taikei
Kemono Friends
Space Brothers | Uchuu Kyoudai
Gankutsuou
Boogiepop Phantom | Boogiepop
Kaiba
Casshern Sins
Wolf's Rain
Witch Hunter Robin
Ghost Hunt
Shiki
Higurashi | Higurashi no Naku Koro ni | When They Cry
Umineko
Another
Elfen Lied
Gakkou Gurashi | School-Live
Bokurano
Aku no Hana | The Flowers of Evil
Penguindrum | Mawaru Penguindrum
Kaze ga Tsuyoku Fuiteiru | Run with the Wind
Ashita no Joe | Tomorrow's Joe
Candy Candy
Galaxy Express 999
Space Battleship Yamato | Star Blazers
Mazinger Z
Gatchaman | Science Ninja Team Gatchaman
Cutey Honey | Cutie Honey
Urusei Yatsura
Maison Ikkoku
City Hunter
Kimagure Orange Road
Saint Seiya | Knights of the Zodiac
Fist of the North Star | Hokuto no Ken
Dr. Slump | Dr Slump
`},

{ id: 'ghibli', name: 'Studio Ghibli films', prompt: 'Name a Studio Ghibli film',
  note: 'Theatrical features, plus Nausicaä. English or Japanese titles.',
  text: `
Spirited Away | Sen to Chihiro no Kamikakushi
My Neighbor Totoro | Totoro | Tonari no Totoro
Princess Mononoke | Mononoke Hime
Howl's Moving Castle | Howl | Hauru no Ugoku Shiro
Kiki's Delivery Service | Kiki | Majo no Takkyuubin
Ponyo | Ponyo on the Cliff by the Sea | Gake no Ue no Ponyo
Castle in the Sky | Laputa | Tenkuu no Shiro Laputa
Grave of the Fireflies | Hotaru no Haka
Nausicaä of the Valley of the Wind | Nausicaa | Kaze no Tani no Nausicaa
The Boy and the Heron | How Do You Live | Kimitachi wa Dou Ikiru ka
# uncommon
Porco Rosso | Kurenai no Buta
Whisper of the Heart | Mimi wo Sumaseba
The Wind Rises | Kaze Tachinu
Arrietty | The Secret World of Arrietty | Karigurashi no Arrietty
The Cat Returns | Neko no Ongaeshi
Pom Poko | Heisei Tanuki Gassen Ponpoko
When Marnie Was There | Omoide no Marnie
The Tale of the Princess Kaguya | Princess Kaguya | Kaguya-hime no Monogatari
Tales from Earthsea | Gedo Senki
# rare
Only Yesterday | Omoide Poro Poro
From Up on Poppy Hill | Kokuriko-zaka kara
Ocean Waves | Umi ga Kikoeru
My Neighbors the Yamadas | Hohokekyo Tonari no Yamada-kun
Earwig and the Witch | Aya to Majo
The Red Turtle
`},
];
