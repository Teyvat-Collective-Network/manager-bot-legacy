export const CHARACTER_NAMES = `
albedo      | Albedo
alhaitham   | Al Haitham
aloy        | Aloy
amber       | Amber
ayaka       | Kamisato Ayaka
ayato       | Kamisato Ayato
barbara     | Barbara
beidou      | Beidou
bennett     | Bennett
childe      | Tartaglia
chongyun    | Chongyun
collei      | Collei
cyno        | Cyno
dainsleif   | Dainsleif
diluc       | Diluc
diona       | Diona
dori        | Dori
eula        | Eula
fischl      | Fischl
ganyu       | Ganyu
gorou       | Gorou
heizou      | Shikanoin Heizou
hutao       | Hu Tao
itto        | Arataki Itto
jean        | Jean
kaeya       | Kaeya
kandake     | Candace
kaveh       | Kaveh
kazuha      | Kaedehara Kazuha
keqing      | Keqing
klee        | Klee
kokomi      | Sangonomiya Kokomi
lisa        | Lisa
mika        | Mika
mona        | Mona
nahida      | Kusanali
nilou       | Nilou
ningguang   | Ningguang
noelle      | Noelle
qiqi        | Qiqi
raiden      | Raiden Shogun
razor       | Razor
rosaria     | Rosaria
sara        | Kujou Sara
sayu        | Sayu
scaramouche | Scaramouche
shenhe      | Shenhe
shinobu     | Shinobu
sucrose     | Sucrose
thoma       | Thoma
tighnari    | Tighnari
traveler    | Traveler
venti       | Venti
xiangling   | Xiangling
xiao        | Xiao
xingqiu     | Xingqiu
xinyan      | Xinyan
yae         | Yae Miko
yanfei      | Yanfei
yaoyao      | Yao Yao
yelan       | Yelan
yoimiya     | Yoimiya
yunjin      | Yun Jin
zhongli     | Zhongli
`.slice(1, -1).split('\n').map(n => n.split(/ *\| */));

export const AutoRoleType = {
  APIGuildToDiscord: 0,
  APIRoleToDiscord: 1,
  DiscordToAPIGuild: 2,
  DiscordToAPIRole: 3,
}