Tole je večino robot napisu. Tko da še navodila od mene.

Glej README.md za kaj se izvaja.

- ko piše: ```bash takrat izvajaš komande v terminalu.
Pazi da si v tem folderju kjer je ta file. Zame: C:\Users\anze\Desktop\projects\investment-game
(file je v: C:\Users\anze\Desktop\projects\investment-game\ANZE.md)

- Rabiš Node. kar instaliraj zadnjo verzijo. https://nodejs.org/en

- Ko imaš node v terminalu zaženeš
```bash
npm run install
```

Za razvijanje uporabljaj točko 3. iz README:
Running Frontend or Backend Separately

Odpreš dva terminala in zaženeš:
V prvem:
```bash
npm run start:backend
```

Ko se be izpisalo tole, takrat server dela:
Server running at http://localhost:4000
Connected to SQLite database

V drugem:
```bash
npm run start:frontend
```
Ko se izpiše tole takrat frontend dela:
webpack 5.99.6 compiled successfully in 11147 ms

> Oba terminala moraš imeti prižgana, da stvar deluje.
> Če se ne bo na root folder (ista mapa kjer je ta file) ustvarila mapa db, potem jo moraš mogoče ustvariti sam. To je mogoče razlog da kaj ni delalo, če kaj ni delalo :)

V browserju odpreš http://localhost:3000/

Ctrl + Shift + I - odpre se ti devtools in v
zavihku network lahko vidiš klice na server.

Od sedaj dalje vse knjižnice, ki jih uporabljaš installiraš z NPM.
V bistvu najdeš ime knjižnice in najdeš njeno NPM stran.
Potem pa rečeš ```npm install {ime-knjižnice}```.

V `package.json` se pojavijo installirane knjižnice v "dependencies" in "devDependencies". To je samo v vednost ne rabiš nič spreminjat.

Uporablja se typescript, ki je v bistvu javascript samo da ima tipe. Res ni nič težjega kot javascript, in robot ga itak zna.

Vsi ti config fili na root niso nekaj pomembni. Koda je v `src`

Za frontend boš videl, da je isto kar si ti napisal, samo pometal
sem funckije v module.

Razlika je da Actions ne računajo same, ampak kličejo backend. V backend/routes lahko dodajaš nove funkcije samo ne pozabi jih dodati v backend/routes/index.ts.

V read-write je pogovor z bazo. Če bi se kasneje odločil spremeniti bazo
zamenjaš ta module.

Za pregled SQLite baze si lahko downloadš DBeaver in odpreš mapo v `db/investment.db`. Navodila: https://dbeaver.com/docs/dbeaver/Database-driver-SQLite/

